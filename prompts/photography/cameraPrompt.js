// cameraPrompt.js — Camera prompt mappings by category
// Source: KAMERA_MAP in app.html (lines 1514-1520)
// select IDs: pw-kamera, wd-kamera, st-kamera, fm-kamera

export const cameraPrompt = {

  prewedding: {
    // id="pw-kamera"
    "Sony A7R V":       "shot on Sony A7R V",
    "Canon EOS R5":     "shot on Canon EOS R5",
    "Fujifilm GFX 100S": "shot on Fujifilm GFX 100S",
    "Hasselblad X2D":   "shot on Hasselblad X2D",
    "Nikon Z9":         "shot on Nikon Z9",
  },

  wedding: {
    // id="wd-kamera"
    "Canon EOS R5":      "shot on Canon EOS R5",
    "Sony A7R V":        "shot on Sony A7R V",
    "Fujifilm GFX 100S": "shot on Fujifilm GFX 100S",
    "Hasselblad X2D":    "shot on Hasselblad X2D",
  },

  engagement: {
    // engagement uses fixed "shot on Sony A7R V" in buildEngagement — no dropdown in UI
    "Sony A7R V": "shot on Sony A7R V",
  },

  studio: {
    // id="st-kamera"
    "Hasselblad X2D":    "shot on Hasselblad X2D",
    "Sony A7R V":        "shot on Sony A7R V",
    "Fujifilm GFX 100S": "shot on Fujifilm GFX 100S",
    "Canon EOS R5":      "shot on Canon EOS R5",
  },

  family: {
    // id="fm-kamera"
    "Canon EOS R5":      "shot on Canon EOS R5",
    "Sony A7R V":        "shot on Sony A7R V",
    "Fujifilm GFX 100S": "shot on Fujifilm GFX 100S",
  },

};
