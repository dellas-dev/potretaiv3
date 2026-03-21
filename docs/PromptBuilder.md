# PromptBuilder.md — PotretAI v3
*AI Prompt Construction System · Version 3.0 · Full English*
*Research-based: Pinterest, Google, Korean Studio, Indonesia 2024-2025 trends*

---

## 1. Core Principles

| Rule | Description |
|------|-------------|
| 1 | Prompt NEVER shown to user under any circumstances |
| 2 | All prompt construction happens entirely inside PromptBuilder |
| 3 | AUTO_MODIFIERS always injected at end of every prompt |
| 4 | User selects parameters — never writes prompts directly |
| 5 | Custom user inputs sanitized before entering prompt |
| 6 | ALL prompts in English — Indonesian dropdown labels translated internally |
| 7 | JSON structure used internally, compiled to string for API |

---

## 2. Global Constants

```javascript
const AUTO_MODIFIERS = `ultra realistic, photorealistic, 8k resolution, professional photography, sharp focus, high detail skin texture, cinematic lighting, natural lighting, depth of field, bokeh, professional lens, full frame camera, RAW photo, HDR, realistic skin tones, no text, no watermark, no logo`;

const CATEGORY_MODIFIERS = {
  wisuda:     `graduation photography, academic achievement, milestone portrait, proud graduation moment, university graduate`,
  profesional:`professional headshot photography, corporate portrait, personal branding, clean studio quality, professional confidence`,
  maternity:  `maternity photography, pregnancy portrait, glowing mother-to-be, beautiful bump, celebrating motherhood, 7-9 months pregnant`,
  studio_korea:`Korean studio photography, K-drama aesthetic, studio portrait, clean minimalist Korean style, beauty editorial`,
  prewedding: `romantic couple photography, love story session, prewedding editorial, soft romantic atmosphere, genuine connection`,
  wedding:    `wedding photography, bridal portrait, elegant ceremony, luxury wedding editorial, timeless romantic`,
};
```

---

## 3. JSON Prompt Structure

```javascript
// Standard JSON structure for all menus
const PromptJSON = {
  subject:             String,  // ethnicity + gender description
  outfit:              String,  // clothing detail
  location:            String,  // location name
  background_detail:   String,  // detailed background description
  pose:                String,  // body pose description
  shot_type:           String,  // framing (full body, 3/4, close-up, etc.)
  expression:          String,  // facial expression
  lighting:            String,  // lighting setup
  atmosphere:          String,  // mood and environment
  lens:                String,  // lens focal length and aperture
  camera:              String,  // camera model
  color_grade:         String,  // color treatment
  style:               String,  // photography style
  props:               String,  // props and accessories (optional)
  category_modifier:   String,  // from CATEGORY_MODIFIERS
  auto_modifiers:      String,  // from AUTO_MODIFIERS
};

// Compile function
function compilePrompt(json) {
  const parts = [
    json.subject,
    json.pose,
    json.outfit,
    json.background_detail,
    json.lighting,
    json.atmosphere,
    json.expression,
    json.shot_type,
    json.style,
    json.color_grade,
    json.camera,
    json.lens,
    json.props,
    json.category_modifier,
    json.auto_modifiers,
  ].filter(Boolean);
  return parts.join(', ');
}
```

---

## 4. Ethnicity / Appearance Map

```javascript
const SUBJECT_MAP = {
  // Female
  'indonesian_f':   'beautiful Indonesian woman, warm golden skin, dark lustrous hair',
  'javanese_f':     'beautiful Javanese woman, graceful refined features, warm complexion',
  'sundanese_f':    'beautiful Sundanese woman, fair skin, delicate elegant features',
  'batak_f':        'beautiful Batak Indonesian woman, strong confident features, warm tone',
  'minang_f':       'beautiful Minangkabau woman, warm skin, graceful features',
  'balinese_f':     'beautiful Balinese woman, warm tan skin, striking elegant features',
  'chinese_indo_f': 'beautiful Chinese-Indonesian woman, fair porcelain skin, elegant',
  'korean_f':       'beautiful Korean woman, fair dewy skin, K-beauty natural makeup',
  'sea_f':          'beautiful Southeast Asian woman, warm tan skin, graceful',
  'caucasian_f':    'beautiful Caucasian woman, fair skin, natural features',
  // Male
  'indonesian_m':   'handsome Indonesian man, warm skin tone, dark neat hair',
  'javanese_m':     'handsome Javanese man, refined features, warm complexion',
  'korean_m':       'handsome Korean man, fair clean skin, K-drama style',
  'chinese_indo_m': 'handsome Chinese-Indonesian man, fair skin, sharp features',
  'sea_m':          'handsome Southeast Asian man, warm tan skin',
  'caucasian_m':    'handsome Caucasian man, fair skin, confident features',
};
```

---

## 5. MENU: WISUDA (Graduation)

### 5.1 Graduation Outfit — Female (25 options)

```javascript
const WISUDA_OUTFIT_FEMALE = {
  // Standard Academic Attire
  'toga_black_hijab':       'wearing black graduation toga gown, mortarboard cap, white hijab, neat professional appearance',
  'toga_black_hair_down':   'wearing black graduation toga gown, mortarboard cap, elegant hair down with soft waves',
  'toga_black_hair_up':     'wearing black graduation toga gown, mortarboard cap, neat elegant updo hairstyle',
  'toga_black_kebaya':      'wearing black graduation toga over white kebaya, Indonesian academic elegance',
  'toga_black_dress_white': 'wearing black graduation toga over white dress underneath, fresh clean look',
  'toga_maroon':            'wearing maroon graduation toga gown, gold academic regalia, mortarboard cap',
  'toga_navy':              'wearing navy blue graduation toga, silver academic hood, dignified',
  'toga_red':               'wearing red graduation toga gown, gold honors cord, festive academic',
  // Casual Graduation (After Ceremony)
  'kebaya_modern_grad':     'wearing modern white kebaya with batik kain, graduation sash, Indonesian graduate',
  'dress_white_floral':     'wearing white floral midi dress, holding graduation bouquet, fresh celebratory',
  'dress_pastel_grad':      'wearing pastel lavender A-line dress, holding diploma, celebratory fresh',
  'dress_sage_grad':        'wearing sage green wrap dress, diploma in hand, modern graduate',
  'blazer_smart_casual':    'wearing navy blazer, white blouse, tailored trousers, smart graduate',
  'korean_grad_style':      'wearing Korean graduation style, soft pleated skirt, blazer, modern K-drama graduate',
  'hijab_formal_grad':      'wearing white hijab, elegant gamis or long dress, graduation sash, modest graduate',
  'batik_dress_grad':       'wearing contemporary batik dress, graduation sash, Indonesian cultural graduate',
  // Accessories
  'toga_honor_cord':        'wearing black toga with gold honor cords and academic medals, distinguished graduate',
  'toga_master_hood':       'wearing graduation toga with master degree hood, professional academic',
  'toga_phd_regalia':       'wearing doctoral graduation regalia, PhD hood, distinguished academic',
  // Regional Adat
  'toga_kebaya_sunda':      'wearing black toga over Sundanese kebaya, siger headpiece, cultural graduate',
  'toga_kebaya_bali':       'wearing black toga over Balinese kebaya, traditional Bali graduate',
  'toga_baju_kurung':       'wearing black toga over Malay baju kurung, cultural Southeast Asian graduate',
  'custom': null,
};
```

### 5.2 Graduation Outfit — Male (20 options)

```javascript
const WISUDA_OUTFIT_MALE = {
  'toga_black_suit':        'wearing black graduation toga, formal black suit underneath, white dress shirt, tie',
  'toga_black_batik':       'wearing black graduation toga over premium batik shirt, Indonesian male graduate',
  'toga_black_baju_koko':   'wearing black graduation toga over white baju koko, Muslim male graduate',
  'toga_maroon_suit':       'wearing maroon toga, formal suit underneath, distinguished',
  'toga_navy_suit':         'wearing navy toga, dark suit, dignified academic',
  'toga_honor_male':        'wearing black toga with gold honor cords, achievement cords, distinguished graduate',
  'toga_master_male':       'wearing master graduation regalia, academic hood, professional',
  'toga_phd_male':          'wearing doctoral graduation regalia, PhD hood, academic achievement',
  'toga_traditional_jawa':  'wearing black toga over Javanese beskap, cultural Javanese graduate',
  'toga_casual_grad':       'wearing black toga, casual smart underneath, modern relaxed graduate',
  'suit_formal_male':       'wearing formal black suit, white dress shirt, necktie, holding diploma, no toga',
  'blazer_smart_male':      'wearing navy blazer, smart casual, holding diploma, modern professional graduate',
  'korean_grad_male':       'wearing Korean graduation style, clean modern suit, K-drama aesthetic',
  'batik_grad_male':        'wearing contemporary batik shirt, tailored trousers, graduation sash',
  'baju_koko_grad':         'wearing white embroidered baju koko, graduation sash, Muslim male graduate',
  'custom': null,
};
```

### 5.3 Graduation Backgrounds (40 options)

