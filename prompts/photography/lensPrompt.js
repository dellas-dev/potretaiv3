// lensPrompt.js — Lens prompt mappings by category
// Source: LENSA_MAP in app.html (lines 1522-1529)
// select ID: pw-lensa (Prewedding tab only; other tabs use fixed 85mm f/1.4 in PromptBuilder)

export const lensPrompt = {

  prewedding: {
    // id="pw-lensa"
    "85mm f/1.4":        "85mm f/1.4 prime lens",
    "85mm f/1.2":        "85mm f/1.2 prime lens",
    "50mm f/1.2":        "50mm f/1.2 prime lens",
    "35mm f/1.4 Wide":   "35mm f/1.4 wide prime lens",
    "135mm f/1.8 Tele":  "135mm f/1.8 telephoto portrait lens",
    "70-200mm f/2.8":    "70-200mm f/2.8 telephoto zoom lens",
  },

  wedding: {
    // Wedding uses fixed "85mm f/1.4" in PromptBuilder.buildWedding
    "85mm f/1.4": "85mm f/1.4 prime lens",
  },

  engagement: {
    // Engagement uses fixed "85mm f/1.4" in PromptBuilder.buildEngagement
    "85mm f/1.4": "85mm f/1.4 prime lens",
  },

  studio: {
    // Studio uses fixed "85mm f/1.4" in PromptBuilder.buildStudio
    "85mm f/1.4": "85mm f/1.4 prime lens",
  },

  family: {
    // Family uses fixed "50mm f/2.0" in PromptBuilder.buildFamily
    "50mm f/2.0": "50mm f/2.0 prime lens",
  },

};
