(function () {
const concentrations = [
  {
    id: 'edt',
    name: 'EDT',
    label: 'Eau de Toilette',
    description: 'Lighter and brighter. Best for fresh, airy, easy daily wear.',
    guidance: { top: [18, 30], heart: [35, 50], base: [25, 40] }
  },
  {
    id: 'edp',
    name: 'EDP',
    label: 'Eau de Parfum',
    description: 'Balanced concentration with moderate projection and longevity. Best for signature scents.',
    guidance: { top: [10, 25], heart: [30, 50], base: [30, 50] }
  },
  {
    id: 'extrait',
    name: 'Extrait',
    label: 'Extrait de Parfum',
    description: 'Deeper, richer, and more intimate. Best for long-lasting personal compositions.',
    guidance: { top: [5, 18], heart: [25, 45], base: [40, 65] }
  }
];

const families = [
  'Fresh', 'Green', 'Floral', 'Tea', 'Woody', 'Fruity', 'Gourmand', 'Powdery', 'Musk', 'Earthy', 'Spicy', 'Amber', 'Marine', 'Leather & Tobacco', 'Atmospheric'
];

const categoryProfiles = {
  Citrus: { layer: ['top'], family: 'Citrus', freshness: 9, sweetness: 2, warmth: 1, green: 3, floral: 1, woody: 0, powdery: 0, clean: 6, darkness: 0, strangeness: 1, intensity: 5, longevity: 2, tags: ['sparkling', 'fresh', 'bright'] },
  Fruity: { layer: ['top', 'heart'], family: 'Fruity', freshness: 5, sweetness: 7, warmth: 2, green: 1, floral: 1, woody: 0, powdery: 0, clean: 3, darkness: 1, strangeness: 2, intensity: 5, longevity: 4, tags: ['juicy', 'sweet', 'playful'] },
  Floral: { layer: ['heart'], family: 'Floral', freshness: 4, sweetness: 4, warmth: 3, green: 2, floral: 9, woody: 0, powdery: 2, clean: 4, darkness: 1, strangeness: 2, intensity: 6, longevity: 5, tags: ['petal', 'romantic', 'heart'] },
  Green: { layer: ['top', 'heart'], family: 'Green', freshness: 7, sweetness: 1, warmth: 1, green: 9, floral: 1, woody: 1, powdery: 0, clean: 5, darkness: 1, strangeness: 3, intensity: 6, longevity: 4, tags: ['leafy', 'crisp', 'botanical'] },
  'Tea & Aromatic': { layer: ['top', 'heart'], family: 'Tea', freshness: 6, sweetness: 2, warmth: 3, green: 5, floral: 1, woody: 1, powdery: 1, clean: 5, darkness: 1, strangeness: 2, intensity: 5, longevity: 4, tags: ['infused', 'aromatic', 'calm'] },
  Spicy: { layer: ['top', 'heart'], family: 'Spicy', freshness: 2, sweetness: 2, warmth: 8, green: 1, floral: 1, woody: 2, powdery: 1, clean: 1, darkness: 3, strangeness: 3, intensity: 7, longevity: 5, tags: ['warm', 'piquant', 'radiant'] },
  Gourmand: { layer: ['heart', 'base'], family: 'Gourmand', freshness: 1, sweetness: 9, warmth: 6, green: 0, floral: 0, woody: 1, powdery: 2, clean: 1, darkness: 2, strangeness: 2, intensity: 6, longevity: 6, tags: ['edible', 'sweet', 'comforting'] },
  Woods: { layer: ['base'], family: 'Woody', freshness: 1, sweetness: 2, warmth: 6, green: 2, floral: 0, woody: 9, powdery: 1, clean: 2, darkness: 4, strangeness: 2, intensity: 6, longevity: 8, tags: ['dry', 'textured', 'base'] },
  Earthy: { layer: ['base'], family: 'Earthy', freshness: 2, sweetness: 1, warmth: 4, green: 4, floral: 0, woody: 5, powdery: 2, clean: 0, darkness: 6, strangeness: 5, intensity: 6, longevity: 7, tags: ['soil', 'rooty', 'grounded'] },
  'Amber & Resin': { layer: ['base'], family: 'Amber', freshness: 0, sweetness: 5, warmth: 9, green: 0, floral: 0, woody: 4, powdery: 2, clean: 1, darkness: 5, strangeness: 3, intensity: 7, longevity: 9, tags: ['resinous', 'warm', 'lasting'] },
  Musk: { layer: ['base'], family: 'Musk', freshness: 3, sweetness: 2, warmth: 4, green: 0, floral: 0, woody: 1, powdery: 4, clean: 7, darkness: 1, strangeness: 2, intensity: 4, longevity: 8, tags: ['soft', 'skin', 'fixative'] },
  'Marine & Air': { layer: ['top', 'heart'], family: 'Marine', freshness: 8, sweetness: 1, warmth: 0, green: 2, floral: 0, woody: 1, powdery: 0, clean: 8, darkness: 1, strangeness: 4, intensity: 5, longevity: 4, tags: ['airy', 'mineral', 'cool'] },
  'Leather & Tobacco': { layer: ['base'], family: 'Leather & Tobacco', freshness: 0, sweetness: 3, warmth: 7, green: 1, floral: 0, woody: 5, powdery: 2, clean: 0, darkness: 8, strangeness: 4, intensity: 7, longevity: 8, tags: ['smoky', 'textured', 'dark'] },
  Powdery: { layer: ['heart', 'base'], family: 'Powdery', freshness: 2, sweetness: 4, warmth: 4, green: 0, floral: 3, woody: 1, powdery: 9, clean: 5, darkness: 1, strangeness: 2, intensity: 4, longevity: 6, tags: ['soft', 'cosmetic', 'velvet'] },
  Atmospheric: { layer: ['top', 'heart', 'base'], family: 'Atmospheric', freshness: 5, sweetness: 2, warmth: 4, green: 3, floral: 1, woody: 3, powdery: 3, clean: 4, darkness: 4, strangeness: 8, intensity: 5, longevity: 5, tags: ['scene', 'memory', 'abstract'] }
};

const catalog = {
  Citrus: ['Bergamot', 'Lemon', 'Lime', 'Sweet Orange', 'Mandarin', 'Blood Orange', 'Grapefruit', 'Yuzu', 'Citron', 'Tangerine', 'Kaffir Lime', 'Neroli', 'Petitgrain'],
  Fruity: ['Pear', 'Apple', 'Green Apple', 'Peach', 'Apricot', 'Plum', 'Cherry', 'Blackcurrant', 'Raspberry', 'Strawberry', 'Fig', 'Mango', 'Pineapple', 'Lychee', 'Guava', 'Melon', 'Coconut', 'Banana', 'Pomegranate', 'Grape', 'Blueberry', 'Passion Fruit'],
  Floral: ['Rose', 'Turkish Rose', 'Bulgarian Rose', 'Jasmine Sambac', 'Jasmine Grandiflorum', 'Orange Blossom', 'Lavender', 'Geranium', 'Violet', 'Violet Leaf', 'Iris', 'Orris', 'Peony', 'Magnolia', 'Tuberose', 'Ylang-Ylang', 'Freesia', 'Lily of the Valley', 'Mimosa', 'Heliotrope', 'Carnation', 'Lotus', 'Osmanthus', 'Gardenia', 'Honeysuckle', 'Champaca'],
  Green: ['Grass', 'Tomato Leaf', 'Galbanum', 'Fig Leaf', 'Tea Leaf', 'Mate', 'Mint', 'Spearmint', 'Basil', 'Shiso', 'Green Sap', 'Cucumber', 'Green Stem', 'Ivy', 'Fern', 'Bamboo', 'Mossy Leaves'],
  'Tea & Aromatic': ['Green Tea', 'Black Tea', 'White Tea', 'Earl Grey', 'Matcha', 'Oolong Tea', 'Milk Tea', 'Tea Steam Accord', 'Chamomile', 'Sage', 'Rosemary', 'Thyme', 'Bay Leaf', 'Clary Sage', 'Absinthe'],
  Spicy: ['Black Pepper', 'Pink Pepper', 'White Pepper', 'Cardamom', 'Cinnamon', 'Clove', 'Nutmeg', 'Ginger', 'Saffron', 'Star Anise', 'Coriander Seed', 'Juniper Berry', 'Chili Pepper'],
  Gourmand: ['Vanilla', 'Madagascar Vanilla', 'Tonka Bean', 'Chocolate', 'Dark Chocolate', 'White Chocolate', 'Coffee', 'Espresso', 'Latte Accord', 'Milk', 'Cream', 'Whipped Cream', 'Caramel', 'Toffee', 'Praline', 'Honey', 'Maple Syrup', 'Brown Sugar', 'Biscuit', 'Almond', 'Hazelnut', 'Peanut', 'Pistachio', 'Marshmallow', 'Ice Cream Accord', 'Bread Accord', 'Butter Accord', 'Cotton Candy'],
  Woods: ['Cedarwood', 'Virginia Cedar', 'Atlas Cedar', 'Sandalwood', 'Australian Sandalwood', 'Mysore Sandalwood', 'Rosewood', 'Guaiac Wood', 'Hinoki', 'Oakwood', 'Cashmere Wood', 'Palo Santo', 'Oud', 'Birch Wood', 'Driftwood', 'Ebony Wood', 'Dry Woods', 'Soft Woods'],
  Earthy: ['Vetiver', 'Patchouli', 'Moss', 'Oakmoss', 'Soil Accord', 'Wet Earth', 'Root Accord', 'Mushroom Accord', 'Truffle Accord', 'Mineral Earth', 'Clay', 'Dust Accord'],
  'Amber & Resin': ['Amber', 'Labdanum', 'Benzoin', 'Frankincense', 'Myrrh', 'Opoponax', 'Elemi', 'Peru Balsam', 'Tolu Balsam', 'Copal', 'Styrax', 'Ambergris Accord'],
  Musk: ['White Musk', 'Clean Musk', 'Skin Musk', 'Powder Musk', 'Soft Musk', 'Cotton Musk', 'Animalic Musk', 'Ambrette Seed', 'Muscone Accord'],
  'Marine & Air': ['Sea Salt', 'Ocean Accord', 'Marine Accord', 'Mineral Accord', 'Cold Air Accord', 'Rain Accord', 'Storm Accord', 'Water Accord', 'Dew Accord', 'Ozonic Accord', 'Snow Accord', 'River Stone'],
  'Leather & Tobacco': ['Leather', 'Suede', 'Soft Leather', 'Tobacco', 'Pipe Tobacco', 'Tobacco Flower', 'Hay', 'Smoke', 'Burnt Wood', 'Incense Smoke', 'Ash Accord', 'Tar Accord'],
  Powdery: ['Rice Powder', 'White Powder Accord', 'Cosmetic Powder', 'Baby Powder', 'Lipstick Accord', 'Almond Powder', 'Violet Powder', 'Soft Talc'],
  Atmospheric: ['Morning Mist', 'Old Library Accord', 'Rainy Street Accord', 'Forest Air', 'Mountain Wind', 'Cold Stone', 'Sunlit Garden', 'Abandoned Greenhouse', 'Tea House Accord', 'Candlelight Room', 'Paper Accord', 'Ink Accord', 'Old Wood Room', 'Dusty Window', 'Warm Skin Accord', 'Clean Shirt Accord', 'Fresh Laundry Accord']
};

const materialOverrides = {
  neroli: { layer: ['top', 'heart'], floral: 7, clean: 7, tags: ['orange blossom', 'clean', 'luminous'] },
  petitgrain: { green: 7, sweetness: 0, woody: 2, tags: ['twig', 'bitter', 'green'] },
  kaffir_lime: { green: 6, strangeness: 3, tags: ['zesty', 'leafy', 'sharp'] },
  blackcurrant: { green: 5, darkness: 3, strangeness: 5, intensity: 7, tags: ['tart', 'green', 'berry'] },
  fig: { green: 5, woody: 2, sweetness: 5, tags: ['milky', 'leafy', 'soft fruit'] },
  coconut: { layer: ['heart', 'base'], sweetness: 6, warmth: 5, clean: 2, tags: ['creamy', 'lactonic', 'tropical'] },
  violet_leaf: { category: 'Green', family: 'Green', layer: ['heart'], freshness: 6, green: 9, floral: 2, sweetness: 0, tags: ['watery', 'leaf', 'cool'] },
  iris: { category: 'Powdery', family: 'Powdery', layer: ['base'], powdery: 9, floral: 5, woody: 2, longevity: 8, tags: ['rooty', 'elegant', 'powder'] },
  orris: { category: 'Powdery', family: 'Powdery', layer: ['base'], powdery: 10, floral: 4, woody: 2, longevity: 9, tags: ['buttery', 'rooty', 'luxury'] },
  tuberose: { intensity: 9, sweetness: 6, warmth: 5, strangeness: 4, tags: ['creamy', 'white floral', 'narcotic'] },
  jasmine_sambac: { intensity: 8, warmth: 5, sweetness: 5, darkness: 2, tags: ['white floral', 'radiant', 'sensual'] },
  galbanum: { intensity: 8, green: 10, sweetness: 0, darkness: 3, tags: ['bitter', 'resinous', 'green'] },
  mint: { freshness: 10, clean: 8, warmth: 0, tags: ['cool', 'sparkling', 'fresh'] },
  absinthe: { darkness: 4, strangeness: 7, green: 7, tags: ['bitter', 'herbal', 'unusual'] },
  saffron: { intensity: 8, warmth: 8, leather: 4, darkness: 5, tags: ['metallic', 'leathery', 'golden'] },
  chili_pepper: { intensity: 8, warmth: 9, strangeness: 6, tags: ['hot', 'sharp', 'unexpected'] },
  coffee: { darkness: 6, warmth: 7, sweetness: 4, longevity: 7, tags: ['roasted', 'dark', 'bitter'] },
  espresso: { darkness: 7, intensity: 8, warmth: 7, tags: ['roasted', 'intense', 'bitter'] },
  dark_chocolate: { darkness: 6, sweetness: 6, warmth: 7, tags: ['cocoa', 'bitter', 'dense'] },
  oud: { intensity: 9, longevity: 10, darkness: 8, strangeness: 7, tags: ['dark wood', 'resinous', 'animalic'] },
  birch_wood: { darkness: 6, warmth: 6, tags: ['smoky', 'dry', 'leathered'] },
  vetiver: { green: 5, woody: 8, darkness: 5, tags: ['rooty', 'dry', 'earthy'] },
  patchouli: { sweetness: 3, warmth: 6, darkness: 6, tags: ['earthy', 'woody', 'rich'] },
  oakmoss: { green: 6, darkness: 5, clean: 1, tags: ['mossy', 'forest', 'chypre'] },
  ambergris_accord: { clean: 5, marine: 5, warmth: 6, strangeness: 5, tags: ['salty', 'skin', 'radiant'] },
  animalic_musk: { clean: 0, darkness: 5, strangeness: 7, intensity: 7, tags: ['animalic', 'warm', 'skin'] },
  sea_salt: { freshness: 8, clean: 7, strangeness: 3, tags: ['salty', 'mineral', 'breeze'] },
  storm_accord: { darkness: 5, strangeness: 7, freshness: 8, tags: ['ozonic', 'wet', 'electric'] },
  tar_accord: { darkness: 9, strangeness: 8, intensity: 8, tags: ['black', 'smoky', 'industrial'] },
  lipstick_accord: { powdery: 8, sweetness: 4, floral: 4, tags: ['cosmetic', 'retro', 'waxy'] },
  old_library_accord: { layer: ['heart', 'base'], woody: 6, powdery: 5, darkness: 5, strangeness: 8, tags: ['paper', 'dust', 'wood'] },
  rainy_street_accord: { freshness: 8, clean: 5, darkness: 4, strangeness: 7, tags: ['wet pavement', 'rain', 'urban'] },
  abandoned_greenhouse: { green: 7, darkness: 5, strangeness: 9, tags: ['humid', 'glass', 'overgrown'] },
  clean_shirt_accord: { clean: 10, powdery: 4, freshness: 7, tags: ['laundry', 'cotton', 'soft'] },
  warm_skin_accord: { warmth: 7, clean: 5, sweetness: 3, tags: ['skin', 'soft', 'intimate'] }
};

const indischePreview = [
  'Bubble Lake Accord', 'White Foam Accord', 'Forest Mist Accord', 'Blue Rose Accord', 'Mooo Milk Accord', 'Tonka Ice Cream Accord', 'Plum Jam Accord', 'Carrot Garden Accord', 'Old Cafe Accord', 'Iron Banana Accord', 'Forest Shower Accord', 'Maison Dust Accord'
];

function slugify(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function clampScore(value) {
  return Math.max(0, Math.min(10, Math.round(value)));
}

const materialCharacters = {
  'Bergamot': 'A sparkling, tea-like citrus with a gentle bitter peel; it gives an opening polished brightness.',
  'Lemon': 'A clean, zesty burst of yellow peel that cuts through sweetness and sharpens the opening.',
  'Lime': 'A tart, electric green citrus that brings a crisp cocktail-like lift to fresh compositions.',
  'Sweet Orange': 'A round, sunny orange sweetness that makes citrus accords feel cheerful and approachable.',
  'Mandarin': 'A soft, juicy citrus with a tender peel nuance; it adds a playful glow without harshness.',
  'Blood Orange': 'A darker, berry-tinged orange with a bittersweet bite that gives citrus more depth.',
  'Grapefruit': 'A bright, pithy citrus with a dry bitter edge, ideal for a brisk contemporary start.',
  'Yuzu': 'A vivid Japanese citrus with tart mandarin and floral facets, creating an energetic opening.',
  'Neroli': 'A luminous orange-flower note with green citrus freshness and a clean, airy floral trail.',
  'Petitgrain': 'A bitter-green distillation of citrus leaves and twigs that adds structure to bright accords.',
  'Fig': 'A milky green fruit note that balances creamy pulp, leafy sap, and quiet Mediterranean warmth.',
  'Blackcurrant': 'A tart, wine-dark berry with a distinctive green bud nuance that adds dramatic lift.',
  'Coconut': 'A smooth lactonic tropical note that introduces creamy solar softness and gentle warmth.',
  'Jasmine Sambac': 'A radiant white flower with indolic warmth and green tea facets, giving the heart sensual bloom.',
  'Jasmine Grandiflorum': 'A petal-rich jasmine with soft apricot warmth and a classical floral elegance.',
  'Tuberose': 'A heady, creamy white floral with narcotic sweetness and powerful evening presence.',
  'Iris': 'A cool, rooty floral with suede-like powder, bringing refined dryness and quiet luxury.',
  'Orris': 'A buttery, violet-tinged iris root that gives a composition an elegant powdery finish.',
  'Violet Leaf': 'A watery green leaf with metallic coolness, excellent for dewy garden and rain effects.',
  'Galbanum': 'An intensely bitter green resin that creates sharp snapped-stem freshness and vintage character.',
  'Tomato Leaf': 'A crushed-leaf, sun-warmed green note with tangy sap and unmistakable garden realism.',
  'Mint': 'A brisk mentholated leaf that cools the composition and brightens aromatic materials.',
  'Matcha': 'A finely ground green tea note with grassy bitterness, creaminess, and contemplative calm.',
  'Earl Grey': 'A black tea accord illuminated by bergamot, offering dry tannins and a tailored citrus lift.',
  'Absinthe': 'A bitter herbal accord with anise-like shadows and a mysterious green edge.',
  'Saffron': 'A warm metallic spice with leathery, suede-like radiance and luxurious golden depth.',
  'Cardamom': 'A cool-warm aromatic spice that feels citrusy, airy, and softly creamy rather than heavy.',
  'Black Pepper': 'A dry, crackling spice that adds instant bite, lift, and masculine-leaning energy.',
  'Pink Pepper': 'A rosy, sparkling pepper that brings fruity spice and a buoyant modern glow.',
  'Vanilla': 'A smooth, sweet balsamic note that rounds sharp edges and creates comforting warmth.',
  'Tonka Bean': 'A coumarin-rich blend of almond, hay, and vanilla that gives an addictive soft warmth.',
  'Coffee': 'A roasted, dark bean note with bitter warmth, ideal for gourmand and nocturnal compositions.',
  'Espresso': 'A concentrated coffee accord with bitter crema, roast, and an intense dark pull.',
  'Oud': 'A deep resinous wood with animalic shadows and exceptional persistence; use it for dramatic depth.',
  'Sandalwood': 'A creamy, softly woody material that adds velvety warmth and a long, serene base.',
  'Vetiver': 'A dry root with smoky grass, grapefruit-like freshness, and quietly earthy elegance.',
  'Patchouli': 'A dark leafy earth note with woody sweetness, grounding florals and gourmands alike.',
  'Oakmoss': 'A forest-floor moss with inky green bitterness that lends classic chypre structure.',
  'Amber': 'A glowing, enveloping accord of warm resin, soft sweetness, and lingering golden comfort.',
  'Frankincense': 'A silvery church-resin note that feels lemony, smoky, and quietly meditative.',
  'White Musk': 'A clean, soft skin-like musk that diffuses other notes with a fresh laundry finish.',
  'Animalic Musk': 'A warm, intimate musk with fur-like depth, adding sensuality and a lived-in skin effect.',
  'Sea Salt': 'A crystalline salty breeze that evokes skin after the sea and brightens marine notes.',
  'Ocean Accord': 'A wide blue-water impression with salty spray, cool air, and gentle aquatic movement.',
  'Marine Accord': 'A transparent sea-breeze accord combining salty air, wet stone, and cool open-water freshness.',
  'Mineral Accord': 'A flinty, rain-washed mineral tone that brings cold stone clarity and modern dryness.',
  'Cold Air Accord': 'A crisp, high-altitude air effect with icy clarity and a faint metallic chill.',
  'Rain Accord': 'A soft wet-air accord suggesting fresh rainfall, damp leaves, and a clean grey sky.',
  'Storm Accord': 'An ozonic, electric burst of wet wind and charged clouds for a dramatic atmospheric lift.',
  'Water Accord': 'A smooth, transparent aquatic effect that gives a composition fluidity without strong salinity.',
  'Dew Accord': 'A delicate dewy freshness with cool petals and early-morning moisture.',
  'Ozonic Accord': 'A breezy, slightly metallic air note that recreates the charged freshness after rain.',
  'Snow Accord': 'A hushed frozen-air effect with pale cleanliness, soft mineral cold, and spaciousness.',
  'River Stone': 'A cool, smooth pebble note with damp mineral texture and calm freshwater clarity.',
  'Leather': 'A supple, warm hide accord that adds polished depth, smoke, and tactile sophistication.',
  'Suede': 'A soft brushed-leather texture with powdery warmth, gentler and more intimate than leather.',
  'Tobacco': 'A rich cured-leaf note with honeyed hay, smoke, and a warm amber-brown character.',
  'Smoke': 'A dry veil of smouldering wood that brings atmosphere and shadow without heavy sweetness.',
  'Lipstick Accord': 'A waxy violet-powder cosmetic accord with retro glamour and a soft iris finish.',
  'Old Library Accord': 'A nostalgic blend of dry paper, worn wood, dust, and the quiet warmth of old bindings.',
  'Rainy Street Accord': 'Wet pavement, cool rain, and urban stone combine for a reflective after-shower atmosphere.',
  'Abandoned Greenhouse': 'Humid glass, overgrown leaves, damp earth, and filtered light create an uncanny botanical scene.',
  'Warm Skin Accord': 'A softly musky, slightly salty skin effect that sits close and feels quietly intimate.',
  'Clean Shirt Accord': 'Fresh cotton, pale musk, and pressed fabric create a crisp, freshly dressed impression.',
  'Fresh Laundry Accord': 'A breezy wash-day accord with clean fabric, soft soap, and sunlit linen clarity.'
};

const categoryCharacterProfiles = {
  Citrus: ['sparkling peel', 'bitter zest', 'sunlit juice', 'crisp pith', 'fresh-squeezed brightness'],
  Fruity: ['juicy pulp', 'ripe skin', 'tart nectar', 'soft fruit flesh', 'playful sweetness'],
  Floral: ['petal-rich bloom', 'dewy floral softness', 'luminous bouquet', 'velvety blossom', 'romantic floral air'],
  Green: ['crushed-leaf freshness', 'sap-green tension', 'cool botanical bite', 'fresh stem texture', 'living garden air'],
  'Tea & Aromatic': ['steeped herbal clarity', 'dry aromatic lift', 'calm infusion warmth', 'tannic freshness', 'meditative herbal air'],
  Spicy: ['radiant spice', 'dry piquancy', 'warm aromatic heat', 'sparkling spice lift', 'textured seasoning'],
  Gourmand: ['edible comfort', 'creamy sweetness', 'toasted warmth', 'dessert-like richness', 'soft confectionery warmth'],
  Woods: ['dry grain', 'polished timber', 'quiet woody warmth', 'textured forest depth', 'smooth timber softness'],
  Earthy: ['rooted earthiness', 'damp-soil texture', 'mineral depth', 'dark natural warmth', 'grounded forest character'],
  'Amber & Resin': ['glowing resin warmth', 'balsamic depth', 'incense-like radiance', 'golden persistence', 'smouldering sweetness'],
  Musk: ['skin-like softness', 'clean diffusion', 'powdery warmth', 'quiet intimacy', 'soft lastingness'],
  'Marine & Air': ['cool open-air freshness', 'watery transparency', 'mineral breeze', 'ozonic clarity', 'salt-kissed space'],
  'Leather & Tobacco': ['smoky texture', 'burnished warmth', 'dark tactile depth', 'cured-leaf richness', 'shadowed refinement'],
  Powdery: ['velvet powder softness', 'cosmetic warmth', 'silky diffusion', 'soft-focus elegance', 'pale powder texture'],
  Atmospheric: ['evocative scene-setting', 'memory-like atmosphere', 'cinematic air', 'abstract place-making', 'immersive ambience']
};

function descriptionFor(name, category) {
  if (materialCharacters[name]) return materialCharacters[name];
  const profiles = categoryCharacterProfiles[category] || ['distinctive character'];
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  const character = profiles[hash % profiles.length];
  return `${name} offers ${character}, giving the composition a recognisable ${category.toLowerCase()} signature.`;
}

function buildTags(name, baseTags) {
  const words = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  return Array.from(new Set([...baseTags, ...words])).filter(Boolean).slice(0, 5);
}

function buildMaterials() {
  const allIds = Object.values(catalog).flat().map(slugify);
  return Object.entries(catalog).flatMap(([category, names]) => names.map((name, index) => {
    const id = slugify(name);
    const base = { ...categoryProfiles[category] };
    const override = materialOverrides[id] || {};
    const layer = override.layer || base.layer;
    const tags = buildTags(name, override.tags || base.tags);
    const pairsWith = [
      allIds[(index + 7) % allIds.length],
      allIds[(index + 31) % allIds.length],
      allIds[(index + 83) % allIds.length]
    ].filter((pairId) => pairId !== id).slice(0, 4);

    return {
      id,
      name,
      category: override.category || category,
      family: override.family || base.family,
      layer,
      description: override.description || descriptionFor(name, override.category || category),
      intensity: clampScore(override.intensity ?? base.intensity),
      longevity: clampScore(override.longevity ?? base.longevity),
      freshness: clampScore(override.freshness ?? base.freshness),
      sweetness: clampScore(override.sweetness ?? base.sweetness),
      warmth: clampScore(override.warmth ?? base.warmth),
      green: clampScore(override.green ?? base.green),
      floral: clampScore(override.floral ?? base.floral),
      woody: clampScore(override.woody ?? base.woody),
      powdery: clampScore(override.powdery ?? base.powdery),
      clean: clampScore(override.clean ?? base.clean),
      darkness: clampScore(override.darkness ?? base.darkness),
      strangeness: clampScore(override.strangeness ?? base.strangeness),
      pairsWith,
      avoidWith: override.avoidWith || [],
      tags
    };
  }));
}

const materials = buildMaterials();

window.fragranceData = {
  concentrations,
  families,
  materials,
  indischeMaterials: {
    enabled: false,
    message: 'Coming Soon - Rare materials from Indische World are currently being catalogued by the artisans.',
    preview: indischePreview
  }
};
})();