```javascript
const WISUDA_BACKGROUND = {
  // University & Academic
  'university_facade':      { label: 'Gedung Kampus Megah', detail: 'grand university building facade, classical architecture, stone columns, academic grandeur' },
  'library_hall':           { label: 'Aula Perpustakaan', detail: 'grand university library hall, floor-to-ceiling bookshelves, warm academic atmosphere' },
  'campus_garden':          { label: 'Taman Kampus', detail: 'lush university garden, manicured lawn, academic building backdrop, soft natural light' },
  'lecture_hall':           { label: 'Gedung Auditorium', detail: 'grand university auditorium exterior, ceremonial steps, academic celebration atmosphere' },
  'brick_archway':          { label: 'Gerbang Kampus Klasik', detail: 'classic brick archway, ivy-covered walls, collegiate Gothic architecture, timeless' },
  'graduation_stage':       { label: 'Panggung Wisuda', detail: 'formal graduation stage, navy and gold curtain backdrop, academic ceremony setting' },
  'campus_colonnade':       { label: 'Koridor Berpilar', detail: 'elegant university colonnade, classical columns, warm stone, architectural dignity' },
  // Studio Backgrounds
  'studio_navy_curtain':    { label: 'Studio Tirai Navy', detail: 'deep navy velvet curtain backdrop, warm studio lighting, formal graduation portrait' },
  'studio_gradient_grey':   { label: 'Studio Gradient Abu', detail: 'professional grey gradient studio backdrop, even soft lighting, clean academic portrait' },
  'studio_gold_bokeh':      { label: 'Studio Bokeh Emas', detail: 'golden bokeh lights backdrop, celebration atmosphere, warm glowing graduation portrait' },
  'studio_white_clean':     { label: 'Studio Putih Bersih', detail: 'clean white seamless backdrop, high key lighting, bright fresh graduation portrait' },
  'studio_black_dramatic':  { label: 'Studio Hitam Dramatis', detail: 'black studio backdrop, dramatic spot lighting, distinguished graduation portrait' },
  'studio_dark_blue':       { label: 'Studio Biru Tua Elegan', detail: 'deep blue professional backdrop, sophisticated lighting, elegant graduation portrait' },
  'studio_sage_green':      { label: 'Studio Hijau Sage', detail: 'sage green studio backdrop, soft natural tones, fresh contemporary graduation' },
  'studio_cream_warm':      { label: 'Studio Krem Hangat', detail: 'warm cream studio backdrop, soft side lighting, warm professional graduation portrait' },
  // Outdoor Locations — Indonesia
  'bali_temple_gate':       { label: 'Gerbang Pura Bali', detail: 'iconic Balinese split gate Candi Bentar, lush tropical garden, sacred cultural atmosphere' },
  'borobudur_temple':       { label: 'Candi Borobudur', detail: 'ancient Buddhist Borobudur monument stone stupas, misty morning, UNESCO heritage Indonesia' },
  'prambanan_temple':       { label: 'Candi Prambanan', detail: 'magnificent Hindu temple towers soaring skyward, dramatic sky, Yogyakarta heritage' },
  'monas_jakarta':          { label: 'Monas Jakarta', detail: 'National Monument Monas, grand plaza, Indonesian landmark, formal celebratory backdrop' },
  'yogyakarta_palace':      { label: 'Keraton Yogyakarta', detail: 'royal Javanese palace courtyard, elegant pendopo, traditional architecture' },
  'bandung_colonial':       { label: 'Bangunan Kolonial Bandung', detail: 'Dutch colonial Art Deco building facade, Bandung heritage, architectural elegance' },
  // Outdoor — International
  'paris_eiffel':           { label: 'Menara Eiffel Paris', detail: 'Eiffel Tower background at golden hour, Champ de Mars garden, Parisian romance' },
  'tokyo_sakura':           { label: 'Sakura Tokyo', detail: 'cherry blossom trees full bloom, pink sakura canopy, Tokyo spring celebration' },
  'london_big_ben':         { label: 'Big Ben London', detail: 'Houses of Parliament and Big Ben, Thames River, iconic London landmark' },
  'new_york_central_park':  { label: 'Central Park New York', detail: 'Central Park autumn foliage, Manhattan skyline backdrop, classic American scene' },
  // Korean Style
  'korean_campus':          { label: 'Kampus Gaya Korea', detail: 'Korean university clean modern building, cherry blossom trees, K-drama graduation atmosphere' },
  'korean_studio_grad':     { label: 'Studio Korea Graduation', detail: 'clean Korean studio backdrop, soft gradient, minimalist K-drama graduation style' },
  'hanok_village':          { label: 'Desa Hanok Korea', detail: 'traditional Korean hanok village rooftops, Seoul cityscape background, cultural graduation' },
  // Aesthetic & Trendy
  'flower_arch':            { label: 'Gapura Bunga', detail: 'lush fresh flower arch, roses and peonies, romantic floral graduation backdrop' },
  'fairy_lights':           { label: 'Fairy Lights', detail: 'thousands of fairy lights bokeh, warm golden glow, magical celebratory atmosphere' },
  'balloon_arch':           { label: 'Dekorasi Balon', detail: 'elegant gold and white balloon arch, celebration setup, contemporary graduation decor' },
  'neon_sign':              { label: 'Neon Sign Graduation', detail: 'glowing neon congratulations sign, modern trendy graduation aesthetic, night vibes' },
  'confetti':               { label: 'Hujan Confetti', detail: 'confetti falling from above, celebration moment, joyful colorful graduation' },
  'polaroid_wall':          { label: 'Dinding Polaroid', detail: 'polaroid photo wall backdrop, memory lane aesthetic, nostalgic graduation style' },
  // Natural Outdoor
  'sunset_field':           { label: 'Padang Sunset', detail: 'open golden field at sunset, long grass, warm backlight, cinematic graduation' },
  'beach_golden_hour':      { label: 'Pantai Golden Hour', detail: 'tropical beach at golden hour, warm ocean light, celebratory casual graduation' },
  'mountain_panorama':      { label: 'Panorama Pegunungan', detail: 'dramatic mountain panorama, fresh highland air, wide achievement landscape' },
  'botanical_garden':       { label: 'Kebun Raya', detail: 'lush botanical garden, tropical canopy, wide green lawns, colonial heritage building' },
  'waterfall_mist':         { label: 'Air Terjun Berkabut', detail: 'misty tropical waterfall, lush jungle greenery, cool fresh atmosphere' },
  'custom': null,
};
```

### 5.4 Graduation Props & Accessories

```javascript
const WISUDA_PROPS = {
  'diploma_scroll':         'holding rolled diploma scroll proudly',
  'diploma_open':           'holding open diploma certificate, reading proudly',
  'bouquet_roses':          'holding large bouquet of red roses, graduation gift',
  'bouquet_sunflowers':     'holding bright sunflower bouquet, celebratory fresh',
  'bouquet_mix':            'holding mixed flower bouquet, colorful celebratory',
  'teddy_bear_grad':        'holding small graduation teddy bear with mini toga, cute prop',
  'cap_throw':              'tossing graduation mortarboard cap upward, joyful celebration moment',
  'cap_held':               'holding graduation cap stylishly, fashionable angle',
  'book_stack':             'holding stack of academic books, scholarly achievement',
  'lanyard_medal':          'wearing academic achievement medal, honor lanyard',
  'balloon_gold':           'holding gold number balloon (year), celebratory',
  'polaroid_camera':        'holding vintage polaroid camera, nostalgia prop',
  'confetti_hand':          'tossing confetti from hands, celebration moment',
  'mini_blackboard':        'holding mini chalkboard with custom message, fun prop',
  'laptop_graduate':        'holding laptop, modern professional graduate prop',
  'none':                   '',
  'custom': null,
};
```

### 5.5 Graduation Poses (25 options)

```javascript
const WISUDA_POSE = {
  // Full Body — Standing
  'standing_proud':         'standing tall and proud, shoulders back, diploma in hand, full body confident portrait',
  'standing_cap_throw':     'tossing graduation cap upward, arms raised in celebration, full body dynamic',
  'walking_campus':         'walking confidently toward camera on campus path, full body natural stride',
  'standing_archway':       'standing in archway or gate, full body framed by architecture, elegant',
  'standing_hands_hip':     'standing with one hand on hip, holding diploma other hand, confident pose',
  'standing_crossed_arms':  'standing with arms loosely crossed, holding diploma, relaxed confident',
  // Full Body — Dynamic
  'jumping_joy':            'jumping with joy, arms spread wide, full body celebration leap',
  'spinning_gown':          'spinning in graduation gown, gown flowing in circle, joyful movement',
  'walking_books':          'walking while carrying stack of books, casual academic lifestyle',
  'cap_in_air_action':      'caught mid-throw of graduation cap in air, action shot celebration',
  // 3/4 Body
  'three_quarter_diploma':  '3/4 body portrait, holding diploma with both hands, proud academic display',
  'three_quarter_seated':   'seated elegantly on campus steps, 3/4 body framing, relaxed achievement',
  'three_quarter_leaning':  'leaning casually against wall or column, 3/4 body, cool relaxed graduate',
  // Wide & Landscape
  'wide_campus_walk':       'small figure walking in vast campus landscape, architectural wide shot, sense of scale',
  'wide_ceremony_hall':     'standing in large ceremony hall, wide shot showing grand venue, milestone',
  'wide_outdoor_scenic':    'standing in scenic outdoor location, wide landscape, figure in environment',
  // Close-Up & Portrait
  'headshot_serious':       'close-up portrait headshot, direct confident gaze, professional expression',
  'headshot_smiling':       'close-up portrait headshot, warm genuine smile, approachable',
  'cap_cover_eye':          'holding graduation cap tipped over one eye, playful fashion pose',
  // Seated
  'seated_chair':           'seated on elegant chair, upright dignified, diploma in lap, formal graduate portrait',
  'seated_steps':           'seated on campus stone steps, legs to side, relaxed graduate portrait',
  'seated_bench':           'sitting on garden bench, contemplative, diploma nearby, peaceful milestone',
  // Group-Inspired Solo
  'waving_diploma':         'waving diploma in air triumphantly, one arm raised, celebratory energy',
  'diploma_reading':        'holding open diploma, pretending to read, celebratory playful',
  'looking_up_sky':         'looking up to sky with hope and joy, arms out slightly, aspirational',
  'custom': null,
};
```

---

## 6. MENU: PROFESIONAL (Professional Headshot)

### 6.1 Professional Outfit — Female (25 options)

