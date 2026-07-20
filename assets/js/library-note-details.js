(function () {
  const materials = window.LIBRARY_MATERIALS || [];

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function detail(mood, role, bestUsedFor, pairsWellWith, avoidIf, description) {
    return {
      mood,
      suggestedRole: Array.isArray(role) ? role : [role],
      bestUsedFor,
      pairsWellWith,
      avoidIf,
      description
    };
  }

  const details = Object.create(null);

  function add(name, mood, role, bestUsedFor, pairsWellWith, avoidIf, description) {
    details[slug(name)] = detail(mood, role, bestUsedFor, pairsWellWith, avoidIf, description);
  }

  add("Bergamot", ["Bright", "Elegant", "Tea-like"], "Top", ["Polished citrus openings", "Tea accords", "Green florals"], ["Green Tea", "Petitgrain", "Neroli", "Violet Leaf", "White Musk"], ["You need juicy sweetness more than refined bitter peel"], "Bergamot gives a refined bitter-citrus sparkle with a light floral peel nuance, useful when a formula needs elegance rather than simple fruitiness.");
  add("Lemon", ["Sharp", "Clean", "Sunlit"], "Top", ["Bright openings", "Clean daytime scents", "Fresh colognes"], ["Mint", "Rosemary", "White Musk", "Cedarwood", "Green Tea"], ["You want a soft or rounded opening"], "Lemon is direct, crisp, and luminous, cutting through heavier notes and making the first impression feel freshly polished.");
  add("Lime", ["Zesty", "Green", "Crisp"], "Top", ["Green citrus openings", "Sparkling cocktails", "Transparent woods"], ["Mint", "Kaffir Lime", "Vetiver", "Cedarwood", "Sea Salt"], ["You dislike tart peel or fast-moving brightness"], "Lime feels sharper and greener than lemon, adding a sparkling rind effect that wakes up herbal, tea, and mineral structures.");
  add("Sweet Orange", ["Juicy", "Warm", "Cheerful"], "Top", ["Friendly citrus openings", "Gourmand lift", "Sunny florals"], ["Vanilla", "Mandarin", "Neroli", "Tonka Bean", "Sandalwood"], ["You need dry bitterness or austere freshness"], "Sweet Orange is round, sunny, and approachable, giving a soft orange glow without the bite of grapefruit or lime.");
  add("Mandarin", ["Soft", "Radiant", "Gentle"], "Top", ["Soft openings", "Skin-like citrus", "Floral introductions"], ["Orange Blossom", "Rose", "White Musk", "Green Tea", "Vanilla"], ["You want a very sharp citrus attack"], "Mandarin has a tender peel sweetness that makes a composition feel warm, clean, and immediately wearable.");
  add("Blood Orange", ["Ruby", "Juicy", "Bitter-sweet"], "Top", ["Modern citrus accents", "Fruit-floral openings", "Warm spicy lift"], ["Pink Pepper", "Rose", "Black Tea", "Amber", "Patchouli"], ["You want a pale or watery citrus"], "Blood Orange adds deeper citrus color, balancing juicy sweetness with a darker rind tone and a subtle red-fruit impression.");
  add("Grapefruit", ["Bitter", "Sparkling", "Modern"], "Top", ["Bright modern openings", "Clean musks", "Green woody scents"], ["Vetiver", "Cedarwood", "White Musk", "Basil", "Neroli"], ["You dislike bitter peel or brisk freshness"], "Grapefruit is airy, bitter, and energetic, giving lift without sweetness and keeping fresh formulas feeling contemporary.");
  add("Yuzu", ["Luminous", "Watery", "Japanese"], "Top", ["Mineral freshness", "Tea accords", "Rainy citrus effects"], ["Green Tea", "Sea Salt", "Hinoki", "White Musk", "Violet Leaf"], ["You want a warm or creamy citrus"], "Yuzu feels between lemon, mandarin, and mineral water, with a sparkling translucence suited to quiet, misty compositions.");
  add("Citron", ["Textured", "Peel-like", "Clear"], "Top", ["Architectural citrus", "Clean openings", "Tea and green accents"], ["Petitgrain", "Neroli", "Green Tea", "White Musk", "Cedarwood"], ["You dislike sharp, zesty, or fast-opening freshness"], "Citron brings thick-rind brightness and clarity, giving citrus structure without becoming overly sweet.");
  add("Tangerine", ["Sweet", "Playful", "Soft"], "Top", ["Friendly openings", "Fruity florals", "Youthful gourmand lift"], ["Peach", "Vanilla", "Orange Blossom", "White Musk", "Tonka Bean"], ["You need a dry or austere first impression"], "Tangerine is sweeter and softer than mandarin, with a playful orange tone that helps formulas feel inviting.");
  add("Kaffir Lime", ["Leafy", "Aromatic", "Sharp"], "Top", ["Aromatic citrus twists", "Tea and herb accords", "Green freshness"], ["Basil", "Mint", "Green Tea", "Vetiver", "Galbanum"], ["You want smooth sweetness or delicate florals"], "Kaffir Lime is more leaf than juice, giving a vivid green citrus snap with culinary aromatic tension.");
  add("Neroli", ["Floral", "Clean", "Luminous"], "Heart", ["Cologne structures", "Fresh florals", "Clean elegance"], ["Bergamot", "Orange Blossom", "Petitgrain", "White Musk", "Jasmine Sambac"], ["You want purely fruity citrus without blossom"], "Neroli bridges citrus and white flower, adding clean radiance, slight honey, and a polished Mediterranean brightness.");
  add("Petitgrain", ["Bitter", "Leafy", "Twiggy"], "Top", ["Bitter green openings", "Cologne structure", "Natural citrus leaf effects"], ["Neroli", "Bergamot", "Lavender", "Cedarwood", "Vetiver"], ["You want juicy orange sweetness"], "Petitgrain smells of citrus leaves and twigs, bringing dry green bite and structure to otherwise soft citrus blends.");

  add("Pear", ["Watery", "Sheer", "Delicate"], "Top", ["Transparent fruit lift", "Soft florals", "Tea compositions"], ["Rose", "Violet Leaf", "White Musk", "Green Tea", "Bergamot"], ["You need dense jammy fruit"], "Pear adds a dewy, translucent fruitiness that feels more airy than sugary, useful for fresh floral and tea stories.");
  add("Apple", ["Crisp", "Green", "Fresh"], "Top", ["Clean fruity openings", "Green accords", "Youthful brightness"], ["Mint", "Cedarwood", "White Musk", "Lemon", "Grass"], ["You dislike shampoo-like freshness"], "Apple gives a crisp snap and clean fruit skin effect, making a formula feel freshly cut and easy to understand.");
  add("Green Apple", ["Tart", "Bright", "Crunchy"], "Top", ["Tart openings", "Fresh musks", "Green fruity accords"], ["Lime", "Galbanum", "White Musk", "Vetiver", "Mint"], ["You want ripe or creamy fruit"], "Green Apple is sharper and more tart than apple, giving a crunchy green bite that keeps sweetness controlled.");
  add("Peach", ["Velvety", "Soft", "Skin-like"], "Heart", ["Soft fruit florals", "Vintage feminine accents", "Creamy hearts"], ["Rose", "Jasmine Sambac", "Sandalwood", "Vanilla", "White Musk"], ["You need crispness or dry transparency"], "Peach adds plush skin-like fruit, useful when the heart needs softness, warmth, and a gentle vintage glow.");
  add("Apricot", ["Golden", "Jammy", "Tender"], "Heart", ["Warm fruity hearts", "Tea florals", "Soft gourmand accents"], ["Black Tea", "Rose", "Honey", "Tonka Bean", "Sandalwood"], ["You want a green or watery fruit tone"], "Apricot is warmer and more honeyed than peach, giving a sun-dried fruit softness without becoming too heavy.");
  add("Plum", ["Deep", "Velvet", "Nocturnal"], "Heart", ["Dark fruit florals", "Amber compositions", "Evening concepts"], ["Patchouli", "Rose", "Amber", "Tobacco", "Labdanum"], ["You want clean daytime freshness"], "Plum gives a dense purple fruit shadow, adding depth and a slightly wine-like richness to the heart.");
  add("Fig", ["Milky", "Green", "Mediterranean"], "Heart", ["Green creamy accords", "Solar woods", "Botanical stories"], ["Fig Leaf", "Coconut", "Sandalwood", "Green Tea", "Cedarwood"], ["You dislike milky green notes"], "Fig combines green leaf, soft fruit, and milky skin, creating a calm botanical warmth.");
  add("Lychee", ["Rosy", "Sparkling", "Dewy"], "Top", ["Modern florals", "Rose lift", "Playful fruity openings"], ["Rose", "Peony", "Mandarin", "White Musk", "Pear"], ["You need dry restraint"], "Lychee adds translucent tropical sweetness with a rosy sparkle, brightening florals without turning syrupy.");
  add("Raspberry", ["Bright", "Red", "Sweet-tart"], "Heart", ["Rose accents", "Playful fruity florals", "Juicy contrast"], ["Rose", "Violet Leaf", "Vanilla", "White Musk", "Patchouli"], ["You want austere or naturalistic freshness"], "Raspberry gives a cheerful red-fruit pop with tart edges, useful for making florals feel vivid.");
  add("Strawberry", ["Soft", "Red", "Playful"], "Heart", ["Sweet florals", "Youthful gourmand touches", "Creamy fruit"], ["Cream", "Vanilla", "Rose", "White Musk", "Biscuit"], ["You dislike candy-like fruit"], "Strawberry adds soft red sweetness and a familiar garden-fruit comfort when used lightly.");
  add("Cherry", ["Dark", "Sweet", "Almond-like"], "Heart", ["Nocturnal fruit", "Almond gourmand accents", "Amber florals"], ["Almond", "Tonka Bean", "Rose", "Tobacco", "Dark Chocolate"], ["You want a fresh natural opening"], "Cherry brings a dark red sweetness with almond-like depth, giving formulas a dramatic, lacquered quality.");
  add("Pineapple", ["Tropical", "Sparkling", "Juicy"], "Top", ["Bright tropical openings", "Fruity colognes", "Sunny concepts"], ["Coconut", "Lime", "Rum Accord", "Cedarwood", "White Musk"], ["You want quiet or powdery elegance"], "Pineapple feels sparkling and tropical, adding a golden acidic sweetness that can energize dense blends.");
  add("Mango", ["Creamy", "Tropical", "Ripe"], "Heart", ["Tropical hearts", "Solar florals", "Creamy gourmand fruit"], ["Coconut", "Ylang Ylang", "Vanilla", "Sandalwood", "Lime"], ["You dislike ripe tropical sweetness"], "Mango is lush and creamy, giving a ripe golden fruit body that needs fresh or woody contrast.");
  add("Coconut", ["Lactonic", "Creamy", "Sun-warmed"], "Base", ["Solar accords", "Creamy bases", "Tropical softness"], ["Sandalwood", "Vanilla", "Ylang Ylang", "Fig", "Sea Salt"], ["You want a dry green finish"], "Coconut adds milky warmth and a sunlit softness, useful for tropical, skin, and creamy wood compositions.");
  add("Blackcurrant", ["Green", "Tart", "Catty"], "Top", ["Modern rose accords", "Sharp fruit contrast", "Green fruity openings"], ["Rose", "Galbanum", "Patchouli", "Violet Leaf", "Bergamot"], ["You dislike sharp green fruit"], "Blackcurrant gives tart berry brightness with a leafy green edge that can make florals feel more alive.");

  add("Rose", ["Romantic", "Velvety", "Timeless"], "Heart", ["Floral hearts", "Tea roses", "Amber florals"], ["Bergamot", "Violet Leaf", "Patchouli", "White Musk", "Sandalwood"], ["You want a non-floral composition"], "Rose provides a full floral heart, from petal softness to subtle spice, and can read classic or modern depending on its partners.");
  add("Jasmine Sambac", ["Luminous", "White Floral", "Sensual"], "Heart", ["White floral hearts", "Creamy florals", "Solar compositions"], ["Neroli", "Orange Blossom", "Sandalwood", "Ylang Ylang", "White Musk"], ["You want a very restrained or dry heart"], "Jasmine Sambac adds radiant white-petal intensity with a slightly tea-like floral warmth.");
  add("Ylang Ylang", ["Creamy", "Tropical", "Golden"], "Heart", ["Solar florals", "Creamy hearts", "Exotic floral accents"], ["Coconut", "Sandalwood", "Vanilla", "Jasmine Sambac", "Bergamot"], ["You dislike rich or tropical floral tones"], "Ylang Ylang feels golden and creamy, bringing tropical floral depth and a soft banana-like warmth.");
  add("Tuberose", ["Opulent", "Creamy", "Nocturnal"], "Heart", ["Statement white florals", "Evening compositions", "Creamy floral drama"], ["Jasmine Sambac", "Coconut", "Vanilla", "Sandalwood", "Orange Blossom"], ["You want a quiet or transparent perfume"], "Tuberose is powerful and creamy, giving a dramatic white floral body that can dominate if not balanced.");
  add("Orange Blossom", ["Clean", "Honeyed", "Radiant"], "Heart", ["Fresh white florals", "Cologne florals", "Gentle sweetness"], ["Neroli", "Mandarin", "Honey", "White Musk", "Petitgrain"], ["You want dry green bitterness only"], "Orange Blossom adds soft white petals, clean honey, and a friendly brightness between citrus and floral.");
  add("Violet Leaf", ["Green", "Crisp", "Delicate"], "Heart", ["Green florals", "Watery freshness", "Modern transparent hearts"], ["Pear", "Rose", "Bergamot", "White Musk", "Cedarwood"], ["You dislike cucumber-like green freshness"], "Violet Leaf is cool, green, and watery, adding a crisp floral leaf effect rather than sweet violet candy.");
  add("Iris", ["Powdery", "Elegant", "Cool"], "Heart", ["Powdery florals", "Luxury skin scents", "Soft woody hearts"], ["Orris", "Cedarwood", "White Musk", "Violet Leaf", "Sandalwood"], ["You need juicy freshness"], "Iris gives cool powder and restrained elegance, making a composition feel polished and softly architectural.");
  add("Orris", ["Buttery", "Powdery", "Rooty"], "Heart", ["Luxury powder accords", "Lipstick effects", "Soft leather"], ["Iris", "Suede", "Violet Powder", "Cedarwood", "Ambrette"], ["You dislike cosmetic powder"], "Orris is denser and more buttery than iris, with rooty luxury and a refined cosmetic character.");
  add("Lavender", ["Aromatic", "Clean", "Herbal"], "Heart", ["Fougere structure", "Clean aromatics", "Calm herbal openings"], ["Bergamot", "Petitgrain", "Rosemary", "Vanilla", "Tonka Bean"], ["You want a purely floral heart"], "Lavender adds aromatic cleanliness and a calming herbal top-heart bridge.");
  add("Geranium", ["Rosy", "Green", "Minted"], "Heart", ["Rose structure", "Aromatic florals", "Green masculine accords"], ["Rose", "Mint", "Patchouli", "Bergamot", "Cedarwood"], ["You want soft petal sweetness"], "Geranium gives a crisp rosy-green profile with a fresh minted edge.");
  add("Magnolia", ["Creamy", "Luminous", "Petal-soft"], "Heart", ["Soft white florals", "Transparent floral hearts", "Creamy musks"], ["Pear", "White Musk", "Jasmine Sambac", "Bergamot", "Sandalwood"], ["You need heavy floral drama"], "Magnolia is airy and creamy, giving a polished petal glow without the weight of tuberose.");
  add("Peony", ["Fresh", "Rosy", "Watery"], "Heart", ["Dewy florals", "Fresh feminine hearts", "Light rose effects"], ["Lychee", "Rose", "Pear", "White Musk", "Mandarin"], ["You want dense dark florals"], "Peony gives a watery rose-like brightness that keeps floral blends youthful and light.");
  add("Champaca", ["Golden", "Floral", "Tea-like"], "Heart", ["Exotic floral hearts", "Tea florals", "Amber florals"], ["Black Tea", "Jasmine Sambac", "Sandalwood", "Honey", "Amber"], ["You want minimal clean florals"], "Champaca brings golden floral warmth, a tea-like shadow, and a softly exotic heart.");

  add("Green Tea", ["Calm", "Clean", "Refined"], "Top", ["Tea accords", "Fresh green florals", "Quiet daytime scents"], ["Bergamot", "Pear", "Violet Leaf", "White Musk", "Cedarwood"], ["You want dense sweetness"], "Green Tea is transparent and calming, adding leafy steam and refined freshness without sharp citrus overload.");
  add("Galbanum", ["Sharp", "Resin-green", "Vintage"], "Heart", ["Bitter green structure", "Chypre accents", "Naturalistic leaves"], ["Rose", "Violet Leaf", "Oakmoss", "Bergamot", "Patchouli"], ["You dislike bold bitter green notes"], "Galbanum is intensely green and resinous, adding vintage bite and botanical realism.");
  add("Tomato Leaf", ["Leafy", "Garden", "Savory"], "Top", ["Garden concepts", "Green realism", "Botanical contrast"], ["Basil", "Blackcurrant", "Vetiver", "Green Tea", "Cedarwood"], ["You want sweet fruit or powder"], "Tomato Leaf smells like crushed stems and warm greenhouse air, giving a vivid living-plant effect.");
  add("Basil", ["Aromatic", "Peppery", "Green"], "Top", ["Herbal citrus", "Garden accords", "Savory green freshness"], ["Lime", "Kaffir Lime", "Tomato Leaf", "Black Pepper", "Vetiver"], ["You want soft floral sweetness"], "Basil gives peppery herbal brightness and a culinary green edge that can make citrus feel more complex.");
  add("Mint", ["Cool", "Fresh", "Sparkling"], "Top", ["Cooling openings", "Tea freshness", "Clean green lift"], ["Lemon", "Green Tea", "Pear", "White Musk", "Grass"], ["You dislike toothpaste-like coolness"], "Mint adds immediate cool air and clean sparkle, best used carefully so it stays elegant.");
  add("Grass", ["Fresh-cut", "Green", "Outdoor"], "Top", ["Morning garden effects", "Natural green openings", "Fresh botanical concepts"], ["Pear", "Green Tea", "Violet Leaf", "Moss", "Cedarwood"], ["You want a polished indoor scent"], "Grass gives a fresh-cut lawn brightness that makes a composition feel open, youthful, and outdoors.");
  add("Eucalyptus", ["Camphor", "Cool", "Airy"], "Top", ["Cooling aromatic effects", "Spa freshness", "Medicinal green contrast"], ["Mint", "Rosemary", "Sea Salt", "White Musk", "Cedarwood"], ["You dislike camphor or medicinal tones"], "Eucalyptus brings cool vapor and aromatic clarity, useful for airy and cleansing concepts.");
  add("Fig Leaf", ["Milky Green", "Dry", "Mediterranean"], "Heart", ["Fig accords", "Green creamy woods", "Solar botanical stories"], ["Fig", "Coconut", "Sandalwood", "Cedarwood", "Green Tea"], ["You want juicy ripe fruit only"], "Fig Leaf gives dry green milkiness and a sun-warmed leaf texture.");

  add("Black Tea", ["Smoky", "Tannic", "Refined"], "Heart", ["Tea florals", "Elegant smoky hearts", "Dry gourmand contrast"], ["Bergamot", "Rose", "Apricot", "Cedarwood", "Honey"], ["You want a very light watery tea"], "Black Tea adds tannic depth, gentle smoke, and a brewed elegance that grounds sweet or floral notes.");
  add("White Tea", ["Soft", "Clean", "Transparent"], "Top", ["Clean musks", "Soft daytime scents", "Minimal tea accords"], ["White Musk", "Pear", "Bergamot", "Violet Leaf", "Cedarwood"], ["You need strong smoky tea character"], "White Tea is sheer and delicate, giving a clean steam impression rather than dark tannins.");
  add("Earl Grey", ["Bergamot", "Dry", "Classic"], "Heart", ["Tea-citrus accords", "Polished fresh scents", "Gentle aromatic hearts"], ["Bergamot", "Black Tea", "Lavender", "White Musk", "Cedarwood"], ["You dislike dry tea or citrus peel"], "Earl Grey combines tea dryness and bergamot brightness for a cultured, familiar opening-to-heart bridge.");
  add("Matcha", ["Powdery Green", "Creamy", "Quiet"], "Heart", ["Modern tea gourmands", "Soft green hearts", "Creamy freshness"], ["Milk", "Rice Powder", "Green Tea", "Vanilla", "White Musk"], ["You need bright sparkling citrus"], "Matcha gives powdered green tea depth with a soft creamy bitterness.");
  add("Oolong Tea", ["Mineral", "Toasted", "Elegant"], "Heart", ["Refined tea accords", "Woody florals", "Quiet drydowns"], ["Fig", "Cedarwood", "Apricot", "White Musk", "Amber"], ["You want sweet milk tea"], "Oolong Tea sits between green and black tea, with mineral warmth and a lightly toasted nuance.");
  add("Milk Tea", ["Creamy", "Comforting", "Tea-sweet"], "Heart", ["Soft gourmand tea", "Comfort concepts", "Creamy florals"], ["Black Tea", "Milk", "Brown Sugar", "Vanilla", "Rice Powder"], ["You want dry, unsweetened tea"], "Milk Tea wraps tea in creamy sweetness, creating a cozy drink-like heart.");
  add("Tea Steam Accord", ["Humid", "Transparent", "Soft"], "Top", ["Atmospheric tea effects", "Fresh steam openings", "Glasshouse concepts"], ["Green Tea", "White Tea", "Rain Accord", "Pear", "White Musk"], ["You need strong projection"], "Tea Steam Accord adds a vapor-like lift, suggesting hot tea rising into cool air.");
  add("Chamomile", ["Herbal", "Honeyed", "Calm"], "Heart", ["Comforting tea florals", "Sleepy herbal accents", "Soft honeyed hearts"], ["Honey", "White Tea", "Lavender", "Vanilla", "Sandalwood"], ["You dislike herbal sweetness"], "Chamomile gives a gentle honeyed herb softness with a quiet bedtime character.");
  add("Sage", ["Dry", "Herbal", "Mineral"], "Heart", ["Aromatic woods", "Dry herbal accents", "Green mineral concepts"], ["Cedarwood", "Sea Salt", "Lemon", "Vetiver", "Lavender"], ["You want sweet florals"], "Sage adds dry herbal texture and a slightly mineral clarity.");
  add("Rosemary", ["Camphor", "Herbal", "Crisp"], "Top", ["Fresh aromatics", "Citrus colognes", "Green herbal lift"], ["Lemon", "Bergamot", "Lavender", "Cedarwood", "Eucalyptus"], ["You dislike culinary or camphor notes"], "Rosemary brings crisp herbal brightness with a clean resinous edge.");
  add("Thyme", ["Dry", "Savory", "Herbal"], "Top", ["Savory aromatic twists", "Citrus herbs", "Dry green structures"], ["Lemon", "Basil", "Black Pepper", "Vetiver", "Cedarwood"], ["You want soft sweetness"], "Thyme gives a dry Mediterranean herbal touch that sharpens citrus and woods.");
  add("Bay Leaf", ["Spiced", "Green", "Aromatic"], "Heart", ["Spiced aromatics", "Herbal woods", "Culinary green contrast"], ["Black Pepper", "Cedarwood", "Bergamot", "Vetiver", "Amber"], ["You dislike savory facets"], "Bay Leaf adds aromatic spice and green dryness, useful for tailored herbal structures.");

  add("Pink Pepper", ["Sparkling", "Rosy", "Peppered"], "Top", ["Modern openings", "Rose lift", "Fruit contrast"], ["Rose", "Blood Orange", "Cedarwood", "Patchouli", "White Musk"], ["You want no spice or tickle"], "Pink Pepper adds a fizzy pepper sparkle with a rosy lift, making openings feel lively.");
  add("Black Pepper", ["Dry", "Sharp", "Textural"], "Top", ["Woody spice", "Aromatic lift", "Masculine structure"], ["Cedarwood", "Vetiver", "Basil", "Leather", "Frankincense"], ["You dislike dry spice"], "Black Pepper brings dry heat and grainy texture without sweetness.");
  add("Cardamom", ["Cool", "Spiced", "Elegant"], "Top", ["Tea spices", "Woody warmth", "Creamy gourmands"], ["Black Tea", "Sandalwood", "Vanilla", "Bergamot", "Cedarwood"], ["You want hot cinnamon sweetness"], "Cardamom is cool and aromatic, adding refined spice with a green, tea-like lift.");
  add("Cinnamon", ["Warm", "Sweet", "Radiant"], "Heart", ["Gourmand warmth", "Amber spice", "Holiday accents"], ["Vanilla", "Tonka Bean", "Apple", "Amber", "Clove"], ["You dislike warm sweet spice"], "Cinnamon brings glowing warmth and familiar sweetness, best kept balanced to avoid heaviness.");
  add("Clove", ["Dark", "Medicinal", "Spiced"], "Heart", ["Vintage florals", "Dark spice", "Amber structure"], ["Rose", "Tobacco", "Labdanum", "Patchouli", "Orange"], ["You dislike medicinal spice"], "Clove gives a dark, numbing spice that can make florals feel antique and dramatic.");
  add("Saffron", ["Leathery", "Golden", "Dry"], "Heart", ["Amber leather", "Luxury warmth", "Nocturnal spice"], ["Leather", "Amber", "Rose", "Oud Accord", "Cedarwood"], ["You want light citrus freshness"], "Saffron adds dry golden warmth with a leathery shadow and a luxury signature feel.");
  add("Ginger", ["Fresh", "Hot", "Zesty"], "Top", ["Sparkling spice", "Citrus lift", "Tea freshness"], ["Lemon", "Yuzu", "Green Tea", "Cardamom", "White Musk"], ["You want soft powdery warmth"], "Ginger adds bright heat and rooty sparkle, energizing citrus and tea structures.");
  add("Nutmeg", ["Warm", "Dry", "Nutty"], "Heart", ["Soft spice warmth", "Woody gourmands", "Creamy bases"], ["Sandalwood", "Vanilla", "Tonka Bean", "Cedarwood", "Milk"], ["You dislike dry nutty spice"], "Nutmeg is warm and slightly dusty, adding rounded spice without the sweetness of cinnamon.");
  add("Coriander Seed", ["Citrus-spiced", "Dry", "Bright"], "Top", ["Citrus spice openings", "Aromatic colognes", "Dry freshness"], ["Bergamot", "Lemon", "Lavender", "Cedarwood", "Vetiver"], ["You want heavy sweet spice"], "Coriander Seed gives a dry citrus-spice lift that feels clean and botanical.");
  add("Star Anise", ["Licorice", "Sweet-spiced", "Dark"], "Heart", ["Unusual gourmands", "Dark spice accents", "Vintage effects"], ["Cherry", "Vanilla", "Black Tea", "Patchouli", "Amber"], ["You dislike licorice"], "Star Anise brings a sweet licorice shadow that can make a formula feel mysterious and theatrical.");
  add("Fennel", ["Aniseed", "Green", "Aromatic"], "Top", ["Green spice", "Herbal freshness", "Unusual citrus"], ["Lemon", "Basil", "Mint", "Cedarwood", "White Musk"], ["You dislike anise-like notes"], "Fennel adds a lighter green anise effect with a crisp herbal sweetness.");

  add("Vanilla", ["Warm", "Creamy", "Comforting"], "Base", ["Soft bases", "Gourmand warmth", "Floral smoothing"], ["Tonka Bean", "Sandalwood", "Amber", "Rose", "White Musk"], ["You want a dry unsweetened formula"], "Vanilla adds warmth, softness, and familiar comfort, rounding sharp edges and extending the drydown.");
  add("Madagascar Vanilla", ["Rich", "Creamy", "Bourbon"], "Base", ["Premium vanilla bases", "Amber gourmands", "Creamy florals"], ["Tonka Bean", "Benzoin", "Sandalwood", "Coffee", "Coconut"], ["You need transparent freshness"], "Madagascar Vanilla feels darker and richer than plain vanilla, with a rounded bourbon-like depth.");
  add("Tonka Bean", ["Nutty", "Hay-like", "Coumarin"], "Base", ["Warm drydowns", "Fougere sweetness", "Almond-like bases"], ["Vanilla", "Lavender", "Almond", "Tobacco", "Sandalwood"], ["You dislike hay, almond, or coumarin warmth"], "Tonka Bean brings soft almond-hay sweetness and creamy warmth, excellent for lasting cozy bases.");
  add("Chocolate", ["Creamy", "Cocoa", "Comforting"], "Base", ["Soft gourmand bases", "Dessert accents", "Dark floral contrast"], ["Vanilla", "Coffee", "Praline", "Patchouli", "Rose"], ["You want no edible character"], "Chocolate adds mellow cocoa comfort, best used as a shadow rather than a literal dessert.");
  add("Dark Chocolate", ["Bitter", "Cocoa", "Nocturnal"], "Base", ["Dark gourmands", "Patchouli bases", "Evening concepts"], ["Coffee", "Patchouli", "Cherry", "Tobacco", "Amber"], ["You dislike bitterness"], "Dark Chocolate brings dry cocoa bitterness and a polished evening richness.");
  add("White Chocolate", ["Milky", "Sweet", "Soft"], "Base", ["Creamy gourmands", "Soft floral bases", "Comfort scents"], ["Vanilla", "Strawberry", "Milk", "White Musk", "Almond"], ["You want dry dark cocoa"], "White Chocolate gives pale creamy sweetness and a soft confectionery finish.");
  add("Coffee", ["Roasted", "Dark", "Bitter"], "Base", ["Roasted gourmands", "Dark woods", "Morning concepts"], ["Vanilla", "Cedarwood", "Chocolate", "Cardamom", "Amber"], ["You dislike roasted bitterness"], "Coffee adds roasted depth and bitter warmth, grounding sweet notes with a dry cafe-like character.");
  add("Espresso", ["Intense", "Roasted", "Bitter"], "Base", ["Bold gourmand accents", "Dark amber", "Short dramatic openings"], ["Dark Chocolate", "Vanilla", "Cardamom", "Tobacco", "Cedarwood"], ["You want soft latte creaminess"], "Espresso is sharper and darker than coffee, giving concentrated roasted energy.");
  add("Latte Accord", ["Creamy", "Coffee", "Soft"], "Heart", ["Cafe gourmands", "Creamy warmth", "Comfort concepts"], ["Coffee", "Milk", "Vanilla", "Caramel", "Cardamom"], ["You need dry bitter coffee"], "Latte Accord softens coffee into steamed milk and gentle sweetness.");
  add("Milk", ["Soft", "Creamy", "Lactonic"], "Heart", ["Creamy tea", "Skin-like softness", "Comfort accords"], ["Rice Powder", "Vanilla", "Milk Tea", "Sandalwood", "White Musk"], ["You dislike lactonic notes"], "Milk adds a gentle lactonic veil, making sharp materials feel softer and more intimate.");
  add("Cream", ["Rich", "Lactonic", "Smooth"], "Base", ["Dessert gourmands", "Soft floral smoothing", "Velvety drydowns"], ["Vanilla", "Strawberry", "Tonka Bean", "Sandalwood", "Milk"], ["You want airy freshness"], "Cream gives a richer dairy softness than milk, adding rounded dessert-like texture.");
  add("Whipped Cream", ["Airy", "Sweet", "Soft"], "Heart", ["Light gourmands", "Soft fruity florals", "Dessert accents"], ["Strawberry", "Vanilla", "Biscuit", "White Musk", "Peach"], ["You want dry woods only"], "Whipped Cream adds a light sweet cloud rather than dense creaminess.");
  add("Caramel", ["Golden", "Sticky", "Sweet"], "Base", ["Sweet bases", "Amber gourmands", "Dessert warmth"], ["Vanilla", "Praline", "Tonka Bean", "Coffee", "Sea Salt"], ["You dislike sticky sweetness"], "Caramel adds golden cooked sugar and warmth, useful for rich edible bases.");
  add("Toffee", ["Buttery", "Brown Sugar", "Dense"], "Base", ["Deep gourmands", "Warm amber bases", "Cozy drydowns"], ["Vanilla", "Brown Sugar", "Coffee", "Hazelnut", "Amber"], ["You want fresh transparency"], "Toffee is denser and more buttery than caramel, with a darker cooked-sugar body.");
  add("Praline", ["Nutty", "Caramelized", "Indulgent"], "Base", ["Nutty gourmand bases", "Comfort drydowns", "Dessert-like hearts"], ["Tonka Bean", "Hazelnut", "Coffee", "Rose", "Vanilla"], ["You dislike edible sweetness"], "Praline adds toasted nut and caramel warmth, giving a polished patisserie effect when used with restraint.");
  add("Honey", ["Golden", "Floral", "Animalic"], "Heart", ["Honeyed florals", "Amber warmth", "Tea sweetness"], ["Orange Blossom", "Chamomile", "Black Tea", "Rose", "Benzoin"], ["You dislike rich honey or animalic sweetness"], "Honey brings golden nectar, soft floral warmth, and a slightly animalic depth.");
  add("Maple Syrup", ["Amber", "Smoky", "Sweet"], "Base", ["Autumn gourmands", "Woody sweetness", "Comfort drydowns"], ["Coffee", "Cedarwood", "Tonka Bean", "Brown Sugar", "Vanilla"], ["You want light fresh sweetness"], "Maple Syrup adds dark amber sweetness with a woody, toasted edge.");
  add("Brown Sugar", ["Molasses", "Warm", "Soft"], "Base", ["Tea gourmands", "Cozy sweetness", "Warm fruit"], ["Milk Tea", "Vanilla", "Cinnamon", "Coffee", "Tonka Bean"], ["You dislike sugar warmth"], "Brown Sugar gives molasses-like warmth and a soft baked sweetness.");
  add("Biscuit", ["Toasted", "Buttery", "Cozy"], "Base", ["Bakery accords", "Soft gourmand bases", "Comfort concepts"], ["Vanilla", "Butter Accord", "Milk", "Almond", "Coffee"], ["You want no bakery impression"], "Biscuit adds toasted flour and buttery warmth, suggesting a dry bakery sweetness.");
  add("Almond", ["Marzipan", "Nutty", "Soft"], "Base", ["Powdery gourmands", "Cherry accents", "Soft bases"], ["Cherry", "Tonka Bean", "Vanilla", "Rice Powder", "Orris"], ["You dislike marzipan"], "Almond gives a smooth marzipan-like nuttiness with powdery softness.");
  add("Hazelnut", ["Roasted", "Nutty", "Warm"], "Base", ["Coffee gourmands", "Praline effects", "Cozy woods"], ["Coffee", "Praline", "Chocolate", "Vanilla", "Cedarwood"], ["You want fresh green notes"], "Hazelnut brings roasted nut warmth and a rounded cafe-dessert character.");
  add("Peanut", ["Roasted", "Savory", "Nutty"], "Base", ["Experimental gourmands", "Salty nut accents", "Textural bases"], ["Caramel", "Sea Salt", "Chocolate", "Cedarwood", "Tonka Bean"], ["You want polished classic sweetness only"], "Peanut gives a savory roasted nuttiness that can make gourmand accords more unusual.");
  add("Pistachio", ["Creamy", "Green Nut", "Soft"], "Heart", ["Modern gourmands", "Creamy green accents", "Soft dessert florals"], ["Almond", "Vanilla", "Milk", "Jasmine Sambac", "White Musk"], ["You dislike nutty lactonic sweetness"], "Pistachio adds pale green nuttiness and creamy dessert softness.");
  add("Marshmallow", ["Powdery", "Sweet", "Airy"], "Base", ["Soft gourmand musks", "Playful sweetness", "Comfort drydowns"], ["Vanilla", "Rice Powder", "White Musk", "Strawberry", "Milk"], ["You dislike fluffy sweetness"], "Marshmallow adds airy sugar and powdery vanilla comfort.");
  add("Ice Cream Accord", ["Cold Cream", "Sweet", "Playful"], "Heart", ["Cold gourmand concepts", "Creamy fruit", "Novelty dessert accents"], ["Vanilla", "Milk", "Strawberry", "Pistachio", "Sea Salt"], ["You want natural dry woods"], "Ice Cream Accord suggests chilled cream and sugar, useful for playful dessert concepts.");
  add("Bread Accord", ["Yeasty", "Warm", "Toasted"], "Base", ["Bakery atmospheres", "Comfort accords", "Unusual gourmand bases"], ["Butter Accord", "Honey", "Coffee", "Cedarwood", "Vanilla"], ["You dislike savory bakery notes"], "Bread Accord brings warm crumb and toasted crust, creating a lived-in bakery atmosphere.");
  add("Butter Accord", ["Creamy", "Salty", "Rich"], "Base", ["Bakery gourmands", "Buttery florals", "Rich dessert bases"], ["Biscuit", "Bread Accord", "Vanilla", "Caramel", "Sea Salt"], ["You want crisp freshness"], "Butter Accord adds rich dairy gloss and baked warmth.");
  add("Cotton Candy", ["Airy", "Pink", "Sugary"], "Top", ["Playful sweet accents", "Youthful fruity florals", "Candy effects"], ["Strawberry", "Raspberry", "White Musk", "Vanilla", "Pear"], ["You dislike obvious sugar"], "Cotton Candy gives a floating spun-sugar sweetness with a playful pink tone.");

  add("Cedarwood", ["Dry", "Pencil-shaving", "Grounded"], "Base", ["Clean wood structure", "Citrus drydowns", "Masculine polish"], ["Bergamot", "Vetiver", "White Musk", "Rose", "Black Tea"], ["You want creamy sandalwood softness"], "Cedarwood gives dry vertical structure and keeps fresh notes from feeling weightless.");
  add("Sandalwood", ["Creamy", "Milky", "Smooth"], "Base", ["Creamy drydowns", "Soft florals", "Skin-like woods"], ["Vanilla", "Jasmine Sambac", "Coconut", "Iris", "Amber"], ["You want dry pencil-like woods"], "Sandalwood adds creamy wood softness and a smooth lasting base.");
  add("Vetiver", ["Rooty", "Dry", "Elegant"], "Base", ["Fresh woody bases", "Green drydowns", "Earthy elegance"], ["Grapefruit", "Cedarwood", "Lime", "Oakmoss", "Black Pepper"], ["You dislike rooty dryness"], "Vetiver brings dry roots, clean smoke, and earthy refinement.");
  add("Guaiac Wood", ["Smoky", "Soft", "Resinous"], "Base", ["Soft smoke", "Amber woods", "Leather support"], ["Amber", "Tobacco", "Vanilla", "Cedarwood", "Labdanum"], ["You need crisp dry woods"], "Guaiac Wood adds gentle smoke and resinous warmth without harshness.");
  add("Hinoki", ["Clean", "Cypress", "Spa-like"], "Base", ["Japanese woods", "Tea freshness", "Minimalist drydowns"], ["Yuzu", "Green Tea", "Sea Salt", "White Musk", "Cedarwood"], ["You want creamy sweetness"], "Hinoki gives clean cypress-like wood with a calm spa atmosphere.");
  add("Pine", ["Resinous", "Needle-green", "Fresh"], "Base", ["Forest accords", "Winter greens", "Aromatic woods"], ["Eucalyptus", "Cedarwood", "Moss", "Frankincense", "Bergamot"], ["You dislike conifer sharpness"], "Pine adds forest air, green needles, and resinous freshness.");
  add("Birch Tar", ["Smoky", "Leathery", "Dark"], "Base", ["Leather accents", "Campfire smoke", "Nocturnal woods"], ["Leather", "Tobacco", "Vetiver", "Cedarwood", "Amber"], ["You want clean transparency"], "Birch Tar gives powerful smoke and leather, best used in small amounts.");
  add("Oud Accord", ["Dark", "Resinous", "Majestic"], "Base", ["Opulent woods", "Amber rose", "Evening signatures"], ["Rose", "Saffron", "Amber", "Patchouli", "Leather"], ["You want light daytime freshness"], "Oud Accord brings a dark resinous wood impression with ceremonial depth.");
  add("Driftwood", ["Dry", "Salty", "Weathered"], "Base", ["Marine woods", "Coastal drydowns", "Transparent bases"], ["Sea Salt", "Vetiver", "Cedarwood", "White Musk", "Mineral Water"], ["You want creamy wood"], "Driftwood adds sun-bleached dryness and salty wooden texture.");
  add("Iso E Super", ["Transparent", "Velvety", "Woody"], "Base", ["Modern woody aura", "Soft projection", "Minimalist structures"], ["Cedarwood", "White Musk", "Bergamot", "Vetiver", "Amber"], ["You want obvious natural wood character"], "Iso E Super gives a smooth transparent woody aura and helps other notes feel diffusive.");

  add("Patchouli", ["Earthy", "Chocolate-dark", "Woody"], "Base", ["Chypre bases", "Dark florals", "Gourmand depth"], ["Rose", "Cedarwood", "Dark Chocolate", "Amber", "Oakmoss"], ["You dislike earthy darkness"], "Patchouli adds earthy depth, dry chocolate facets, and lasting structure.");
  add("Oakmoss", ["Forest", "Bitter", "Mossy"], "Base", ["Chypre structure", "Vintage drydowns", "Green shadows"], ["Bergamot", "Rose", "Vetiver", "Patchouli", "Galbanum"], ["You want clean modern sweetness"], "Oakmoss brings forest-floor bitterness and classic mossy elegance.");
  add("Moss", ["Damp", "Green", "Soft"], "Base", ["Forest atmosphere", "Rainy green drydowns", "Natural softness"], ["Rain Accord", "Vetiver", "Cedarwood", "Grass", "Patchouli"], ["You dislike damp green notes"], "Moss adds a softer damp green ground than oakmoss, creating a quiet forest floor.");
  add("Soil Accord", ["Damp", "Mineral", "Earthy"], "Base", ["Rain garden effects", "Atmospheric drydowns", "Rooted naturalism"], ["Rain Accord", "Moss", "Vetiver", "Tomato Leaf", "Patchouli"], ["You want polished sweetness"], "Soil Accord suggests wet earth and mineral darkness after rain.");
  add("Mushroom", ["Humid", "Earthy", "Unusual"], "Base", ["Forest realism", "Experimental atmospheres", "Damp shadows"], ["Moss", "Soil Accord", "Patchouli", "Cedarwood", "Rain Accord"], ["You dislike unusual earthy facets"], "Mushroom adds humid forest depth and a slightly savory underground tone.");
  add("Root Accord", ["Rooty", "Dry", "Natural"], "Base", ["Botanical roots", "Earthy woods", "Green drydowns"], ["Vetiver", "Orris", "Patchouli", "Cedarwood", "Galbanum"], ["You want fruit or sweetness"], "Root Accord gives dry botanical earth and fibrous natural texture.");
  add("Rain Soil Accord", ["Petrichor", "Damp", "Mineral"], "Base", ["After-rain concepts", "Green atmospheres", "Natural wet earth"], ["Rain Accord", "Moss", "Vetiver", "Tomato Leaf", "Mineral Water"], ["You dislike damp earth"], "Rain Soil Accord captures the smell of wet ground after rain, adding memory and atmosphere.");

  add("Amber", ["Golden", "Warm", "Smooth"], "Base", ["Warm bases", "Evening signatures", "Soft projection"], ["Vanilla", "Labdanum", "Benzoin", "Patchouli", "Rose"], ["You want fresh minimalism"], "Amber adds golden warmth and roundness, giving a perfume a lasting glow.");
  add("Ambroxan", ["Mineral", "Ambergris", "Radiant"], "Base", ["Modern diffusion", "Marine amber", "Long-lasting clarity"], ["Bergamot", "Cedarwood", "Sea Salt", "White Musk", "Vetiver"], ["You dislike dry mineral amber"], "Ambroxan gives a dry mineral amber radiance and strong modern diffusion.");
  add("Labdanum", ["Resinous", "Leathered", "Dark Amber"], "Base", ["Amber leather", "Chypre bases", "Nocturnal warmth"], ["Rose", "Patchouli", "Saffron", "Frankincense", "Vanilla"], ["You want clean transparency"], "Labdanum adds dark sticky resin, leather warmth, and antique amber depth.");
  add("Benzoin", ["Balsamic", "Vanilla-like", "Soft"], "Base", ["Soft amber bases", "Vanilla support", "Resin warmth"], ["Vanilla", "Amber", "Sandalwood", "Tonka Bean", "Frankincense"], ["You dislike balsamic sweetness"], "Benzoin gives balsamic softness and a vanilla-like resin glow.");
  add("Frankincense", ["Incense", "Mineral", "Sacred"], "Base", ["Incense woods", "Stone atmospheres", "Elegant dry smoke"], ["Cedarwood", "Myrrh", "Elemi", "Rosemary", "Amber"], ["You dislike church-like incense"], "Frankincense adds dry sacred smoke and mineral clarity.");
  add("Myrrh", ["Bitter", "Resinous", "Ancient"], "Base", ["Dark resins", "Incense blends", "Medicinal depth"], ["Frankincense", "Amber", "Labdanum", "Rose", "Patchouli"], ["You dislike bitter resin"], "Myrrh brings bitter resin and antique depth, darker and more medicinal than frankincense.");
  add("Copal", ["Piney", "Resinous", "Golden"], "Base", ["Golden incense", "Forest resin", "Warm drydowns"], ["Pine", "Frankincense", "Amber", "Cedarwood", "Elemi"], ["You want creamy sweetness"], "Copal adds bright golden resin with a pine-like ceremonial warmth.");
  add("Opoponax", ["Sweet Resin", "Balsamic", "Velvety"], "Base", ["Soft amber bases", "Powdery resins", "Warm florals"], ["Vanilla", "Amber", "Orris", "Labdanum", "Sandalwood"], ["You dislike sweet balsams"], "Opoponax gives a plush sweet resin, more velvety and powdery than frankincense.");
  add("Elemi", ["Lemony", "Peppery", "Resin"], "Top", ["Bright incense", "Citrus resin lift", "Spiced woods"], ["Frankincense", "Lemon", "Black Pepper", "Cedarwood", "Bergamot"], ["You want dark heavy resin only"], "Elemi adds a lemony peppered resin sparkle that lifts incense structures.");
  add("Peru Balsam", ["Vanillic", "Balsamic", "Warm"], "Base", ["Warm bases", "Vanilla support", "Soft resins"], ["Vanilla", "Benzoin", "Tonka Bean", "Amber", "Sandalwood"], ["You dislike sweet resin warmth"], "Peru Balsam gives smooth vanilla-like balsamic warmth and excellent base softness.");

  add("White Musk", ["Clean", "Soft", "Radiant"], "Base", ["Clean drydowns", "Skin-like softness", "Fresh florals"], ["Bergamot", "Pear", "Rose", "Cedarwood", "Green Tea"], ["You want animalic depth"], "White Musk gives clean softness and gentle diffusion, helping notes feel polished and wearable.");
  add("Clean Musk", ["Laundry", "Fresh", "Smooth"], "Base", ["Fresh musks", "Clean daytime scents", "Soft projection"], ["Lemon", "White Tea", "Pear", "Sea Salt", "Cedarwood"], ["You dislike laundry-like cleanliness"], "Clean Musk adds a washed linen effect and smooth fresh persistence.");
  add("Skin Musk", ["Intimate", "Warm", "Soft"], "Base", ["Skin scents", "Subtle drydowns", "Quiet florals"], ["Ambrette", "Sandalwood", "Iris", "Vanilla", "White Musk"], ["You need high-impact projection"], "Skin Musk stays close and warm, creating a natural intimate finish.");
  add("Cashmere Musk", ["Soft", "Woody", "Textile"], "Base", ["Cozy musks", "Soft woody bases", "Warm fabric effects"], ["Cedarwood", "Sandalwood", "Vanilla", "Amber", "Iris"], ["You want crisp clean musk"], "Cashmere Musk gives a warm textile softness and a gentle woody cushion.");
  add("Ambrette", ["Seed-like", "Pear", "Musk"], "Base", ["Natural musk effects", "Soft fruit-musks", "Elegant skin scents"], ["Pear", "Iris", "White Musk", "Sandalwood", "Bergamot"], ["You dislike seed-like musk"], "Ambrette adds a natural musky warmth with pear-like brightness and soft seed texture.");
  add("Soft Musk", ["Powdery", "Gentle", "Clean"], "Base", ["Soft drydowns", "Powdery florals", "Comfort scents"], ["Rice Powder", "Vanilla", "Rose", "Iris", "White Musk"], ["You need strong edge"], "Soft Musk creates a gentle clean veil and smooths the drydown.");
  add("Powder Musk", ["Cosmetic", "Clean", "Velvety"], "Base", ["Powdery bases", "Makeup accords", "Soft vintage effects"], ["Iris Powder", "Rice Powder", "Orris", "Vanilla", "White Musk"], ["You dislike cosmetic powder"], "Powder Musk gives a clean cosmetic softness with a plush finish.");
  add("Laundry Musk", ["Fresh Linen", "Clean", "Bright"], "Base", ["Laundry freshness", "Clean florals", "Crisp everyday scents"], ["Clean Musk", "Lemon", "White Tea", "Sea Salt", "Violet Leaf"], ["You want natural skin warmth"], "Laundry Musk gives the clear brightness of freshly washed fabric.");

  add("Ocean Accord", ["Salty", "Breezy", "Fresh"], "Top", ["Marine freshness", "Open airy compositions", "Coastal stories"], ["Sea Salt", "Driftwood", "White Musk", "Yuzu", "Mineral Water"], ["You dislike aquatic freshness"], "Ocean Accord creates a broad sea-air impression with fresh mineral space.");
  add("Sea Salt", ["Mineral", "Salty", "Airy"], "Top", ["Coastal accents", "Transparent woods", "Fresh skin scents"], ["Driftwood", "Yuzu", "White Musk", "Sage", "Ambroxan"], ["You want sweet warmth"], "Sea Salt adds mineral sparkle and dry salinity without becoming watery.");
  add("Rain Accord", ["Wet", "Fresh", "Transparent"], "Top", ["After-rain atmospheres", "Green freshness", "Soft aquatic openings"], ["Moss", "Green Tea", "Violet Leaf", "Rain Soil Accord", "White Musk"], ["You dislike watery effects"], "Rain Accord gives the impression of cool air and wet surfaces.");
  add("Mineral Water", ["Clear", "Stone", "Cool"], "Top", ["Minimal aquatic effects", "Tea freshness", "Stone atmospheres"], ["Yuzu", "White Tea", "River Stone", "White Musk", "Hinoki"], ["You want lush sweetness"], "Mineral Water brings clear watery freshness with a cool stone edge.");
  add("River Stone", ["Mineral", "Cool", "Smooth"], "Base", ["Stone accords", "Quiet watery drydowns", "Atmospheric freshness"], ["Mineral Water", "Rain Accord", "Moss", "Hinoki", "White Musk"], ["You dislike mineral dryness"], "River Stone suggests wet smooth rock and quiet mineral shade.");
  add("Seaweed", ["Marine Green", "Salty", "Textural"], "Heart", ["Ocean realism", "Green marine accords", "Unusual coastal depth"], ["Sea Salt", "Driftwood", "Mineral Water", "Moss", "Ambroxan"], ["You dislike briny green notes"], "Seaweed adds briny green texture and a realistic coastal shadow.");
  add("White Foam Accord", ["Frothy", "Marine", "Clean"], "Top", ["Sea foam effects", "Light aquatics", "Fresh musks"], ["Ocean Accord", "Sea Salt", "Clean Musk", "Yuzu", "Driftwood"], ["You want no aquatic tone"], "White Foam Accord gives a sparkling froth effect, lighter than ocean accord.");
  add("Bubble Lake Accord", ["Soft Aquatic", "Playful", "Clear"], "Top", ["Transparent aquatic concepts", "Playful fresh scents", "Light atmospheric openings"], ["Mineral Water", "White Musk", "Pear", "Rain Accord", "Lemon"], ["You want dark or dense depth"], "Bubble Lake Accord feels clear, playful, and lightly sparkling, like bubbles on still water.");
  add("Ozonic Air", ["Airy", "Electric", "Clean"], "Top", ["Open space", "Fresh projection", "Atmospheric lift"], ["Rain Accord", "Clean Musk", "Ambroxan", "White Tea", "Cedarwood"], ["You dislike abstract clean air notes"], "Ozonic Air creates lift and open space, making a formula feel taller and more transparent.");

  add("Leather", ["Dark", "Tailored", "Warm"], "Base", ["Tailored drydowns", "Saffron leather", "Evening signatures"], ["Saffron", "Birch Tar", "Rose", "Labdanum", "Tobacco"], ["You want soft clean sweetness"], "Leather adds tailored darkness and a polished vintage texture.");
  add("Suede", ["Soft", "Powdery", "Tactile"], "Base", ["Soft leather", "Powdery florals", "Elegant drydowns"], ["Orris", "Iris", "Violet Leaf", "White Musk", "Sandalwood"], ["You dislike powdery leather"], "Suede is softer and more tactile than leather, with a muted fabric-like warmth.");
  add("Tobacco", ["Honeyed", "Leafy", "Warm"], "Base", ["Warm drydowns", "Amber tobacco", "Vintage gourmand depth"], ["Vanilla", "Honey", "Cherry", "Labdanum", "Cedarwood"], ["You dislike tobacco sweetness"], "Tobacco brings dried leaf warmth, honeyed depth, and a vintage lounge mood.");
  add("Hay", ["Dry", "Coumarin", "Golden"], "Base", ["Rural warmth", "Tonka support", "Dry sunny accords"], ["Tonka Bean", "Lavender", "Chamomile", "Honey", "Cedarwood"], ["You dislike dry grassy warmth"], "Hay adds sun-dried grass and coumarin warmth, giving rustic softness.");
  add("Cigar Box", ["Woody", "Tobacco", "Polished"], "Base", ["Tobacco woods", "Vintage studies", "Dark drydowns"], ["Tobacco", "Cedarwood", "Leather", "Vanilla", "Amber"], ["You want clean freshness"], "Cigar Box combines polished wood and tobacco leaf for a refined cabinet-like warmth.");
  add("Saffiano Leather", ["Polished", "Dry", "Luxury"], "Base", ["Luxury leather accents", "Tailored florals", "Elegant drydowns"], ["Saffron", "Rose", "Cedarwood", "Iris", "Ambroxan"], ["You want raw smoky leather"], "Saffiano Leather gives a cleaner, more polished leather texture than birch tar or raw leather.");
  add("Birch Leather", ["Smoky", "Dry", "Rugged"], "Base", ["Smoky leather", "Dark woods", "Nocturnal accords"], ["Birch Tar", "Vetiver", "Tobacco", "Cedarwood", "Amber"], ["You dislike smoke"], "Birch Leather adds dry smoke and rugged leather depth.");

  add("Rice Powder", ["Soft", "Dry", "Cosmetic"], "Heart", ["Powdery florals", "Soft musks", "Gentle comfort"], ["Iris", "White Musk", "Vanilla", "Milk", "Almond"], ["You want juicy projection"], "Rice Powder gives a soft dry powder effect, more delicate and neutral than makeup powder.");
  add("Orris Powder", ["Luxury", "Rooty", "Cosmetic"], "Heart", ["Elegant powder", "Lipstick accords", "Suede florals"], ["Orris", "Iris", "Suede", "Violet Powder", "Cedarwood"], ["You dislike rooty powder"], "Orris Powder adds a refined rooty cosmetic softness.");
  add("Iris Powder", ["Cool", "Elegant", "Dry"], "Heart", ["Powdery floral hearts", "Elegant musks", "Soft woody florals"], ["Iris", "White Musk", "Cedarwood", "Rice Powder", "Ambrette"], ["You want warm edible sweetness"], "Iris Powder gives cool powder and a polished floral skin effect.");
  add("Makeup Powder", ["Cosmetic", "Vintage", "Soft"], "Heart", ["Lipstick effects", "Vintage florals", "Powdery musks"], ["Rose", "Iris", "Violet Powder", "White Musk", "Vanilla"], ["You dislike cosmetic associations"], "Makeup Powder adds a recognizably cosmetic, vintage vanity-table softness.");
  add("Chalk Accord", ["Dry", "Mineral", "Dusty"], "Heart", ["Abstract powder", "Schoolroom atmospheres", "Dry mineral contrast"], ["Paper Accord", "Iris", "Cedarwood", "White Musk", "Dusty Sunbeam"], ["You want creamy powder"], "Chalk Accord gives dry mineral powder and a quiet dusty texture.");
  add("Talc", ["Soft", "Clean", "Baby Powder"], "Heart", ["Clean powder", "Soft musks", "Comforting drydowns"], ["White Musk", "Vanilla", "Rice Powder", "Lavender", "Almond"], ["You dislike baby-powder effects"], "Talc adds familiar clean powder and a gentle soft-focus finish.");
  add("Violet Powder", ["Sweet Powder", "Floral", "Vintage"], "Heart", ["Vintage powder florals", "Cosmetic sweetness", "Soft romantic hearts"], ["Iris", "Rose", "White Musk", "Makeup Powder", "Vanilla"], ["You want unsweetened powder"], "Violet Powder gives sweet floral powder with a nostalgic cosmetic character.");
  add("Dusting Powder", ["Dry", "Soft", "Airy"], "Heart", ["Gentle powder clouds", "Soft musks", "Light vintage effects"], ["Rice Powder", "White Musk", "Iris Powder", "Vanilla", "Soft Musk"], ["You need bold intensity"], "Dusting Powder creates a light airy powder cloud rather than dense cosmetics.");

  add("Old Library Accord", ["Parchment", "Woody", "Nostalgic"], "Base", ["Archive concepts", "Paper woods", "Intellectual atmospheres"], ["Paper Accord", "Cedarwood", "Dusty Sunbeam", "Vanilla", "Leather"], ["You want fresh fruit"], "Old Library Accord suggests aged paper, polished shelves, and quiet dust warmed by light.");
  add("Glasshouse Accord", ["Humid", "Green", "Sunlit"], "Heart", ["Botanical atmospheres", "Green florals", "Rainy sunlight"], ["Tomato Leaf", "Green Tea", "Violet Leaf", "Rain Accord", "White Musk"], ["You dislike humid green effects"], "Glasshouse Accord evokes warm glass, leaves, water, and botanical sunlight.");
  add("Rainy Window Accord", ["Misty", "Cool", "Reflective"], "Top", ["Rain stories", "Clean atmospheres", "Quiet emotional concepts"], ["Rain Accord", "White Tea", "Mineral Water", "Violet Leaf", "White Musk"], ["You want warmth and sweetness"], "Rainy Window Accord gives cool glass, soft rain, and a reflective indoor mood.");
  add("Dusty Sunbeam", ["Warm Dust", "Nostalgic", "Soft"], "Heart", ["Archive atmospheres", "Vintage sunlight", "Powdery woods"], ["Paper Accord", "Old Library Accord", "Cedarwood", "Rice Powder", "Amber"], ["You dislike dust effects"], "Dusty Sunbeam suggests suspended dust in warm light, adding memory and softness.");
  add("Candle Smoke", ["Wax", "Smoke", "Quiet"], "Base", ["Candlelit atmospheres", "Soft incense", "Nocturnal rooms"], ["Frankincense", "Vanilla", "Cedarwood", "Myrrh", "Amber"], ["You dislike smoke"], "Candle Smoke gives gentle extinguished-wick smoke and warm wax atmosphere.");
  add("Stone Chapel", ["Mineral", "Incense", "Cool"], "Base", ["Sacred atmospheres", "Mineral incense", "Quiet stone interiors"], ["Frankincense", "River Stone", "Myrrh", "Cedarwood", "Rain Accord"], ["You want bright gourmand warmth"], "Stone Chapel combines cool stone and dry incense for a solemn architectural mood.");
  add("Morning Fog", ["Soft", "Misty", "Cool"], "Top", ["Misty openings", "Soft atmospheric freshness", "Quiet green stories"], ["White Tea", "Rain Accord", "Moss", "Violet Leaf", "White Musk"], ["You want direct brightness"], "Morning Fog adds a soft veil of cool air and diffused light.");
  add("Paper Accord", ["Dry", "Parchment", "Quiet"], "Heart", ["Archive stories", "Bookish accords", "Dry powder structure"], ["Old Library Accord", "Cedarwood", "Rice Powder", "Vanilla", "Chalk Accord"], ["You want juicy notes"], "Paper Accord gives dry fibers, parchment, and quiet book-page texture.");
  add("Forest Mist Accord", ["Green", "Misty", "Wooded"], "Heart", ["Forest atmospheres", "Rainy woods", "Green drydowns"], ["Moss", "Pine", "Rain Accord", "Vetiver", "Cedarwood"], ["You dislike damp woods"], "Forest Mist Accord creates a cool green forest haze with wet wood and moss.");

  const familyDefaults = {
    Citrus: {
      mood: ["Bright", "Sparkling", "Uplifting"],
      bestUsedFor: ["Opening lift", "Fresh top notes", "Clean daytime compositions"],
      pairsWellWith: ["Neroli", "Petitgrain", "Green Tea", "White Musk", "Cedarwood"],
      avoidIf: ["You dislike sharp or fast-opening freshness"],
      sentence: "adds citrus lift and peel clarity, shaping the first impression with brightness and movement."
    },
    Fruity: {
      mood: ["Juicy", "Expressive", "Colorful"],
      bestUsedFor: ["Fruit accents", "Soft floral hearts", "Playful openings"],
      pairsWellWith: ["Rose", "White Musk", "Vanilla", "Bergamot", "Cedarwood"],
      avoidIf: ["You want a very dry or austere perfume"],
      sentence: "adds fruit color and emotional warmth, useful when the formula needs a more vivid personality."
    },
    Floral: {
      mood: ["Petal-soft", "Romantic", "Elegant"],
      bestUsedFor: ["Heart structure", "Floral identity", "Soft expressive centers"],
      pairsWellWith: ["Bergamot", "White Musk", "Sandalwood", "Vanilla", "Patchouli"],
      avoidIf: ["You are avoiding a floral heart"],
      sentence: "forms part of the perfume heart, adding petal character and emotional focus."
    },
    Green: {
      mood: ["Leafy", "Botanical", "Fresh"],
      bestUsedFor: ["Green realism", "Garden concepts", "Fresh natural structure"],
      pairsWellWith: ["Citrus", "Tea", "Vetiver", "Moss", "White Musk"],
      avoidIf: ["You dislike leaf, stem, or garden-like effects"],
      sentence: "brings botanical life and natural green texture to the composition."
    },
    "Tea & Aromatic": {
      mood: ["Calm", "Herbal", "Refined"],
      bestUsedFor: ["Tea accords", "Aromatic lift", "Quiet fresh structures"],
      pairsWellWith: ["Bergamot", "White Musk", "Cedarwood", "Pear", "Lavender"],
      avoidIf: ["You want a purely sweet or fruity perfume"],
      sentence: "adds aromatic detail and a brewed, herbal, or contemplative mood."
    },
    Spicy: {
      mood: ["Warm", "Textural", "Lively"],
      bestUsedFor: ["Energy", "Warmth", "Textural contrast"],
      pairsWellWith: ["Citrus", "Woods", "Amber", "Rose", "Tea"],
      avoidIf: ["You dislike spice movement or warmth"],
      sentence: "adds spice movement and tactile contrast, helping the formula feel handcrafted."
    },
    Gourmand: {
      mood: ["Comforting", "Creamy", "Indulgent"],
      bestUsedFor: ["Sweet bases", "Dessert-like hearts", "Comfort drydowns"],
      pairsWellWith: ["Tonka Bean", "White Musk", "Cedarwood", "Amber", "Coffee"],
      avoidIf: ["You dislike edible sweetness or creamy warmth"],
      sentence: "adds edible warmth and comfort, but should be balanced so the perfume stays polished."
    },
    Woods: {
      mood: ["Grounded", "Textured", "Lasting"],
      bestUsedFor: ["Base structure", "Drydown shape", "Woody signatures"],
      pairsWellWith: ["Citrus", "Amber", "Musk", "Vetiver", "Tea"],
      avoidIf: ["You want a weightless or purely fruity scent"],
      sentence: "adds structure, texture, and longevity to the drydown."
    },
    Earthy: {
      mood: ["Grounded", "Damp", "Natural"],
      bestUsedFor: ["Atmospheric depth", "Forest effects", "Rooted drydowns"],
      pairsWellWith: ["Woods", "Green notes", "Rain", "Patchouli", "Vetiver"],
      avoidIf: ["You dislike soil, moss, or damp natural tones"],
      sentence: "grounds the perfume with soil, moss, root, or mineral character."
    },
    "Amber & Resin": {
      mood: ["Golden", "Resinous", "Ceremonial"],
      bestUsedFor: ["Warm bases", "Evening signatures", "Long-lasting depth"],
      pairsWellWith: ["Vanilla", "Rose", "Patchouli", "Woods", "Incense"],
      avoidIf: ["You want a very light fresh scent"],
      sentence: "adds resinous warmth and a glowing long-lasting base."
    },
    Musk: {
      mood: ["Soft", "Clean", "Skin-like"],
      bestUsedFor: ["Drydown polish", "Soft diffusion", "Wearable finishes"],
      pairsWellWith: ["Citrus", "Florals", "Tea", "Woods", "Powder"],
      avoidIf: ["You want rough, animalic, or very dark depth"],
      sentence: "softens the formula and gives the drydown a wearable skin-like finish."
    },
    "Marine & Air": {
      mood: ["Airy", "Clear", "Mineral"],
      bestUsedFor: ["Open space", "Aquatic freshness", "Transparent structures"],
      pairsWellWith: ["White Musk", "Cedarwood", "Yuzu", "Sea Salt", "Ambroxan"],
      avoidIf: ["You dislike aquatic or ozonic freshness"],
      sentence: "creates airy space, water, and mineral freshness."
    },
    "Leather & Tobacco": {
      mood: ["Tailored", "Dark", "Vintage"],
      bestUsedFor: ["Nocturnal drydowns", "Tailored warmth", "Vintage character"],
      pairsWellWith: ["Amber", "Saffron", "Rose", "Cedarwood", "Vanilla"],
      avoidIf: ["You want a clean bright daytime scent"],
      sentence: "adds darker texture, tailored warmth, and vintage character."
    },
    Powdery: {
      mood: ["Soft", "Cosmetic", "Dry"],
      bestUsedFor: ["Powdery hearts", "Soft musks", "Vintage elegance"],
      pairsWellWith: ["Iris", "White Musk", "Vanilla", "Rose", "Almond"],
      avoidIf: ["You dislike cosmetic or dusty softness"],
      sentence: "adds powder, softness, and a gentle cosmetic finish."
    },
    Atmospheric: {
      mood: ["Story-like", "Textural", "Memory-rich"],
      bestUsedFor: ["Narrative accords", "Fantasy atmospheres", "Environmental detail"],
      pairsWellWith: ["Woods", "Musk", "Tea", "Rain", "Resin"],
      avoidIf: ["You want a simple note-forward perfume"],
      sentence: "creates an environmental impression, turning the formula into a place or memory."
    },
    Default: {
      mood: ["Balanced", "Textural"],
      bestUsedFor: ["Creative accords", "Supporting structure"],
      pairsWellWith: ["Citrus", "Woods", "Musk"],
      avoidIf: ["You want a very minimal composition"],
      sentence: "shapes the perfume's mood, structure, and storytelling direction."
    }
  };

  function fallbackFor(material) {
    const base = familyDefaults[material.category] || familyDefaults.Default;
    return detail(
      base.mood,
      material.suggestedRole || ["Supporting"],
      base.bestUsedFor,
      base.pairsWellWith,
      base.avoidIf,
      `${material.name} ${base.sentence}`
    );
  }

  window.LIBRARY_MATERIALS = materials.map((material) => {
    if (material.status === "coming-soon") return material;
    const override = details[material.id] || details[slug(material.name)] || fallbackFor(material);
    return Object.assign({}, material, fallbackFor(material), override);
  });
}());
