// timePrompt.js — Time of day / lighting condition prompt mappings by category
// Source: WAKTU_MAP in app.html (lines 1445-1452)
// select IDs: pw-waktu, wd-waktu, en-waktu

export const timePrompt = {

  prewedding: {
    // id="pw-waktu"
    "Golden Hour":      "golden hour, warm golden sunlight, long soft shadows",
    "Blue Hour":        "blue hour, cool blue twilight, soft diffused light",
    "Sunset Dramatis":  "dramatic sunset, orange and pink sky, warm rim light",
    "Pagi Lembut":      "soft morning light, gentle sunrise glow, fresh atmosphere",
    "Mendung Dreamy":   "overcast cloudy sky, soft diffused natural light, no harsh shadows",
    "Malam Romantis":   "romantic night setting, city lights bokeh, warm ambient light",
  },

  wedding: {
    // id="wd-waktu"
    "Golden Hour":      "golden hour, warm golden sunlight, long soft shadows",
    "Sunset Dramatis":  "dramatic sunset, orange and pink sky, warm rim light",
    "Blue Hour":        "blue hour, cool blue twilight, soft diffused light",
    "Pagi Segar":       "soft morning light, gentle sunrise glow, fresh atmosphere",
  },

  engagement: {
    // id="en-waktu"
    "Golden Hour":      "golden hour, warm golden sunlight, long soft shadows",
    "Pagi Lembut":      "soft morning light, gentle sunrise glow, fresh atmosphere",
    "Mendung Dreamy":   "overcast cloudy sky, soft diffused natural light, no harsh shadows",
    "Blue Hour":        "blue hour, cool blue twilight, soft diffused light",
  },

};