```javascript
const PROFESIONAL_OUTFIT_FEMALE = {
  // Corporate Business
  'navy_blazer_white':      'wearing navy blue blazer, crisp white dress shirt, polished professional corporate',
  'black_blazer_formal':    'wearing tailored black blazer, black trousers, formal corporate executive',
  'charcoal_suit_female':   'wearing charcoal grey pantsuit, white blouse, professional powerful',
  'royal_blue_blazer':      'wearing royal blue blazer, neutral shirt, confident corporate',
  'burgundy_blazer':        'wearing deep burgundy blazer, neutral shirt, sophisticated executive',
  'cream_blazer_classic':   'wearing cream blazer, camel colored shirt, warm professional',
  'white_button_down':      'wearing crisp white button-down shirt, clean professional minimal',
  'blush_blazer':           'wearing blush pink blazer, white shirt, approachable professional',
  // Business Casual
  'soft_knit_grey':         'wearing soft grey turtleneck knit, polished business casual',
  'pastel_blouse_smart':    'wearing pastel blue long-sleeve blouse, clean professional',
  'striped_smart':          'wearing navy pinstripe blazer, white blouse, business casual smart',
  'green_blazer_smart':     'wearing olive green blazer, neutral shirt, contemporary professional',
  // Indonesian Professional
  'batik_formal_female':    'wearing formal contemporary batik blouse, tailored trousers, Indonesian professional',
  'kebaya_professional':    'wearing professional kebaya, sophisticated Indonesian formal',
  'hijab_formal_prof':      'wearing hijab with formal blazer and long shirt, professional Muslim woman',
  'hijab_navy_formal':      'wearing navy hijab, matching navy blazer, clean professional',
  // Medical & Healthcare
  'doctor_white_coat':      'wearing white medical doctor coat, stethoscope, professional healthcare',
  'nurse_uniform':          'wearing professional nurse uniform, neat appearance, healthcare professional',
  // Legal & Finance
  'dark_suit_legal':        'wearing dark charcoal power suit, white shirt, legal professional presence',
  'pearl_necklace_exec':    'wearing black blazer, pearl necklace, executive sophisticated woman',
  // Tech & Creative
  'smart_casual_tech':      'wearing smart casual dark blazer, neat t-shirt, tech professional modern',
  'creative_colorful_prof': 'wearing colorful blazer, neat outfit, creative professional personality',
  // Academic
  'academic_formal_f':      'wearing formal academic blazer, professional educator appearance',
  'professor_look':         'wearing navy blazer, reading glasses, intellectual professional academic',
  'custom': null,
};
```

### 6.2 Professional Outfit — Male (20 options)

```javascript
const PROFESIONAL_OUTFIT_MALE = {
  // Corporate
  'navy_suit_tie':          'wearing navy suit, white dress shirt, silk tie, formal corporate professional',
  'charcoal_suit_tie':      'wearing charcoal grey suit, light blue shirt, tie, polished executive',
  'black_suit_formal':      'wearing black formal suit, white shirt, black tie, distinguished',
  'dark_blue_suit':         'wearing dark blue slim suit, white shirt, modern professional',
  'light_grey_suit':        'wearing light grey suit, white shirt, no tie, contemporary professional',
  'brown_tweed_blazer':     'wearing brown tweed blazer, Oxford shirt, intellectual professional',
  // Business Casual
  'navy_blazer_male':       'wearing navy blazer, white shirt, no tie, chinos, smart casual',
  'white_shirt_professional':'wearing crisp white dress shirt, dark trousers, clean professional',
  'light_blue_shirt':       'wearing light blue dress shirt, dark trousers, approachable professional',
  'smart_turtleneck_male':  'wearing dark turtleneck, blazer, tech professional modern',
  // Indonesian Professional
  'batik_formal_male':      'wearing formal batik shirt, dark tailored trousers, Indonesian professional',
  'baju_koko_prof':         'wearing elegant embroidered baju koko, professional Muslim male',
  // Medical
  'doctor_coat_male':       'wearing white medical coat, stethoscope, professional doctor',
  // Legal & Finance
  'power_suit_male':        'wearing navy power suit, white shirt, gold tie clip, authority presence',
  'law_formal_suit':        'wearing dark charcoal suit, crisp shirt, lawyer professional',
  // Tech & Creative
  'smart_casual_male':      'wearing dark jeans, crisp shirt, blazer, tech startup professional',
  'polo_professional':      'wearing professional polo shirt, smart casual, approachable brand',
  // Military / Uniform-inspired
  'structured_jacket':      'wearing structured military-inspired formal jacket, strong professional',
  // Academic
  'professor_male':         'wearing tweed blazer, collared shirt, reading glasses, academic intellectual',
  'custom': null,
};
```

### 6.3 Professional Backgrounds (30 options)

```javascript
const PROFESIONAL_BACKGROUND = {
  // Studio Clean
  'white_seamless':         { label: 'Putih Bersih (Studio)', detail: 'clean white seamless studio backdrop, even soft lighting, classic LinkedIn headshot' },
  'soft_grey_gradient':     { label: 'Abu Gradient Lembut', detail: 'professional soft grey gradient backdrop, timeless corporate headshot standard' },
  'dark_charcoal_studio':   { label: 'Charcoal Gelap Elegan', detail: 'deep charcoal dark studio backdrop, dramatic side light, executive presence' },
  'light_navy_studio':      { label: 'Navy Muda Elegan', detail: 'light navy blue studio backdrop, trust and intelligence, finance professional' },
  'warm_cream_studio':      { label: 'Krem Hangat', detail: 'warm cream off-white backdrop, approachable warm professional tone' },
  'sage_green_studio':      { label: 'Hijau Sage Segar', detail: 'sage green studio backdrop, fresh contemporary, wellness or eco professional' },
  'dusty_rose_studio':      { label: 'Rose Muted Lembut', detail: 'dusty rose muted studio backdrop, warm feminine professional' },
  'deep_navy_power':        { label: 'Navy Gelap Powerful', detail: 'deep navy power backdrop, authority and trust, C-suite executive look' },
  // Blurred Environmental
  'office_bokeh':           { label: 'Kantor Blur', detail: 'blurred modern office interior bokeh, professional workspace context, corporate' },
  'bookshelf_blur':         { label: 'Rak Buku Blur', detail: 'softly blurred bookshelf background, intellectual academic professional, warm tones' },
  'glass_building_blur':    { label: 'Gedung Kaca Blur', detail: 'blurred glass corporate building exterior, urban professional, city context' },
  'conference_room_blur':   { label: 'Ruang Rapat Blur', detail: 'blurred conference room background, corporate meeting professional context' },
  'cafe_work_blur':         { label: 'Kafe Kerja Blur', detail: 'blurred modern café workspace, casual professional, startup or creative' },
  'window_natural_blur':    { label: 'Jendela Natural Blur', detail: 'large window with natural light, softly blurred city or garden outside, warm natural' },
  // Outdoor Environmental
  'urban_street':           { label: 'Jalan Urban Modern', detail: 'modern urban street, city building background, contemporary professional outdoor' },
  'city_park_trees':        { label: 'Taman Kota Hijau', detail: 'city park with trees, green natural outdoor professional, entrepreneur' },
  'rooftop_city':           { label: 'Rooftop Kota', detail: 'urban rooftop, city skyline background, modern professional executive outdoor' },
  'building_exterior':      { label: 'Eksterior Gedung', detail: 'clean modern building exterior, architectural lines, corporate professional' },
  'hospital_corridor':      { label: 'Koridor Rumah Sakit', detail: 'clean hospital corridor, healthcare professional environment, medical' },
  'law_office':             { label: 'Kantor Hukum', detail: 'elegant law office interior, mahogany desk, legal professional setting' },
  // Special Industry
  'tech_office':            { label: 'Tech Office Modern', detail: 'modern tech office, clean minimal, startup culture, tech professional' },
  'creative_studio':        { label: 'Studio Kreatif', detail: 'creative studio workspace, art on walls, creative professional designer' },
  'university_backdrop':    { label: 'Kampus Akademis', detail: 'university building backdrop, academic professional, educator or researcher' },
  'medical_clean':          { label: 'Medis Bersih', detail: 'clean clinical white setting, medical professional, healthcare provider' },
  // KTP / ID Card Style
  'plain_white_id':         { label: 'Putih Polos (KTP/ID)', detail: 'plain flat white background, ID card or passport photo standard, formal' },
  'plain_blue_id':          { label: 'Biru Polos (KTP)', detail: 'plain light blue background, Indonesian ID card standard format' },
  'plain_red_id':           { label: 'Merah Polos (Tertentu)', detail: 'plain red background, formal identity document standard' },
  'plain_grey_id':          { label: 'Abu Polos (Passport)', detail: 'plain light grey background, passport or visa application photo standard' },
  'clean_lifestyle':        { label: 'Lifestyle Bersih', detail: 'clean minimal lifestyle background, personal brand, entrepreneur' },
  'jakarta_skyline':        { label: 'Skyline Jakarta', detail: 'Jakarta city skyline, Indonesian professional context, urban executive' },
  'custom': null,
};
```

### 6.4 Professional Shot Types (12 options)

```javascript
const PROFESIONAL_SHOT = {
  // Standard LinkedIn/CV
  'headshot_standard':      'professional headshot, face and shoulders, face takes up 60% of frame, clean framing',
  'half_body_formal':       'half body portrait, waist up, arms visible, professional stance, LinkedIn standard',
  'half_body_seated':       'seated half body portrait, desk or chair, professional office context',
  'three_quarter_standing': '3/4 body portrait, three-quarter length, confident stance, full professional look',
  // KTP / ID Card
  'id_card_front':          'front-facing ID card style, shoulders and head, neutral expression, identity document standard',
  'passport_standard':      'passport-style headshot, shoulders up, neutral expression, white background, document standard',
  // Executive / Brand
  'executive_power':        'executive power pose, confident authoritative stance, half body, leadership presence',
  'crossed_arms_confident': 'arms loosely crossed, confident approachable expression, half body professional',
  'leaning_desk':           'leaning naturally against desk or surface, relaxed professional, half body',
  'standing_arms_side':     'standing with arms naturally at side, clean formal half body portrait',
  'profile_thoughtful':     'three-quarter profile, thoughtful gaze slightly away, intellectual professional',
  'candid_natural':         'natural candid-style professional, caught in natural moment, authentic approachable',
  'custom': null,
};
```

### 6.5 Professional Expressions (10 options)

```javascript
const PROFESIONAL_EXPRESSION = {
  'confident_direct':       'confident direct eye contact, professional authority, trustworthy gaze',
  'warm_smile':             'warm genuine professional smile with teeth, approachable friendly leadership',
  'soft_smile':             'soft closed-mouth professional smile, polished sophisticated',
  'serious_authority':      'serious authoritative expression, powerful executive presence, no smile',
  'approachable_open':      'open approachable expression, slight natural smile, relatable professional',
  'intellectual_thoughtful':'thoughtful intellectual expression, slight gaze upward, academic professional',
  'confident_no_smile':     'confident neutral expression, strong direct gaze, no smile, executive',
  'natural_candid_prof':    'natural caught-in-moment expression, genuine and unposed, authentic',
  'friendly_engaging':      'friendly engaging smile, excellent teeth, high social likability, recruiter magnet',
  'aspirational_gaze':      'aspirational slightly upward gaze, hopeful determined, career motivation',
  'custom': null,
};
```

