// locationPrompt.js — Location/venue prompt mappings by category
// Source: LOCATION_MAP in app.html (lines 1403-1443)
// select IDs: pw-lokasi, wd-venue, en-lokasi, fm-tema (background)

export const locationPrompt = {

  prewedding: {
    // id="pw-lokasi" — grouped by region
    // Indonesia group
    "Pura Lempuyang (Gates of Heaven), Bali": "iconic split gate Candi Bentar framing Mount Agung, mystical reflection pool, Pura Lempuyang Bali",
    "Tegallalang Rice Terrace, Ubud":         "emerald green rice terraces, palm trees, Tegallalang Ubud Bali",
    "Tebing Uluwatu, Bali":                   "dramatic limestone cliff over Indian Ocean, Uluwatu temple silhouette, Bali",
    "Pink Beach, Lombok":                     "pristine Pink Beach Lombok, turquoise water, white sand, dramatic hills",
    "Candi Borobudur, Jogjakarta":            "ancient Buddhist Borobudur temple complex, misty morning, sunrise stupa detail",
    "Raja Ampat, Papua Barat":                "crystal clear turquoise lagoon, dramatic limestone karst islands, Raja Ampat Papua",
    "Gunung Bromo, Jawa Timur":              "dramatic volcanic Mount Bromo crater, ash plain, mystical mist at sunrise",
    // Asia group
    "Santorini, Yunani":                      "iconic white Santorini buildings, blue dome church, Aegean Sea cliff view",
    "Eiffel Tower, Paris":                    "Champ de Mars park with Eiffel Tower background, Paris golden hour",
    "Sakura Park, Tokyo":                     "Ueno Park full sakura bloom, pink cherry blossom canopy, Tokyo spring",
    "Bamboo Forest, Kyoto":                   "towering bamboo grove path, filtered sunlight, Arashiyama Kyoto",
    "Maldives Overwater Villa":               "overwater bungalow, crystal turquoise Indian Ocean, white sand sandbank",
    "Phi Phi Islands, Thailand":              "dramatic Phi Phi island limestone karst, emerald green water, Thailand",
    // Eropa group
    "Kanal Venezia, Italia":                  "romantic gondola canal Grande, historic Venetian architecture, Italy",
    "Bukit Tuscany, Italia":                  "rolling Tuscan hills, cypress tree avenue, golden wheat fields, Italy",
    "Pantai Amalfi, Italia":                  "colorful Amalfi Coast cliffside villages, Mediterranean Sea, Italy",
    "Old Town Prague, Ceko":                  "Old Town Square Prague, baroque architecture, cobblestone, Czech Republic",
    "Colosseum, Roma":                        "ancient Roman Colosseum iconic exterior, golden sunset, Rome Italy",
  },

  wedding: {
    // id="wd-venue"
    "Uluwatu Cliff Edge, Bali":  "Uluwatu Cliff Edge dramatic limestone cliff over Indian Ocean, sunset ceremony",
    "AYANA Rock Bar, Bali":      "AYANA Rock Bar cliff terrace, infinity pool, Indian Ocean panorama, Bali",
    "White Chapel Garden":       "white chapel outdoor garden, romantic floral decor, soft light",
    "Grand Ballroom Mewah":      "luxury grand ballroom, crystal chandelier, marble floor, elegant reception",
    "Outdoor Garden Romantic":   "outdoor botanical garden ceremony, lush greenery, floral arch",
    "Beach Ceremony Sunset":     "beachfront ceremony, white sand, ocean backdrop, sunset glow",
  },

  engagement: {
    // id="en-lokasi"
    "Cafe Cozy Menteng, Jakarta":       "cozy cafe interior warm wood tones, bookshelves ambient light, Menteng Jakarta",
    "Bali Swing Tegallalang":           "lush jungle Tegallalang swing, tropical green forest valley, Bali",
    "Kebun Raya Bogor":                 "lush tropical botanical garden, giant trees, historic greenhouse, Kebun Raya Bogor",
    "Pantai Selong Belanak, Lombok":    "pristine white sand Selong Belanak beach, turquoise water, Lombok",
    "Harajuku Street, Tokyo":           "Harajuku Takeshita Street, colorful street fashion, Tokyo Japan",
    "Sidewalk Cafe, Paris":             "classic Parisian sidewalk cafe, iron bistro chairs, cobblestone street",
  },

  family: {
    // id="fm-tema" — studio/background themes
    "Luxury White Studio":  "luxury white seamless studio, flawless bright backdrop, high-end fashion",
    "Lifestyle Home Studio": "lifestyle studio set, natural indoor home aesthetic, lived-in warmth",
    "Penthouse View":       "penthouse lifestyle studio, floor-to-ceiling windows, city skyline view",
    "Outdoor Garden":       "outdoor garden, soft natural light, lush green botanical backdrop",
    "Concrete Minimalis":   "minimalist concrete studio, raw industrial grey, modern editorial",
    "Warm Wooden Studio":   "warm wooden studio, natural timber tones, cozy family atmosphere",
  },

};
