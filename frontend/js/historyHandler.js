/**
 * frontend/js/historyHandler.js
 *
 * Handles loading and rendering of user generation history
 * on the dashboard page.
 *
 * Functions:
 *   loadUserHistory(user_id)     — fetches history from API, renders cards
 *   loadUserCredit(user_id)      — fetches credit balance, updates UI
 *   renderHistoryCards(history)  — builds and injects HTML cards
 */

import { API_BASE_URL } from './config.js';

// ─────────────────────────────────────────────────────────────────────────────
// loadUserHistory
// Fetches the latest 20 generation entries for the user and renders them.
// ─────────────────────────────────────────────────────────────────────────────
export async function loadUserHistory(user_id) {
  const grid    = document.getElementById('history-grid');
  const empty   = document.getElementById('history-empty');
  const loading = document.getElementById('history-loading');

  if (!grid) return;

  // Show skeleton
  if (loading) loading.style.display = 'grid';
  if (empty)   empty.style.display   = 'none';
  grid.innerHTML = '';

  try {
    const res  = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(user_id)}`);
    const data = await res.json();

    if (loading) loading.style.display = 'none';

    if (!Array.isArray(data.history) || data.history.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }

    renderHistoryCards(data.history, grid);
  } catch (err) {
    if (loading) loading.style.display = 'none';
    if (empty)   empty.style.display   = 'flex';
    console.error('[history] loadUserHistory error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// loadUserCredit
// Fetches credit balance and updates the credit display elements.
// ─────────────────────────────────────────────────────────────────────────────
export async function loadUserCredit(user_id) {
  try {
    const res    = await fetch(`${API_BASE_URL}/get-credit/${encodeURIComponent(user_id)}`);
    const credit = await res.json();

    const elPlan       = document.getElementById('credit-plan');
    const elRemaining  = document.getElementById('credit-remaining');
    const elCategories = document.getElementById('credit-categories');

    if (elPlan)       elPlan.textContent       = credit.plan         ? credit.plan.toUpperCase() : '—';
    if (elRemaining)  elRemaining.textContent  = credit.generates_remaining ?? '—';
    if (elCategories) elCategories.textContent = Array.isArray(credit.categories)
      ? credit.categories.join(', ')
      : '—';
  } catch (err) {
    console.error('[history] loadUserCredit error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// renderHistoryCards
// Builds history card HTML and appends to the grid container.
// ─────────────────────────────────────────────────────────────────────────────
function renderHistoryCards(history, grid) {
  history.forEach((entry) => {
    const date = entry.created_at
      ? new Date(entry.created_at * 1000).toLocaleDateString('id-ID', {
          day:   '2-digit',
          month: 'short',
          year:  'numeric',
          hour:  '2-digit',
          minute:'2-digit',
        })
      : '—';

    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card__img-wrap">
        <img
          src="${sanitizeUrl(entry.image_url)}"
          alt="Generated photo"
          loading="lazy"
          onerror="this.src='https://placehold.co/400x500/1E2A2F/A7B0B5?text=PotretAI'"
        >
      </div>
      <div class="history-card__body">
        <span class="history-card__date">${date}</span>
        <div class="history-card__actions">
          <a
            class="history-card__btn history-card__btn--primary"
            href="${sanitizeUrl(entry.image_url)}"
            download="potretai-${entry.created_at || 'photo'}.jpg"
            title="Download foto"
          >⬇ Download</a>
          <a
            class="history-card__btn history-card__btn--secondary"
            href="${sanitizeUrl(entry.share_url)}"
            target="_blank"
            rel="noopener noreferrer"
            title="Bagikan foto"
          >↗ Share</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeUrl — only allow https:// URLs to prevent XSS via javascript: etc.
// ─────────────────────────────────────────────────────────────────────────────
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? url : '#';
  } catch {
    return '#';
  }
}