---

## 7. MENU: MATERNITY

### 7.1 Maternity Outfit (30 options)

```javascript
const MATERNITY_OUTFIT = {
  // Gown — Flowing & Elegant
  'white_silk_gown':        'wearing white flowing silk maternity gown, empire waist, elegant bare shoulder, 7-9 months pregnant belly prominent',
  'blush_tulle_gown':       'wearing blush pink tulle maternity ball gown, voluminous layered skirt, ethereal princess',
  'champagne_chiffon':      'wearing champagne chiffon flowing maxi gown, off-shoulder, windswept flowing fabric',
  'burgundy_velvet_gown':   'wearing deep burgundy velvet maternity gown, fitted top flowing skirt, dramatic jewel tone',
  'emerald_silk':           'wearing emerald green silk gown, one-shoulder, flowing full length, vibrant dramatic',
  'nude_lace_gown':         'wearing nude champagne lace fitted gown, delicate floral lace detail, showing bump',
  'navy_dramatic_gown':     'wearing deep navy dramatic maternity gown, flowing wide sleeves, powerful elegant',
  'red_bold_gown':          'wearing bold red maternity gown, dramatic statement, passionate confident mother',
  'lavender_flowy':         'wearing soft lavender flowing maternity dress, dreamy romantic, flower crown',
  'coral_sunset_gown':      'wearing coral orange flowing maternity gown, sunset tropical warmth',
  // Boho / Natural Style
  'boho_floral_maxi':       'wearing boho floral print maxi dress, off shoulder, flowing relaxed pregnancy style',
  'earthy_linen_dress':     'wearing earth tone linen maternity dress, natural organic, relaxed bohemian pregnant',
  'cream_boho_lace':        'wearing cream boho lace maternity dress, floral crown, natural field setting',
  'wrap_dress_casual':      'wearing floral wrap maternity dress, comfortable flattering, candid lifestyle',
  'denim_shirt_maxi':       'wearing denim shirt open over white maxi skirt, casual maternity chic',
  // Minimalist & Modern
  'all_white_minimal':      'wearing all-white minimal maternity set, clean modern, barely there neckline',
  'black_minimal_fitted':   'wearing fitted black maternity dress, minimal chic, contemporary, showing bump',
  'grey_knit_cozy':         'wearing soft grey knit fitted maternity dress, cozy winter warm, belly visible',
  'white_crop_skirt':       'wearing white crop top and flowing maxi skirt, showing pregnant belly, modern',
  // Indonesian Style
  'kebaya_maternity':       'wearing modern kebaya maternity version, Indonesian cultural pregnancy, elegant bump',
  'batik_wrap_maternity':   'wearing batik wrap dress, contemporary Indonesian maternity, cultural pride',
  'gamis_pregnant':         'wearing flowing gamis maternity, modest Muslim pregnancy style, elegant',
  'hijab_maternity_formal': 'wearing hijab with formal maternity dress, modest elegant pregnant Muslim woman',
  // High Fashion
  'couture_maternity':      'wearing couture editorial maternity outfit, high fashion pregnancy, magazine quality',
  'metallic_gown':          'wearing gold metallic maternity gown, glamorous shimmering, editorial fashion',
  'sequin_maternity':       'wearing champagne sequin maternity dress, glittering celebration pregnancy',
  // Natural / Artistic
  'sheer_draping':          'wearing sheer fabric artistically draped over pregnant body, fine art maternity',
  'bodysuit_artistic':      'wearing fitted bodysuit, artistic minimal, fine art pregnancy portrait',
  'nothing_draped':         'artistically draped in soft fabric only, fine art nude maternity, tasteful elegant',
  'custom': null,
};
```

### 7.2 Maternity Backgrounds (30 options)

```javascript
const MATERNITY_BACKGROUND = {
  // Studio
  'studio_white_minimal':   { label: 'Studio Putih Minimalis', detail: 'clean white studio backdrop, soft box lighting, timeless minimalist maternity portrait' },
  'studio_grey_soft':       { label: 'Studio Abu Lembut', detail: 'soft grey gradient studio, gentle wrap lighting, classic elegant maternity studio' },
  'studio_black_dramatic':  { label: 'Studio Hitam Dramatis', detail: 'black backdrop, dramatic Rembrandt lighting, fine art moody maternity' },
  'studio_dark_moody':      { label: 'Studio Gelap Moody', detail: 'very dark low-key studio, single dramatic light source, artistic moody maternity' },
  'studio_cream_warm':      { label: 'Studio Krem Hangat', detail: 'warm cream studio, soft natural-look lighting, inviting maternity portrait' },
  'studio_blush':           { label: 'Studio Blush Rose', detail: 'blush pink studio backdrop, soft feminine lighting, dreamy romantic maternity' },
  'studio_jewel_emerald':   { label: 'Studio Emerald Mewah', detail: 'deep emerald velvet studio, luxurious rich tone, high-end maternity portrait' },
  'window_light_studio':    { label: 'Cahaya Jendela', detail: 'large window natural light, white curtain, soft diffused glow, intimate natural maternity' },
  // Flower & Botanical
  'flower_arch_floral':     { label: 'Gerbang Bunga Penuh', detail: 'lush fresh flower arch, roses and peonies and greenery, romantic floral maternity' },
  'flower_wall_pink':       { label: 'Dinding Bunga Pink', detail: 'full fresh flower wall, pink and white blooms, Instagram aesthetic maternity' },
  'flower_field_outdoor':   { label: 'Ladang Bunga', detail: 'open flower field in bloom, wildflowers, sunlight through blooms, organic natural' },
  'sunflower_field':        { label: 'Ladang Bunga Matahari', detail: 'bright sunflower field, warm golden sunlight, joyful happy maternity outdoor' },
  'lavender_field':         { label: 'Ladang Lavender', detail: 'Provence-style lavender fields, purple haze, dreamy aromatic maternity outdoor' },
  'cherry_blossom':         { label: 'Pohon Sakura', detail: 'cherry blossom sakura trees full bloom, pink petal shower, Japanese spring maternity' },
  // Nature Outdoor
  'golden_sunset_beach':    { label: 'Pantai Sunset Emas', detail: 'tropical beach at golden hour, warm ocean light, silhouette or lit sunset maternity' },
  'ocean_cliff':            { label: 'Tebing Laut', detail: 'ocean cliff edge, dramatic coastal view, powerful mother nature backdrop' },
  'green_forest':           { label: 'Hutan Hijau', detail: 'lush green forest, dappled light through trees, organic natural maternity' },
  'misty_highland':         { label: 'Highland Berkabut', detail: 'misty cool highland, soft fog rolling, mystical ethereal maternity outdoor' },
  'rice_terrace':           { label: 'Terasering Padi', detail: 'emerald rice terraces, Bali landscape, lush Indonesian natural maternity' },
  'waterfall_green':        { label: 'Air Terjun Tropis', detail: 'tropical waterfall, lush ferns and moss, cool mist, natural paradise maternity' },
  // Boho & Natural
  'boho_macrame_backdrop':  { label: 'Boho Macramé', detail: 'macramé boho backdrop, pampas grass, dried flowers, earthy bohemian maternity' },
  'rustic_wood':            { label: 'Kayu Rustic', detail: 'warm rustic wooden backdrop, natural wood tones, cozy cabin warmth, organic' },
  'canopy_sheer':           { label: 'Kanopi Sheer', detail: 'sheer white fabric canopy overhead, gentle breeze, ethereal dreamy maternity' },
  'bedsheet_nursery':       { label: 'Kamar Bayi Cozy', detail: 'cozy prepared nursery, baby crib nearby, window light, intimate motherhood' },
  'bathtub_flowers':        { label: 'Bathtub Bunga', detail: 'vintage bathtub filled with floating flowers and petals, water maternity, ethereal' },
  // Urban & Modern
  'rooftop_sunset_mat':     { label: 'Rooftop Sunset Modern', detail: 'urban rooftop at sunset, city lights bokeh, modern contemporary maternity' },
  'concrete_urban':         { label: 'Urban Concrete Artistik', detail: 'raw concrete urban backdrop, edgy modern maternity, strong contemporary woman' },
  'luxury_interior':        { label: 'Interior Mewah', detail: 'luxury home interior, marble floor, elegant furniture, high-end lifestyle maternity' },
  'hotel_suite':            { label: 'Kamar Hotel Mewah', detail: 'luxury hotel suite, sheer curtains, natural window light, pampered maternity' },
  'poolside':               { label: 'Pinggir Kolam', detail: 'poolside setting, tropical resort, turquoise water reflection, glamorous maternity' },
  'custom': null,
};
```

### 7.3 Maternity Poses (25 options)

```javascript
const MATERNITY_POSE = {
  // Classic Bump Poses
  'hands_on_bump_full':     'full body standing, both hands gently cradling pregnant belly, peaceful radiant expression',
  'side_profile_bump':      'full body side profile, belly silhouette prominent, hands on bump, strong mother silhouette',
  'silhouette_backlit':     'full body silhouette against window light or sunset, pregnant belly profile, artistic shadow',
  'one_hand_bump':          'full body standing, one hand on belly, one arm at side, natural relaxed pregnant woman',
  'looking_down_bump':      'full body standing, looking down lovingly at belly, tender maternal connection',
  // Flowing Fabric Poses
  'gown_flow_wind':         'full body standing, dramatic gown flowing in breeze, arms slightly out, cinematic',
  'gown_hold_fabric':       'full body standing, one hand holding gathered gown fabric, elegant composed stance',
  'twirl_spin':             'full body spinning slowly, gown swirling around, joy and movement, maternity dance',
  'walking_toward_cam':     'full body walking slowly toward camera, gown flowing, confident natural stride',
  'walking_away':           'full body walking away from camera slowly, gown trailing, intimate back view',
  // Seated Poses
  'seated_chair_formal':    'seated elegantly on chair, hands folded on belly, profile or three-quarter, formal maternity portrait',
  'seated_floor_gown':      'sitting on floor, legs to side, gown spreading around, relaxed bohemian maternity',
  'seated_bench_outdoor':   'sitting on rustic bench, hand on bump, natural light, peaceful outdoor maternity',
  'seated_stairs':          'sitting on stairs or steps, flowing gown cascading down, elegant architectural',
  // Lying & Reclining
  'lying_flowers':          'lying in field of flowers, side view, bump prominent, dreamy serene maternity',
  'lying_floor_silk':       'lying on white silk sheets or floor, side profile, hands on belly, intimate maternity',
  'reclining_chaise':       'reclining on chaise or sofa, elegant, one hand on belly, glamorous maternity',
  // Dynamic & Artistic
  'fabric_floating':        'artistically floating fabric billowing around pregnant body, fine art ethereal',
  'arms_wide_open':         'full body arms spread wide open, looking up to sky, embracing motherhood freedom',
  'flower_crown_close':     'close-up portrait with flower crown, belly barely visible, beauty maternity',
  'behind_sheer_curtain':   'figure seen through sheer white curtain, artistic filtered maternity portrait',
  // Belly Detail Close-Up
  'belly_close_up':         'extreme close-up of pregnant belly, hands cradling, intimate detail maternity portrait',
  'belly_oil_glow':         'close-up belly with oil glowing skin, hands placed, beautiful pregnancy skin',
  'belly_letter_shadow':    'close-up belly with shadow spelling baby or love, artistic light play maternity',
  'three_quarter_glow':     '3/4 body portrait showing full pregnant belly, glowing skin, radiant motherhood',
  'custom': null,
};
```

