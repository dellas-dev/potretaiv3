// outfitPrompt.js — Outfit prompt mappings by category and gender
// Source: OUTFIT_MAP in app.html (lines 1345-1401)
// select IDs: pw-outfit-pria, pw-outfit-wanita, wd-outfit-pria, wd-outfit-wanita,
//             en-outfit-pria, en-outfit-wanita, st-outfit-pria, st-outfit-wanita, fm-outfit

export const outfitPrompt = {

  prewedding: {
    male: {
      // id="pw-outfit-pria" — select options: white_linen, batik_formal, suit_beige, casual_denim, all_black, baju_koko
      "Kemeja Putih Linen + Celana Khaki": "wearing white linen shirt, tailored khaki trousers, brown leather loafers",
      "Batik Premium + Celana Hitam":       "wearing premium batik shirt, tailored dark trousers, leather shoes",
      "Jas Beige Modern":                   "wearing modern beige suit, white dress shirt, no tie, minimalist",
      "Casual Denim Smart":                 "wearing denim jacket, white shirt, slim dark jeans, clean sneakers",
      "All Black Minimalis":                "wearing all black outfit, black shirt, black trousers, minimal powerful",
      "Baju Koko Elegan":                   "wearing elegant embroidered baju koko, tailored trousers, peci",
    },
    female: {
      // id="pw-outfit-wanita" — select options: champagne_chiffon, kebaya_modern, boho_lace, all_white, hijab_elegant, kebaya_bali
      "Gaun Chiffon Champagne": "wearing champagne chiffon maxi dress, flowing elegant, soft ruffles",
      "Kebaya Modern":          "wearing modern kebaya, contemporary Indonesian fashion, elegant",
      "Boho Lace Maxi Dress":   "wearing bohemian lace maxi dress, flowy romantic, boho chic",
      "All White Elegan":       "wearing all-white matching outfit, white flowing dress, elegant minimal",
      "Hijab Syar'i Elegan":    "wearing elegant hijab syar'i, white gamis long dress, graceful",
      "Kebaya Bali":            "wearing Balinese kebaya, songket fabric, traditional gold accessories",
    },
  },

  wedding: {
    male: {
      // id="wd-outfit-pria" — select options: black_tux_premium, white_tux, beskap_jawa, baju_koko_penganten, suit_navy, barong
      "Tuxedo Hitam Premium":     "black premium tuxedo, white dress shirt, silk bow tie, patent shoes",
      "Tuxedo Putih Elegan":      "white elegant tuxedo, sophisticated ivory dress shirt, black trousers",
      "Beskap Jawa Tradisional":  "traditional Javanese beskap resmi, blangkon, kain batik, pengantin adat",
      "Baju Koko Pengantin":      "elegant baju koko pengantin, white embroidered, Islamic wedding formal",
      "Jas Navy Klasik":          "classic navy wedding suit, white dress shirt, tie, polished shoes",
      "Barong Bali":              "Balinese barong formal attire, elegant traditional dress, wedding ceremony",
    },
    female: {
      // id="wd-outfit-wanita" — select options: white_aline, ball_gown, kebaya_encim_wed, kebaya_bali_bridal, hijab_pengantin, gaun_mermaid
      "Gaun Putih A-Line + Veil":  "white bridal gown A-line, flowing elegant train, lace detail, veil",
      "Princess Ball Gown":        "princess ball gown, full skirt, strapless, crystal beading, cathedral veil",
      "Kebaya Encim Pengantin":    "kebaya encim pengantin, white lace kebaya, batik kain, traditional elegant",
      "Kebaya Bali Bridal":        "Balinese bridal kebaya, gold songket, traditional headpiece, payas agung",
      "Hijab Pengantin Syar'i":    "elegant bridal hijab syar'i, white lace long dress, graceful modest bridal",
      "Gaun Mermaid":              "mermaid bridal gown, fitted silhouette, flared skirt, elegant figure",
    },
  },

  engagement: {
    male: {
      // id="en-outfit-pria" — select options: casual_linen, denim_smart, polo_casual, korea_street
      "Linen Shirt Beige + Chinos": "casual linen shirt light beige, relaxed chinos, loafers, relaxed smart",
      "Denim Smart Casual":         "denim jacket smart casual, white shirt, slim dark jeans, clean sneakers",
      "Polo Shirt Pastel":          "polo shirt pastel color, chinos tailored, casual refined",
      "Korean Street Style":        "Korean street style, oversized hoodie, baggy pants, trendy casual",
    },
    female: {
      // id="en-outfit-wanita" — select options: flowy_midi, casual_chic, sundress, korean_casual
      "Flowy Midi Dress Floral": "flowy midi dress soft floral print, light feminine casual",
      "Casual Chic Korean":      "casual chic top and skirt, modern Korean fashion, stylish",
      "Sundress Colorful":       "sundress floral colorful, summer casual, light and fresh",
      "Korean Casual Pastel":    "Korean casual fashion, pastel colors, oversized fit, trendy",
    },
  },

  studio: {
    male: {
      // id="st-outfit-pria" — select options: korean_fashion, business_formal, batik_premium, all_black, all_white
      "Korean Minimal Turtleneck": "Korean fashion minimal grey turtleneck slim cut, clean modern",
      "Business Formal":           "business formal navy suit, white shirt, tie, polished professional",
      "Batik Premium":             "premium batik shirt contemporary print, dark trousers, Indonesian elegant",
      "All Black Minimalis":       "all black outfit, black shirt, black trousers, minimal powerful",
      "All White Clean":           "all white outfit, white shirt, white trousers, clean minimal",
    },
    female: {
      // id="st-outfit-wanita" — select options: evening_gown, korean_fashion, batik_modern, editorial, casual_chic
      "Evening Gown Navy":       "evening gown deep navy blue strapless pleated bodice, sophisticated",
      "Korean Fashion Cream":    "Korean fashion minimal grey turtleneck slim cut, clean modern",
      "Batik Modern":            "modern batik dress contemporary cut, Indonesian fashion forward",
      "Editorial High Fashion":  "editorial fashion outfit, avant-garde, high fashion conceptual",
      "Casual Chic":             "casual chic top and skirt, modern Korean fashion, stylish",
    },
  },

  family: {
    // id="fm-outfit" — select options: white_beige, earth_tone, batik_keluarga, busana_muslim, formal, casual_modern, adat_jawa, adat_bali
    "White & Beige Elegan":       "white and beige coordinated family outfits, soft elegant matching",
    "Earth Tone Natural":         "earth tone natural coordinated outfits, warm brown and terracotta",
    "Batik Keluarga":             "Indonesian batik family outfits, coordinated motif, cultural pride",
    "Busana Muslim Keluarga":     "busana muslim keluarga, white and soft coordinated modest fashion",
    "Formal Semi-Formal":         "formal semi-formal outfits, suits and dresses, classic family portrait",
    "Casual Modern Lifestyle":    "casual modern coordinated outfits, jeans and tops, relaxed lifestyle",
    "Adat Jawa Tradisional":      "traditional Javanese adat outfits, beskap and kebaya, heritage",
    "Adat Bali":                  "traditional Balinese adat outfits, songket and kebaya, ceremony wear",
  },

};
