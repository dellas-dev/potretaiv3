#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PotretAI — Cloudflare Worker Full Setup Script  v3.3
#
# Menyelesaikan SEMUA placeholder di wrangler.toml secara otomatis:
#   ✓ 9 KV namespaces  → buat + auto-patch wrangler.toml
#   ✓ 3 R2 buckets     → buat
#   ✓ 1 Queue          → buat
#   ✓ 3 Secrets        → prompt + simpan terenkripsi
#   ✓ R2_CDN_BASE      → panduan enable public access
#   ✓ wrangler deploy  → deploy worker ke Cloudflare
#
# Cara pakai:
#   cd cloudflare-worker
#   chmod +x setup.sh
#   ./setup.sh
#
# Prasyarat:
#   npm install -g wrangler
#   wrangler login
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── ANSI colours ──────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

ok()    { echo -e "  ${GREEN}✓${NC} $*"; }
warn()  { echo -e "  ${YELLOW}⚠${NC}  $*"; }
err()   { echo -e "  ${RED}✗${NC} $*"; }
info()  { echo -e "  ${CYAN}→${NC} $*"; }
step()  { echo -e "\n${BOLD}$*${NC}"; }
sep()   { echo -e "${DIM}────────────────────────────────────────────────────${NC}"; }

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: patch_toml  <placeholder>  <real_id>
# Replaces the first occurrence of placeholder with real_id in wrangler.toml.
# Compatible with both macOS (BSD sed) and Linux (GNU sed).
# ─────────────────────────────────────────────────────────────────────────────
patch_toml() {
  local placeholder="$1"
  local real_id="$2"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/${placeholder}/${real_id}/" wrangler.toml
  else
    sed -i "s/${placeholder}/${real_id}/" wrangler.toml
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: extract_kv_id  <wrangler_output>
# Parses the KV ID from wrangler kv:namespace create output.
# Handles all known wrangler output formats (old TOML, new JSON, bare hex).
# ─────────────────────────────────────────────────────────────────────────────
extract_kv_id() {
  local output="$1"
  local id=""

  # Format: id = "abc123"  (old wrangler TOML snippet)
  id=$(echo "$output" | grep -oE 'id = "[a-f0-9]+"' | grep -oE '[a-f0-9]{32}' | head -1 || true)
  [[ -n "$id" ]] && { echo "$id"; return; }

  # Format: "id":"abc123"  (wrangler v3 JSON)
  id=$(echo "$output" | grep -oE '"id":"[a-f0-9]+"' | grep -oE '[a-f0-9]{32}' | head -1 || true)
  [[ -n "$id" ]] && { echo "$id"; return; }

  # Fallback: any 32-char hex string
  id=$(echo "$output" | grep -oE '[a-f0-9]{32}' | head -1 || true)
  echo "$id"
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: create_kv  <BINDING_NAME>  <placeholder_in_toml>
# Creates a KV namespace and auto-patches wrangler.toml.
# Skips gracefully if the namespace already exists.
# ─────────────────────────────────────────────────────────────────────────────
create_kv() {
  local name="$1"
  local placeholder="$2"

  # Skip if the placeholder is already replaced (re-run safety)
  if ! grep -q "$placeholder" wrangler.toml 2>/dev/null; then
    ok "${name} — ID already set, skipping."
    return
  fi

  local output
  output=$(wrangler kv:namespace create "$name" 2>&1) || true

  # Already exists → fetch existing ID
  if echo "$output" | grep -qi "already exists"; then
    warn "${name} already exists — fetching existing ID..."
    local list_output
    list_output=$(wrangler kv:namespace list 2>&1)
    local existing_id
    existing_id=$(echo "$list_output" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for ns in data:
    if ns.get('title') == '${name}':
        print(ns.get('id',''))
        break
" 2>/dev/null || echo "")

    if [[ -n "$existing_id" ]]; then
      patch_toml "$placeholder" "$existing_id"
      ok "${name} — ID patched: ${existing_id}"
    else
      warn "${name} — Could not auto-fetch existing ID."
      prompt_manual_id "$name" "$placeholder"
    fi
    return
  fi

  local kv_id
  kv_id=$(extract_kv_id "$output")

  if [[ -n "$kv_id" ]]; then
    patch_toml "$placeholder" "$kv_id"
    ok "${name} — created and patched: ${kv_id}"
  else
    warn "${name} — could not parse ID from output."
    echo "$output"
    prompt_manual_id "$name" "$placeholder"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: prompt_manual_id  <name>  <placeholder>
# Falls back to asking the user to paste the ID manually.
# ─────────────────────────────────────────────────────────────────────────────
prompt_manual_id() {
  local name="$1"
  local placeholder="$2"
  echo ""
  read -rp "  Paste ID untuk ${name} (atau Enter untuk skip): " manual_id
  if [[ -n "$manual_id" ]]; then
    patch_toml "$placeholder" "$manual_id"
    ok "${name} — ID patched manually: ${manual_id}"
  else
    warn "${name} — SKIPPED. Patch wrangler.toml secara manual sebelum deploy."
    MISSING_IDS+=("$name")
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: create_r2  <bucket_name>
# ─────────────────────────────────────────────────────────────────────────────
create_r2() {
  local bucket="$1"
  local output
  output=$(wrangler r2 bucket create "$bucket" 2>&1) || true
  if echo "$output" | grep -qi "already exists\|already been created"; then
    ok "R2 bucket '${bucket}' — already exists, skipping."
  else
    ok "R2 bucket '${bucket}' — created."
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Track items that still need manual action after the script
# ─────────────────────────────────────────────────────────────────────────────
MISSING_IDS=()

# ═════════════════════════════════════════════════════════════════════════════
# BANNER
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║        PotretAI — Cloudflare Full Setup  v3.3            ║${NC}"
echo -e "${BOLD}${CYAN}║   9 KV · 3 R2 · 1 Queue · 3 Secrets · Deploy            ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# PRE-CHECK
# ─────────────────────────────────────────────────────────────────────────────
step "[PRE-CHECK] Wrangler CLI & auth"
sep

if ! command -v wrangler &>/dev/null; then
  err "wrangler tidak ditemukan. Install: npm install -g wrangler"
  exit 1
fi
ok "wrangler: $(wrangler --version 2>&1 | head -1)"

if ! wrangler whoami &>/dev/null; then
  err "Belum login. Jalankan: wrangler login"
  exit 1
fi
ok "Cloudflare: $(wrangler whoami 2>&1 | grep -i 'You are\|email\|account' | head -1 || echo 'authenticated')"

if [[ ! -f "wrangler.toml" ]]; then
  err "wrangler.toml tidak ditemukan. Jalankan script ini dari folder cloudflare-worker/."
  exit 1
fi
ok "wrangler.toml ditemukan."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — KV NAMESPACES (9 total)
# ─────────────────────────────────────────────────────────────────────────────
step "[1/5] Membuat KV Namespaces"
sep
info "Membuat 9 KV namespace dan auto-patch wrangler.toml..."
echo ""

create_kv "FACE_CACHE"      "GANTI_DENGAN_KV_NAMESPACE_ID_KAMU"
create_kv "USER_CREDITS"    "your-user-credits-kv-id"
create_kv "PAYMENT_ORDERS"  "your-payment-kv-id"
create_kv "RESULT_CACHE"    "your-result-cache-kv-id"
create_kv "AFFILIATE_DATA"  "your-affiliate-kv-id"
create_kv "RATE_LIMIT"      "your-rate-limit-kv-id"
create_kv "USAGE_ANALYTICS" "your-analytics-kv-id"
create_kv "HISTORY_KV"      "your-history-kv-id"
create_kv "SHARE_KV"        "your-share-kv-id"

echo ""
ok "KV setup selesai."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — R2 BUCKETS (3 total)
# ─────────────────────────────────────────────────────────────────────────────
step "[2/5] Membuat R2 Buckets"
sep
echo ""

create_r2 "potretai-faces"
create_r2 "generated-images"
create_r2 "payment-proofs"

echo ""
ok "R2 setup selesai."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — QUEUE
# ─────────────────────────────────────────────────────────────────────────────
step "[3/5] Membuat Queue 'potretai-generate'"
sep
echo ""

QUEUE_OUTPUT=$(wrangler queues create potretai-generate 2>&1) || true
if echo "$QUEUE_OUTPUT" | grep -qi "already exists"; then
  ok "Queue 'potretai-generate' — already exists, skipping."
else
  ok "Queue 'potretai-generate' — created."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — SECRETS (3 total)
# ─────────────────────────────────────────────────────────────────────────────
step "[4/5] Menyimpan Secrets"
sep
echo ""

info "Menyimpan FAL_KEY (fal.ai API key)..."
info "Dapatkan di: https://fal.ai/dashboard/keys"
echo ""
wrangler secret put FAL_KEY
echo ""
ok "FAL_KEY tersimpan."
echo ""

info "Menyimpan ADMIN_KEY (kunci admin /verify-payment)..."
info "Buat password acak yang kuat, simpan di tempat aman."
echo ""
wrangler secret put ADMIN_KEY
echo ""
ok "ADMIN_KEY tersimpan."
echo ""

info "Menyimpan TURNSTILE_SECRET (Cloudflare Turnstile)..."
info "Dapatkan di: Cloudflare Dashboard → Turnstile → Add Site → Domain: potretai.studiocreative.id"
echo ""
wrangler secret put TURNSTILE_SECRET
echo ""
ok "TURNSTILE_SECRET tersimpan."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — R2_CDN_BASE (requires manual Dashboard action)
# ─────────────────────────────────────────────────────────────────────────────
step "[5/5] R2 Public URL (R2_CDN_BASE)"
sep
echo ""

# Check if still placeholder
if grep -q "pub-GANTI_DENGAN_URL_R2_KAMU" wrangler.toml; then
  warn "R2_CDN_BASE masih menggunakan URL placeholder."
  echo ""
  echo -e "  ${BOLD}Langkah manual yang diperlukan:${NC}"
  echo "  ┌─────────────────────────────────────────────────────────────┐"
  echo "  │  1. Buka Cloudflare Dashboard → R2 → 'potretai-faces'       │"
  echo "  │  2. Tab 'Settings' → 'Public Access' → klik 'Allow Access'  │"
  echo "  │  3. Copy URL yang muncul, format: https://pub-XXXX.r2.dev   │"
  echo "  │  4. Paste URL di bawah ini                                  │"
  echo "  └─────────────────────────────────────────────────────────────┘"
  echo ""
  read -rp "  Paste R2 public URL (atau Enter untuk skip & patch manual nanti): " R2_URL

  if [[ -n "$R2_URL" ]]; then
    # Escape slashes for sed
    R2_URL_ESCAPED=$(echo "$R2_URL" | sed 's/[\/&]/\\&/g')
    PLACEHOLDER_ESCAPED="https:\/\/pub-GANTI_DENGAN_URL_R2_KAMU\.r2\.dev"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|https://pub-GANTI_DENGAN_URL_R2_KAMU\.r2\.dev|${R2_URL}|" wrangler.toml
    else
      sed -i "s|https://pub-GANTI_DENGAN_URL_R2_KAMU\.r2\.dev|${R2_URL}|" wrangler.toml
    fi
    ok "R2_CDN_BASE diupdate: ${R2_URL}"
  else
    warn "R2_CDN_BASE belum diset. Update wrangler.toml secara manual sebelum deploy."
    MISSING_IDS+=("R2_CDN_BASE")
  fi
else
  ok "R2_CDN_BASE sudah dikonfigurasi."
fi

# ─────────────────────────────────────────────────────────────────────────────
# VALIDATE wrangler.toml — cek apakah masih ada placeholder
# ─────────────────────────────────────────────────────────────────────────────
echo ""
sep
echo -e "${BOLD}Validasi wrangler.toml...${NC}"
echo ""

REMAINING_PLACEHOLDERS=$(grep -n "your-.*-kv-id\|GANTI_DENGAN\|your-share\|your-history\|your-rate\|your-analytics\|your-affiliate\|your-result\|your-payment\|your-user" wrangler.toml 2>/dev/null || true)

if [[ -n "$REMAINING_PLACEHOLDERS" ]]; then
  warn "Masih ada placeholder di wrangler.toml:"
  echo ""
  echo "$REMAINING_PLACEHOLDERS" | while IFS= read -r line; do
    echo -e "    ${RED}${line}${NC}"
  done
  echo ""
  warn "Deploy AKAN GAGAL jika placeholder ini tidak diisi."
  echo ""
  read -rp "  Lanjutkan deploy meskipun ada placeholder? [y/N]: " PROCEED
  if [[ ! "$PROCEED" =~ ^[Yy]$ ]]; then
    err "Deploy dibatalkan. Isi placeholder di wrangler.toml lalu jalankan: wrangler deploy"
    exit 1
  fi
else
  ok "Semua placeholder sudah terisi."
fi

# ─────────────────────────────────────────────────────────────────────────────
# DEPLOY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
sep
echo -e "${BOLD}Deploy worker ke Cloudflare...${NC}"
echo ""

wrangler deploy

# ─────────────────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║          ✓  PotretAI Worker berhasil di-deploy!          ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  API endpoint  : ${CYAN}https://api.potretai.studiocreative.id${NC}"
echo -e "  Health check  : ${CYAN}https://api.potretai.studiocreative.id/${NC}"
echo ""

if [[ ${#MISSING_IDS[@]} -gt 0 ]]; then
  echo -e "${YELLOW}${BOLD}⚠  Item yang masih perlu tindakan manual:${NC}"
  for item in "${MISSING_IDS[@]}"; do
    echo -e "   ${YELLOW}•${NC} ${item}"
  done
  echo ""
  echo "  Setelah mengisi semua item di atas, jalankan:"
  echo -e "  ${BOLD}wrangler deploy${NC}  (dari folder cloudflare-worker/)"
  echo ""
fi

echo -e "${BOLD}Langkah selanjutnya — Deploy Frontend:${NC}"
echo ""
echo -e "  ${CYAN}wrangler pages deploy ../frontend --project-name=potretai${NC}"
echo ""
echo -e "${BOLD}Verifikasi:${NC}"
echo ""
echo -e "  ${CYAN}curl https://api.potretai.studiocreative.id/${NC}"
echo -e "  # Expected: {\"status\":\"ok\",\"service\":\"PotretAI Worker\",...}"
echo ""