---

## 8. MENU: STUDIO KOREA

### 8.1 Korean Studio Outfit — Female (30 options)

```javascript
const KOREA_OUTFIT_FEMALE = {
  // Classic White / Clean
  'white_puff_sleeve':      'wearing white puff sleeve mini dress, pearl accessories, classic Korean wedding studio style',
  'white_aline_simple':     'wearing simple white A-line midi dress, minimalist clean, soft Korean aesthetic',
  'white_lace_detail':      'wearing white lace detail midi dress, delicate feminine, Korean elegant',
  'white_corset_skirt':     'wearing white corset top and white tulle skirt, Korean bridal studio fashion',
  'ivory_slip_dress':       'wearing ivory satin slip dress, simple elegant, Korean understated chic',
  // Pastel Korean
  'blush_pink_flowy':       'wearing soft blush pink chiffon midi dress, feminine sweet K-drama style',
  'powder_blue_dress':      'wearing powder blue pleated midi dress, fresh clean Korean feminine',
  'lavender_dress':         'wearing lavender A-line dress, soft dreamy, Korean romantic aesthetic',
  'mint_green_dress':       'wearing mint green satin dress, fresh and modern Korean studio style',
  'peach_silk_dress':       'wearing peach silk midi dress, soft warm Korean feminine aesthetic',
  // Korean Bridal / Formal
  'wedding_studio_gown':    'wearing white Korean wedding studio gown, layered tulle, elegant traditional K-bridal',
  'hanbok_modern_bride':    'wearing modern fusion hanbok, contemporary Korean traditional bridal',
  'princess_ballgown':      'wearing princess-style ball gown, full layered skirt, flowers, Korean studio',
  'mermaid_studio':         'wearing fitted mermaid dress, trailing detail, sophisticated Korean studio',
  'off_shoulder_studio':    'wearing off-shoulder white dress, simple romantic, Korean studio classic',
  // Dark & Moody Korean
  'navy_evening_korea':     'wearing deep navy evening dress, sophisticated, dark Korean editorial',
  'black_minimal_korea':    'wearing black minimal slip dress, modern Korean minimal editorial',
  'burgundy_velvet_korea':  'wearing burgundy velvet mini dress, moody K-drama style',
  'forest_green_korea':     'wearing forest green satin wrap dress, dramatic Korean editorial',
  // Fun & Trendy Korean
  'floral_mini_korea':      'wearing floral print mini dress, playful feminine Korean street style',
  'plaid_coord_korea':      'wearing pastel plaid co-ord set, cute Korean campus fashion',
  'cable_knit_skirt':       'wearing cream cable knit sweater, pleated midi skirt, cozy Korean autumn',
  'striped_prep_korea':     'wearing navy striped prep look, Korean collegiate fashion',
  'oversized_blazer_korea': 'wearing oversized blazer dress, minimalist Korean power aesthetic',
  'pinksuit_korea':         'wearing pink power suit women, bold Korean fashion editorial',
  // Cultural Fusion
  'hanbok_modern':          'wearing modern hanbok fusion, contemporary Korean traditional dress, cultural chic',
  'hanbok_casual':          'wearing casual everyday hanbok, simplified Korean traditional, cultural lifestyle',
  'cheongsam_korea':        'wearing modern Korean-influenced cheongsam, Asian fusion fashion',
  'kimono_fusion':          'wearing Korean-Japanese kimono fusion dress, pan-Asian aesthetic',
  'custom': null,
};
```

### 8.2 Korean Studio Outfit — Male (20 options)

```javascript
const KOREA_OUTFIT_MALE = {
  // Classic Korean Groom / Formal
  'white_suit_groom':       'wearing white slim-fit groom suit, white shirt, white tie, Korean groom studio',
  'grey_suit_korea':        'wearing light grey slim Korean suit, white shirt, no tie, clean minimal',
  'navy_suit_korea':        'wearing navy slim suit, white shirt, pocket square, Korean formal',
  'black_tux_korea':        'wearing black tuxedo, white shirt, black bow tie, Korean groom classic',
  'pastel_suit_korea':      'wearing pastel lavender or sage slim suit, Korean fashion forward',
  // Casual Korean
  'white_tshirt_jeans':     'wearing clean white fitted t-shirt, dark slim jeans, Korean casual minimal',
  'oversized_knit_korea':   'wearing oversized cream knit sweater, wide trousers, cozy Korean aesthetic',
  'striped_shirt_korea':    'wearing classic navy striped shirt, chinos, Korean preppy',
  'denim_smart_korea':      'wearing denim jacket, white shirt, dark jeans, Korean smart casual',
  'blazer_minimal_korea':   'wearing minimalist navy blazer, clean shirt, Korean smart casual',
  'turtleneck_korea':       'wearing dark turtleneck, slim trousers, Korean intellectual minimal',
  'plaid_blazer_korea':     'wearing plaid blazer, casual underneath, Korean campus fashion',
  // Hanbok & Traditional
  'hanbok_male_modern':     'wearing modern men hanbok fusion, contemporary Korean traditional male',
  'hanbok_groom_male':      'wearing traditional Korean groom hanbok, jeogori, dignified cultural',
  // Fashion-Forward
  'all_black_editorial':    'wearing all-black Korean editorial, black shirt, black trousers, fashion forward',
  'monochrome_grey':        'wearing monochrome grey outfit, minimal powerful Korean editorial',
  'earth_tones_korea':      'wearing earth tone coordinated Korean outfit, terracotta, warm natural',
  'bright_bold_korea':      'wearing bold colorful Korean fashion, statement outfit, Gen Z Korean style',
  'trench_coat_korea':      'wearing fitted trench coat, white shirt, Korean layered autumn style',
  'custom': null,
};
```

### 8.3 Korean Studio Backgrounds (40 options)

```javascript
const KOREA_BACKGROUND = {
  // Pure Minimal
  'pure_white_korea':       { label: 'Putih Murni Korea', detail: 'pure white seamless backdrop, clean natural studio light, classic K-studio minimal' },
  'soft_cream_korea':       { label: 'Krem Lembut Korea', detail: 'warm cream off-white backdrop, soft wrap light, inviting Korean studio warmth' },
  'pale_grey_korea':        { label: 'Abu Pucat Korea', detail: 'very pale grey gradient, minimal contemporary, Seoul studio modern aesthetic' },
  'stark_black_korea':      { label: 'Hitam Murni Korea', detail: 'stark pure black backdrop, single key light, dramatic moody K-drama dark' },
  'deep_navy_korea':        { label: 'Navy Dalam Korea', detail: 'deep navy blue backdrop, sophisticated Korean editorial, nocturnal chic' },
  // Floral (Korean Studios Famous For)
  'pink_flower_wall':       { label: 'Dinding Bunga Pink', detail: 'full pink flower wall, roses and blooms, iconic Korean studio floral backdrop' },
  'white_flower_wall':      { label: 'Dinding Bunga Putih', detail: 'all-white flower wall, elegant pure floral, Korean studio classic' },
  'mixed_flower_wall':      { label: 'Dinding Bunga Mix', detail: 'mixed colorful flower wall, vibrant blooms, Korean studio celebration' },
  'lavender_floral_wall':   { label: 'Dinding Lavender', detail: 'lavender and purple flower wall, dreamy romantic Korean studio' },
  'peony_backdrop':         { label: 'Backdrop Peony', detail: 'large peony flowers backdrop, soft lush florals, romantic feminine Korea' },
  'hanging_flowers':        { label: 'Bunga Gantung', detail: 'hanging flower installations from ceiling, botanical dream, Korean studio' },
  // European Inspired (Popular Korean Studio Style)
  'european_chateau':       { label: 'Chateau Eropa', detail: 'European chateau interior, ornate arched windows, gilded frames, K-studio Europe' },
  'french_vintage':         { label: 'Vintage Prancis', detail: 'French vintage interior, antique furniture, soft muted tones, Korean romantic France' },
  'baroque_gold_wall':      { label: 'Dinding Baroque Emas', detail: 'baroque gold ornate wall molding, grand classical architecture, Korean luxury' },
  'paris_balcony':          { label: 'Balkon Paris', detail: 'Parisian balcony set, iron railing, soft Paris light, Korean romantic Europe' },
  'english_garden':         { label: 'Taman Inggris', detail: 'English garden indoor set, roses, stone wall, romantic British garden Korea' },
  // Nature Indoor Sets
  'forest_trees_set':       { label: 'Set Hutan Indoor', detail: 'indoor forest tree set, tall birch trees, dappled light, Korean nature studio' },
  'cherry_blossom_set':     { label: 'Set Sakura Indoor', detail: 'indoor cherry blossom sakura set, pink blossoms, Japanese spring, Korean studio' },
  'bamboo_zen_set':         { label: 'Set Bambu Zen', detail: 'bamboo indoor set, minimalist Japanese aesthetic, zen calm Korean studio' },
  'autumn_maple_set':       { label: 'Set Maple Autumn', detail: 'indoor autumn maple leaves set, orange red foliage, warm Korean fall studio' },
  'pine_forest_set':        { label: 'Set Hutan Pinus', detail: 'indoor pine forest set, evergreen trees, cool northern aesthetic, Korean studio' },
  // Unique Korean Studio Styles
  'white_staircase':        { label: 'Tangga Putih Elegan', detail: 'pure white modern staircase, architectural clean lines, Korean studio elegant landmark set' },
  'arch_doorway_white':     { label: 'Pintu Lengkung Putih', detail: 'white arched doorway, clean minimal Korean studio architectural set' },
  'window_seat_white':      { label: 'Kursi Jendela Putih', detail: 'white window seat, soft curtains, natural-look light, intimate Korean studio' },
  'vintage_sofa_set':       { label: 'Sofa Vintage Elegan', detail: 'vintage chesterfield sofa, elegant props, classic Korean studio portrait set' },
  'modern_couch_minimal':   { label: 'Sofa Modern Minimal', detail: 'modern minimal sofa, clean backdrop, contemporary Korean studio lifestyle set' },
  'bookshelf_set':          { label: 'Set Rak Buku', detail: 'curated bookshelf backdrop, cozy intellectual, Korean studio book concept' },
  'rooftop_night_seoul':    { label: 'Rooftop Malam Seoul', detail: 'Seoul city rooftop at night, skyline bokeh, Korean romantic night studio' },
  'swing_outdoor_set':      { label: 'Ayunan Taman', detail: 'garden swing set, blooms around, romantic whimsical Korean studio outdoor' },
  'mirror_reflection':      { label: 'Cermin Refleksi', detail: 'large ornate mirror, reflection composition, artistic Korean studio portrait' },
  'sheer_curtain_light':    { label: 'Tirai Sheer Cahaya', detail: 'sheer white curtains with backlight, ethereal dreamy, Korean studio romantic light' },
  // Color Block
  'sage_color_block':       { label: 'Sage Green Block', detail: 'sage green solid color block, contemporary Korean fashion editorial backdrop' },
  'terracotta_block':       { label: 'Terracotta Block', detail: 'terracotta warm solid backdrop, earthy Korean editorial fashion' },
  'dusty_pink_block':       { label: 'Pink Dusty Block', detail: 'dusty pink solid color backdrop, feminine Korean fashion studio' },
  'powder_blue_block':      { label: 'Powder Blue Block', detail: 'powder blue solid color backdrop, fresh Korean studio fashion editorial' },
  'forest_green_block':     { label: 'Hijau Forest Block', detail: 'forest green solid color backdrop, bold Korean editorial studio' },
  'mustard_block':          { label: 'Kuning Mustard Block', detail: 'mustard yellow solid backdrop, bold warm Korean editorial, trendy' },
  'custom': null,
};
```

