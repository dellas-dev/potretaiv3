// expressionPrompt.js — Expression/mood prompt mappings by category
// Source: EKSPRESI_MAP in app.html (lines 1481-1490)
// select IDs: pw-ekspresi, st-ekspresi
// (wedding and engagement expressions are inline in buildWedding/buildEngagement)

export const expressionPrompt = {

  prewedding: {
    // id="pw-ekspresi"
    "Saling Tatap Penuh Cinta": "deeply in love expression, soulful romantic gaze, tender emotion",
    "Tawa Candid":              "genuine candid laughter, joyful smile, real natural moment",
    "Dreamy Romantis":          "dreamy faraway gaze, soft romantic expression, ethereal mood",
    "Elegan Serius":            "elegant serious expression, confident composed, editorial look",
    "Playful Natural":          "playful natural expression, fun lighthearted, genuine smile",
  },

  wedding: {
    // Wedding expression is fixed in PromptBuilder.buildWedding as "deeply in love expression soulful romantic gaze"
    // These represent the natural expression range for bridal portraits
    "Deeply In Love":   "deeply in love expression, soulful romantic gaze, tender emotion",
    "Pure Bliss":       "pure bliss expression, overwhelming joy, radiant happy smile, glowing",
    "Elegant Serene":   "elegant serene expression, graceful bridal composure, soft warmth",
  },

  engagement: {
    // Engagement expression is fixed in PromptBuilder.buildEngagement as "candid natural expression"
    // These represent the natural expression range for engagement sessions
    "Candid Natural":   "candid natural expression, relaxed genuine, approachable warmth",
    "Joyful Happy":     "genuine candid laughter, joyful smile, real natural moment",
    "Tender Romantic":  "deeply in love expression, soulful romantic gaze, tender emotion",
  },

  studio: {
    // id="st-ekspresi"
    "Elegan & Percaya Diri": "elegant serious expression, confident composed, editorial look",
    "Professional":          "professional confident expression, strong direct gaze",
    "Soft Natural":          "soft natural expression, relaxed genuine, approachable warmth",
    "Intense Editorial":     "intense editorial expression, high fashion serious, powerful gaze",
    "Candid Smile":          "genuine candid laughter, joyful smile, real natural moment",
  },

};