### 8.4 Korean Studio Poses (25 options)

```javascript
const KOREA_POSE = {
  // Full Body Standing
  'fb_standing_confident':  'full body standing, confident natural posture, direct camera gaze, Korean portrait',
  'fb_one_hand_hip':        'full body standing, one hand on hip naturally, Korean fashion editorial pose',
  'fb_hands_together':      'full body standing, hands clasped loosely in front, soft elegant Korean portrait',
  'fb_walking_toward':      'full body walking slowly toward camera, confident stride, Korean editorial',
  'fb_arms_floating':       'full body standing, arms slightly out at sides, floating natural, Korean fine art',
  // Full Body Dynamic
  'fb_dress_hold':          'full body, one hand holding dress hem elegantly, posed feminine Korean studio',
  'fb_spinning':            'full body spinning slowly, dress or fabric swirling, joyful movement, Korean studio',
  'fb_looking_back':        'full body walking away, looking back over shoulder, coy elegant Korean',
  'fb_window_look':         'standing at window, looking out, three-quarter back, introspective Korean',
  'fb_leaning_wall':        'leaning casually against wall, full body, one shoulder, relaxed Korean cool',
  // Seated Full Body
  'seated_floor_gown':      'full body seated on floor, legs to side, gown spreading, Korean studio elegant',
  'seated_chair_elegant':   'full body seated on chair, upright elegant, Korean portrait formal',
  'seated_stairs_full':     'full body seated on white staircase steps, legs together, architectural Korean',
  'perched_table':          'perched on table edge, legs crossed or dangling, playful Korean editorial',
  'on_swing_full':          'full body on swing, mid-swing moment, joyful dynamic Korean outdoor set',
  // 3/4 Body
  '34_facing_camera':       '3/4 body facing camera, three-quarter length, natural stance, Korean studio',
  '34_side_elegant':        '3/4 body slight side profile, elegant angular Korean editorial',
  '34_looking_away':        '3/4 body looking slightly away, contemplative dreamy, Korean cinematic',
  // Close-Up
  'beauty_closeup_korea':   'close-up beauty portrait, face and shoulders, K-beauty glow, dewy skin',
  'three_quarter_portrait': '3/4 upper body portrait, expressive eyes, Korean beauty close-up',
  // Special Korean Poses
  'flower_hold_face':       'holding flower near face, soft expression, iconic Korean studio romantic pose',
  'two_hands_chin':         'both hands gently under chin, cute sweet Korean studio expression pose',
  'hair_touch':             'one hand touching hair gracefully, side profile, Korean editorial styling moment',
  'over_shoulder_glance':   'looking over shoulder at camera, seductive confident, Korean fashion',
  'reading_book_seated':    'seated reading book elegantly, intellectual Korean studio lifestyle pose',
  'custom': null,
};
```

---

## 9. MENU: PREWEDDING

### 9.1 Prewedding Outfit — Male (25 options)
*(Reference existing OUTFIT_PREWEDDING_PRIA from v2 — extended)*

```javascript
const PREWEDDING_OUTFIT_MALE = {
  'white_linen_roll':       'wearing white linen shirt sleeves rolled up, tailored khaki chinos, brown loafers',
  'cream_linen':            'wearing cream linen shirt, white trousers, tan suede loafers, relaxed elegant',
  'blue_denim_shirt':       'wearing light blue denim shirt, dark chinos, white sneakers, smart casual',
  'pastel_shirt':           'wearing sage green shirt, beige trousers, cream sneakers, fresh modern',
  'korean_oversized':       'wearing Korean oversized cream knit, straight-leg trousers, minimal white sneakers',
  'white_tshirt_minimal':   'wearing white fitted tee, khaki chinos, white sneakers, minimal cool',
  'suit_beige_linen':       'wearing slim beige linen suit, white shirt no tie, tan loafers, continental',
  'suit_grey_no_tie':       'wearing charcoal slim suit, light blue shirt, no tie, sophisticated',
  'batik_contemporary':     'wearing contemporary abstract batik shirt, dark trousers, leather shoes',
  'batik_casual':           'wearing batik short-sleeve, linen trousers, sandals, relaxed Indonesian',
  'baju_koko_white':        'wearing white embroidered baju koko, tailored trousers, peci, elegant Islamic',
  'navy_casual_smart':      'wearing navy blazer, white shirt, beige chinos, pocket square',
  'all_black_editorial':    'wearing all-black, slim shirt, tailored trousers, boots, powerful minimal',
  'all_white_pure':         'wearing all-white, white linen shirt, white trousers, white sneakers, pure editorial',
  'flannel_outdoor':        'wearing plaid flannel shirt, dark jeans, boots, rugged outdoor casual',
  'beskap_jawa':            'wearing traditional Javanese beskap hitam, kain batik, blangkon, adat formal',
  'baju_adat_sunda':        'wearing Sundanese pangsi, baju kampret, iket sunda, traditional West Java',
  'baju_bali_traditional':  'wearing Balinese ceremonial outfit, udeng, kain poleng, sarung, traditional Bali',
  'melayu_baju_sampan':     'wearing Baju Melayu teluk belanga, sampin, songket, kopiah, Malay traditional',
  'polo_pastel':            'wearing pastel polo shirt, chinos tailored, casual refined',
  'striped_breton':         'wearing navy Breton striped shirt, white chinos, boat shoes, nautical',
  'earth_tone_linen':       'wearing earth tone brown linen shirt, dark trousers, leather sandals, boho',
  'korean_minimal_look':    'wearing Korean minimal grey turtleneck, slim trousers, clean editorial',
  'tuxedo_prewedding':      'wearing black tuxedo, white dress shirt, bow tie, formal elegant',
  'custom': null,
};
```

### 9.2 Prewedding Outfit — Female (30 options)
*(Extended from v2)*

```javascript
const PREWEDDING_OUTFIT_FEMALE = {
  'champagne_chiffon_flow': 'wearing champagne chiffon maxi flowing dress, spaghetti straps, elegant barefoot',
  'blush_maxi':             'wearing blush pink chiffon maxi, V-neckline, layered skirt, romantic',
  'dusty_rose_silk':        'wearing dusty rose silk slip dress, minimalist, modern romantic',
  'white_puff_sleeve':      'wearing white flowy maxi, puff sleeves, square neck, cottagecore',
  'sage_green_satin':       'wearing sage green satin midi, wrap silhouette, feminine natural',
  'lavender_lace':          'wearing lavender lace midi, flutter sleeves, delicate',
  'coral_tropical':         'wearing coral sundress, floral print, tropical vibrant summer',
  'emerald_gown':           'wearing emerald green silk gown, one shoulder, floor length, editorial',
  'red_dramatic_flow':      'wearing dramatic red flowing gown, off-shoulder, ruffled skirt, bold',
  'blue_navy_dramatic':     'wearing navy blue flowing gown, dramatic train, wind-blown editorial',
  'navy_dramatic_wind':     'wearing deep navy dramatic gown, flowing wide sleeves, wind-blown editorial',
  'white_bridal_prewed':    'wearing white bridal-style gown, flowing ethereal, pre-wedding bride look',
  'kebaya_modern_prewed':   'wearing modern kebaya, contemporary Indonesian, brokat lace, fitted',
  'kebaya_bali_prewed':     'wearing Balinese kebaya, songket, gold accessories, traditional Bali',
  'kebaya_sunda_prewed':    'wearing Sundanese kebaya, siger crown, delicate lace, West Java adat',
  'kebaya_jawa_prewed':     'wearing Javanese kebaya, batik kain, fine brocade, traditional Jawa',
  'gamis_prewed':           'wearing elegant gamis, flowing modest, embroidered, graceful Islamic',
  'hijab_prewed_formal':    'wearing hijab syari with gamis white, modest elegant, Muslim couple',
  'boho_lace_back':         'wearing bohemian lace maxi, open back, flowing, boho chic',
  'floral_midi_puff':       'wearing floral midi dress, puff sleeves, vintage feminine modern',
  'tiered_cotton_skirt':    'wearing white tiered midi skirt, tucked linen blouse, light summery',
  'korean_pastel_prewed':   'wearing Korean pastel blouse, wide-leg pants, trendy K-style',
  'all_white_set':          'wearing all-white matching set, white linen shirt, wide-leg trousers, minimal',
  'earth_boho_terracotta':  'wearing terracotta earth tone dress, macramé belt, natural boho',
  'tulle_skirt_elegant':    'wearing voluminous tulle skirt, fitted top, princess fairytale fashion',
  'linen_crop_set':         'wearing linen co-ord set, wide-leg trousers, crop top, modern casual',
  'satin_cowl_90s':         'wearing satin cowl-neck midi, bias cut, 90s inspired sophisticated',
  'velvet_midnight':        'wearing deep velvet midnight blue dress, elegant nocturnal sophisticated',
  'baju_bodo_bugis':        'wearing Bugis baju bodo, organza fabric, vivid color, South Sulawesi',
  'custom': null,
};
```

---

## 10. MENU: WEDDING

*(Outfits from v2 OUTFIT_WEDDING_PRIA and OUTFIT_WEDDING_WANITA — use as-is, already comprehensive)*

---

## 11. Shared Maps (All Menus)

### 11.1 Camera Map (12 options)

```javascript
const CAMERA_MAP = {
  'sony_a7r5':    'shot on Sony A7R V 61MP full frame',
  'canon_r5':     'shot on Canon EOS R5 45MP professional mirrorless',
  'fuji_gfx100s': 'shot on Fujifilm GFX 100S medium format 100MP',
  'hasselblad_x2':'shot on Hasselblad X2D 100C medium format',
  'nikon_z9':     'shot on Nikon Z9 flagship professional',
  'nikon_z8':     'shot on Nikon Z8 45MP mirrorless',
  'phase_one':    'shot on Phase One IQ4 150MP',
  'leica_sl3':    'shot on Leica SL3 full frame',
  'sony_fx3':     'shot on Sony FX3 cinematic',
  'canon_r3':     'shot on Canon EOS R3 professional',
  'fuji_xt5':     'shot on Fujifilm X-T5 40MP APS-C',
  'canon_r50':    'shot on Canon EOS R50 modern mirrorless',
};
```

### 11.2 Lens Map (22 options)

```javascript
const LENS_MAP = {
  // Wide — Full Body Friendly
  '24_14_wide':   '24mm f/1.4 ultra-wide prime, dramatic full body with environment, vast landscape couple',
  '28_18_wide':   '28mm f/1.8 wide prime, environmental full body portrait, context storytelling',
  '35_14_prime':  '35mm f/1.4 wide prime, natural full body perspective, editorial lifestyle full body',
  '35_12_wide':   '35mm f/1.2 ultra-fast wide, modern full body editorial, contemporary fashion',
  '40_28_comp':   '40mm f/2.8 compact prime, natural documentary full body portrait',
  // Standard — Versatile
  '50_12_std':    '50mm f/1.2 standard prime, natural human perspective, gorgeous bokeh',
  '50_14_std':    '50mm f/1.4 standard prime, classic natural perspective portrait',
  '55_18_std':    '55mm f/1.8 standard prime, balanced portrait with bokeh',
  '24_70_zoom':   '24-70mm f/2.8 professional zoom lens, versatile full body to portrait',
  // Portrait — Classic
  '85_14_port':   '85mm f/1.4 portrait prime, creamy background separation, classic flattering',
  '85_12_port':   '85mm f/1.2 portrait prime, ultra creamy bokeh, dreamy separation',
  '85_18_port':   '85mm f/1.8 portrait prime, sharp detailed portrait',
  '100_20_port':  '100mm f/2.0 medium telephoto, flattering portrait compression',
  '105_28_macro': '105mm f/2.8 macro portrait, extreme face detail',
  // Telephoto — Compressed
  '135_18_tele':  '135mm f/1.8 telephoto, beautiful subject separation, compressed romantic',
  '70_200_zoom':  '70-200mm f/2.8 telephoto zoom, versatile wedding and portrait',
  '200_20_tele':  '200mm f/2.0 extreme telephoto, dreamy maximum bokeh balls',
  // Medium Format
  '110_20_mf':    '110mm f/2.0 medium format lens, ultra-detailed large format rendering',
  '80_19_mf':     '80mm f/1.9 medium format, legendary film-like portrait rendering',
  '45_28_mf':     '45mm f/2.8 medium format wide, environmental medium format portrait',
  '150_28_mf':    '150mm f/2.8 medium format telephoto, beautiful compression',
  'custom': null,
};
```

### 11.3 Color Grade Map (22 options)

```javascript
const COLOR_GRADE_MAP = {
  'warm_cinematic':   'warm cinematic color grade, golden honey tones, film-like warmth',
  'golden_film':      'warm golden film tones, vintage warmth, nostalgic analog glow',
  'orange_teal':      'orange and teal cinematic grade, Hollywood blockbuster color contrast',
  'bright_airy':      'bright and airy, clean lifted whites, soft light-filled ethereal',
  'soft_pastel':      'soft pastel muted palette, dreamy washed colors, romantic',
  'neutral_film':     'neutral true-to-life film, organic grain texture, authentic timeless',
  'cool_editorial':   'cool editorial, desaturated greens, clean modern fashion',
  'blue_hour_cool':   'blue hour cinematic, cool twilight palette, night romance',
  'dark_moody':       'dark and moody, deep shadows, high contrast, cinematic blacks',
  'dark_luxury':      'dark luxury editorial, velvet blacks, rich sophisticated',
  'ultra_clean':      'ultra clean whites, crisp overexposed, flawless studio',
  'high_key':         'high key luminous, lifted all tones, white fashion editorial',
  'bw_fine_art':      'black and white fine art, rich silver gelatin, timeless monochrome',
  'bw_soft':          'soft black and white, gentle grey tones, romantic monochrome',
  'vintage_fade':     'vintage faded film, lifted blacks, muted nostalgic retro',
  'golden_regal':     'golden regal tones, rich amber warmth, royal sophisticated glow',
  'vivid_pop':        'vivid bold pop, high saturation, punchy Gen-Z fresh',
  'film_grain':       'film grain texture, authentic analog look, nostalgic warmth',
  'korea_soft':       'Korean aesthetic soft grade, slightly lifted, dewy bright skin, K-beauty',
  'moody_forest':     'moody forest green grade, deep organic shadows, woodland editorial',
  'sunset_warm':      'sunset warm, pink orange glow, romantic golden hour warmth',
  'custom': null,
};
```

### 11.4 Lighting Map (15 options)

```javascript
const LIGHTING_MAP = {
  'golden_hour':      'warm golden hour sunlight, elongated soft shadows, magic hour glow',
  'blue_hour':        'blue hour twilight, cool ambient light, evening soft romance',
  'sunrise_soft':     'soft sunrise first light, pink horizon, fresh morning atmosphere',
  'sunset_dramatic':  'dramatic sunset, blazing orange crimson sky, warm rim light, silhouette',
  'soft_morning':     'gentle morning diffused light, dewy fresh, cool calm atmosphere',
  'overcast_soft':    'overcast sky, perfectly soft diffused natural light, no harsh shadows',
  'studio_butterfly': 'butterfly studio lighting, symmetrical glamour, catchlight in eyes',
  'studio_rembrandt': 'Rembrandt studio lighting, dramatic triangle shadow, painterly quality',
  'studio_high_key':  'high-key soft box, bright even shadow-free, commercial clean beauty',
  'studio_low_key':   'low-key single dramatic light, deep shadows, fine art moody',
  'window_natural':   'natural window side light, soft diffused organic indoor light',
  'backlit_rim':      'backlit rim light, glowing outline, hair light halo, contre-jour',
  'studio_ring':      'ring light beauty, circular catchlight, dewy skin glow',
  'candle_warm':      'warm candlelight, intimate amber glow, romantic soft orange',
  'night_city_light': 'night city ambient, warm street lights bokeh, urban evening romance',
};
```

### 11.5 Style / Photography Style (15 options)

```javascript
const STYLE_MAP = {
  'cinematic':        'cinematic photography, movie still frame, dramatic storytelling',
  'fine_art':         'fine art photography, painterly composition, gallery quality',
  'editorial':        'editorial fashion, Vogue magazine quality, styled composition',
  'romantic':         'romantic photography, soft intimate light, love story visual',
  'documentary':      'documentary candid, natural unposed, authentic genuine',
  'warm_lifestyle':   'warm lifestyle, natural golden candid, real authentic moment',
  'korean_aesthetic': 'Korean aesthetic, soft skin tones, bright clean, K-drama quality',
  'dark_editorial':   'dark editorial, low-key dramatic, luxury fashion aesthetic',
  'vintage_analog':   'vintage analog film, grain nostalgic warmth, timeless',
  'moody_artistic':   'moody artistic, shadow play, atmospheric evocative',
  'aerial_epic':      'aerial drone epic, birds-eye dramatic, vast landscape scale',
  'backlit_glow':     'backlit photography, rim light halo, contre-jour silhouette',
  'high_fashion':     'high fashion editorial, avant-garde creative, magazine cover',
  'intimate_gentle':  'intimate gentle photography, soft emotion, tender personal',
  'custom': null,
};
```

---

## 12. PromptBuilder Functions

```javascript
// ─────────────────────────────────────────────────────────
// Core build function — returns JSON + compiled string
// ─────────────────────────────────────────────────────────
const PromptBuilder = {

  build(menu, params) {
    let json = {};
    switch (menu) {
      case 'wisuda':     json = this.buildWisuda(params);    break;
      case 'profesional':json = this.buildProfesional(params); break;
      case 'maternity':  json = this.buildMaternity(params);  break;
      case 'studio_korea':json = this.buildStudioKorea(params); break;
      case 'prewedding': json = this.buildPrewedding(params); break;
      case 'wedding':    json = this.buildWedding(params);    break;
    }
    return {
      json,                           // structured JSON (for debugging / logging)
      prompt: this.compile(json),     // compiled English string (sent to API)
    };
  },

  compile(json) {
    return [
      json.subject,
      json.pose,
      json.outfit,
      json.background_detail,
      json.lighting,
      json.atmosphere || '',
      json.expression,
      json.shot_type,
      json.style,
      json.color_grade,
      json.camera,
      json.lens,
      json.props || '',
      json.category_modifier,
      json.auto_modifiers,
    ].filter(Boolean).join(', ');
  },

  buildWisuda(p) {
    return {
      subject:           SUBJECT_MAP[p.ethnicity] || SUBJECT_MAP['indonesian_f'],
      outfit:            WISUDA_OUTFIT_FEMALE[p.outfit] || WISUDA_OUTFIT_MALE[p.outfit],
      background_detail: WISUDA_BACKGROUND[p.background]?.detail || p.backgroundCustom,
      pose:              WISUDA_POSE[p.pose],
      shot_type:         this.getShotType(p.pose),
      expression:        'proud joyful achievement expression, bright confident eyes, warm celebratory smile',
      lighting:          LIGHTING_MAP[p.lighting],
      atmosphere:        'celebratory milestone atmosphere, academic achievement pride',
      lens:              LENS_MAP[p.lens],
      camera:            CAMERA_MAP[p.camera],
      color_grade:       COLOR_GRADE_MAP[p.colorGrade],
      style:             STYLE_MAP[p.style],
      props:             WISUDA_PROPS[p.props] || '',
      category_modifier: CATEGORY_MODIFIERS.wisuda,
      auto_modifiers:    AUTO_MODIFIERS,
    };
  },

  buildProfesional(p) {
    return {
      subject:           SUBJECT_MAP[p.ethnicity],
      outfit:            PROFESIONAL_OUTFIT_FEMALE[p.outfit] || PROFESIONAL_OUTFIT_MALE[p.outfit],
      background_detail: PROFESIONAL_BACKGROUND[p.background]?.detail || p.backgroundCustom,
      pose:              PROFESIONAL_SHOT[p.shot],
      shot_type:         'half body portrait, professional framing, face takes up significant frame area',
      expression:        PROFESIONAL_EXPRESSION[p.expression],
      lighting:          LIGHTING_MAP[p.lighting],
      atmosphere:        'clean professional atmosphere, personal brand, career-ready',
      lens:              LENS_MAP[p.lens] || LENS_MAP['85_14_port'],
      camera:            CAMERA_MAP[p.camera],
      color_grade:       COLOR_GRADE_MAP[p.colorGrade],
      style:             'professional headshot photography, personal branding portrait, LinkedIn quality',
      props:             '',
      category_modifier: CATEGORY_MODIFIERS.profesional,
      auto_modifiers:    AUTO_MODIFIERS,
    };
  },

  buildMaternity(p) {
    return {
      subject:           `${SUBJECT_MAP[p.ethnicity]}, visibly pregnant 7-9 months, beautiful radiant pregnant belly`,
      outfit:            MATERNITY_OUTFIT[p.outfit],
      background_detail: MATERNITY_BACKGROUND[p.background]?.detail || p.backgroundCustom,
      pose:              MATERNITY_POSE[p.pose],
      shot_type:         this.getShotType(p.pose),
      expression:        'radiant glowing pregnant expression, serene maternal joy, peaceful anticipation',
      lighting:          LIGHTING_MAP[p.lighting],
      atmosphere:        'celebrating motherhood, pregnancy glow, tender beautiful maternity',
      lens:              LENS_MAP[p.lens],
      camera:            CAMERA_MAP[p.camera],
      color_grade:       COLOR_GRADE_MAP[p.colorGrade],
      style:             STYLE_MAP[p.style],
      props:             '',
      category_modifier: CATEGORY_MODIFIERS.maternity,
      auto_modifiers:    AUTO_MODIFIERS,
    };
  },

  buildStudioKorea(p) {
    return {
      subject:           SUBJECT_MAP[p.ethnicity],
      outfit:            KOREA_OUTFIT_FEMALE[p.outfit] || KOREA_OUTFIT_MALE[p.outfit],
      background_detail: KOREA_BACKGROUND[p.background]?.detail || p.backgroundCustom,
      pose:              KOREA_POSE[p.pose],
      shot_type:         this.getShotType(p.pose),
      expression:        'soft natural Korean beauty expression, dewy glowing skin, K-drama mood',
      lighting:          LIGHTING_MAP[p.lighting] || 'soft Korean studio lighting, clean wrap light, beauty illumination',
      atmosphere:        'Korean studio aesthetic, clean minimal K-drama atmosphere',
      lens:              LENS_MAP[p.lens],
      camera:            CAMERA_MAP[p.camera],
      color_grade:       COLOR_GRADE_MAP[p.colorGrade] || COLOR_GRADE_MAP['korea_soft'],
      style:             STYLE_MAP[p.style] || 'Korean studio photography, K-drama aesthetic, fashion editorial',
      props:             '',
      category_modifier: CATEGORY_MODIFIERS.studio_korea,
      auto_modifiers:    AUTO_MODIFIERS,
    };
  },

  // Helper: determine shot_type string from pose key
  getShotType(poseKey) {
    if (!poseKey) return 'full body portrait, head to toe';
    if (poseKey.startsWith('fb_')) return 'full body portrait, head to toe, complete look';
    if (poseKey.startsWith('wide_')) return 'wide environmental shot, figure in landscape, sense of scale';
    if (poseKey.includes('closeup') || poseKey.includes('close_up') || poseKey.includes('belly_close'))
      return 'close-up portrait, tight framing, emotional detail';
    if (poseKey.startsWith('34_') || poseKey.includes('three_quarter'))
      return '3/4 body portrait, three-quarter framing, natural body language';
    if (poseKey.startsWith('headshot_') || poseKey.includes('id_card') || poseKey.includes('passport'))
      return 'headshot portrait, shoulders and face, tight professional framing';
    return 'full body portrait, head to toe, complete composition';
  },
};
```

---

## 13. Sample Final Prompts (Expected Output)

### Sample: Wisuda

```
beautiful Indonesian woman, warm golden skin, dark lustrous hair, 
standing tall and proud, shoulders back, diploma in hand, full body confident portrait, 
wearing black graduation toga gown, mortarboard cap, white hijab, neat professional appearance, 
grand university library hall, floor-to-ceiling bookshelves, warm academic atmosphere, 
soft golden morning light, gentle rim light, 
celebratory milestone atmosphere, academic achievement pride, 
proud joyful achievement expression, bright confident eyes, warm celebratory smile, 
full body portrait, head to toe, architectural background, 
editorial lifestyle photography, bright and airy, clean whites, lifted tones, 
shot on Canon EOS R5 45MP, 35mm f/1.4 wide prime, natural full body perspective, 
graduation photography, academic achievement, milestone portrait, proud graduation moment,
ultra realistic, photorealistic, 8k resolution, professional photography, sharp focus, 
high detail skin texture, depth of field, bokeh, full body portrait, RAW photo, no watermark
```

### Sample: Profesional (LinkedIn)

```
handsome Indonesian man, warm skin tone, dark neat hair, 
professional headshot, face and shoulders, face takes up 60% of frame, clean framing, 
wearing navy suit, white dress shirt, silk tie, formal corporate professional, 
soft grey gradient backdrop, timeless corporate headshot standard, 
soft window natural light, clean even professional illumination, 
clean professional atmosphere, personal brand, career-ready, 
confident direct eye contact, professional authority, trustworthy gaze, 
half body portrait, LinkedIn standard framing, 
professional headshot photography, neutral film true-to-life, 
shot on Canon EOS R5, 85mm f/1.4 portrait prime, 
professional headshot photography, corporate portrait, personal branding, LinkedIn quality, 
ultra realistic, photorealistic, 8k resolution, professional photography, no text, no watermark
```

### Sample: Maternity

```
beautiful Indonesian woman, warm golden skin, visibly pregnant 7-9 months, beautiful radiant pregnant belly, 
full body standing, both hands gently cradling pregnant belly, peaceful radiant expression, 
wearing white flowing silk maternity gown, empire waist, elegant bare shoulder, 7-9 months pregnant belly prominent, 
full fresh flower arch, roses and peonies and greenery, romantic floral maternity backdrop, 
warm golden hour sunlight, elongated soft shadows, magic hour glow, 
celebrating motherhood, pregnancy glow, tender beautiful maternity, 
radiant glowing pregnant expression, serene maternal joy, peaceful anticipation, 
full body portrait, head to toe, complete composition, 
fine art photography, painterly composition, gallery quality, 
soft pastel muted palette, dreamy washed colors, romantic, 
shot on Sony A7R V, 85mm f/1.4 portrait prime, 
maternity photography, pregnancy portrait, glowing mother-to-be, 7-9 months pregnant, 
ultra realistic, photorealistic, 8k resolution, high detail skin texture, RAW photo, no watermark
```

### Sample: Studio Korea

```
beautiful Korean woman, fair dewy skin, K-beauty natural makeup, 
full body standing, one hand on hip naturally, Korean fashion editorial pose, 
wearing blush pink chiffon midi dress, feminine sweet K-drama style, 
full pink flower wall, roses and blooms, iconic Korean studio floral backdrop, 
soft Korean studio lighting, clean wrap light, beauty illumination, 
Korean studio aesthetic, clean minimal K-drama atmosphere, 
soft natural Korean beauty expression, dewy glowing skin, K-drama mood, 
full body portrait, head to toe, complete look, 
Korean studio photography, K-drama aesthetic, fashion editorial, 
Korean soft grade, slightly lifted, dewy bright skin, K-beauty, 
shot on Hasselblad X2D 100C, 85mm f/1.4 portrait prime, 
Korean studio photography, K-drama aesthetic, studio portrait, clean minimalist Korean style, 
ultra realistic, photorealistic, 8k resolution, sharp focus, RAW photo, no watermark
```

---

*PotretAI v3 · PromptBuilder v3.0 · March 2025*
*Menus: Wisuda | Profesional | Maternity | Studio Korea | Prewedding | Wedding*
*Research: Google Trends, Pinterest 2024-2025, Korean Studio, Indonesian Photography Market*
