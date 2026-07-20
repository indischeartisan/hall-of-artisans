window.ACADEMY_DATA = {
  page: {
    title: "The Academy",
    subtitle: "Learn the language of fragrance inside The Hall of Artisans.",
    backgroundImage: "assets/academy/images/academy-bg-clean.webp",
    activeNav: "The Academy"
  },
  nav: [
    { label: "The Academy", href: "/academy" },
    { label: "The Library", href: "/library" },
    { label: "Make Your Perfume", href: "/chamber-of-creation" },
    { label: "Hall Archive", href: "#archive" },
    { label: "Bespoke Atelier", href: "#atelier" },
    { label: "Artisan Register", href: "/artisan-register" }
  ],
  lessons: [
  {
    id: "introduction-to-perfumery",
    number: "01",
    title: "Introduction to Perfumery",
    shortTitle: "Introduction",
    cardDescription: "Discover how a smell becomes a crafted perfume.",
    icon: "assets/academy/icons/lesson-intro.svg",
    openingLine: "Before a perfume is made, an artisan must first understand what kind of memory they are trying to preserve.",
    objective: "By the end of this lesson, you will understand the difference between a smell, a fragrance, a perfume, and a scent impression. You will also learn why every bespoke perfume begins with a clear story.",
    lecture: [
      {
        heading: "Smell, fragrance, and perfume",
        body: [
          "A smell is anything your nose can notice: rain on stone, warm rice, citrus peel, old paper, flowers, skin, smoke, or wood.",
          "A fragrance is the impression created by that smell. It may feel fresh, warm, strange, comforting, clean, dusty, sweet, cold, or nostalgic.",
          "A perfume is a crafted fragrance. It is not only something that smells pleasant. It is an arranged composition made with intention, structure, and direction."
        ]
      },
      {
        heading: "Perfume as a memory object",
        body: [
          "Inside The Hall of Artisans, a perfume begins with a question: what should this scent remember?",
          "A perfume may preserve the feeling of a place, the shape of a dream, the color of a room, the comfort of food, or the strangeness of an imaginary world.",
          "This is why a bespoke perfume should not begin from a random list of notes. It should begin from a clear story."
        ]
      },
      {
        heading: "Scent impression",
        body: [
          "A scent impression is the image or feeling created by aroma. It is the reason someone may say a perfume smells like a rainy window, a clean shirt, a cold forest, a dessert table, or an old library.",
          "When you do not know perfume vocabulary yet, describe the impression first. The Academy will help translate that impression into the language of fragrance."
        ]
      }
    ],
    framework: {
      title: "The First Academy Rule",
      steps: [
        "Start with a memory, place, mood, or image.",
        "Describe how it feels before describing what notes it needs.",
        "Choose only the details that matter most.",
        "Let the fragrance brief become a map for the artisan."
      ]
    },
    indischeExample: {
      title: "Cucumber from Indische World",
      description: "In the ordinary world, cucumber may simply be a vegetable. Inside Indische World, it can become a crisp, watery, green, strange, refreshing fragrance with a character of its own.",
      details: [
        "Everyday object: cucumber",
        "Scent impression: crisp, green, watery, unusual",
        "Perfume direction: fresh green fragrance with a curious Indische twist"
      ]
    },
    commonMistakes: [
      "Starting with too many notes before knowing the story.",
      "Using vague words like nice, expensive, or unique without explaining the feeling.",
      "Thinking a perfume must smell literal, even when the idea is emotional or imaginary."
    ],
    miniExercise: {
      title: "Memory to Scent",
      prompt: "Write one everyday smell that you think deserves to become a perfume. Then write three words that describe its feeling.",
      exampleAnswer: "Rainy morning tea — soft, green, warm."
    },
    checkpoint: [
      {
        question: "What is the difference between a smell and a perfume?",
        answer: "A smell is something noticed by the nose. A perfume is a crafted fragrance made with intention and structure."
      },
      {
        question: "Why should a bespoke perfume begin with a story?",
        answer: "Because the story gives direction and helps the artisan understand what the scent should express."
      },
      {
        question: "What is a scent impression?",
        answer: "The feeling, image, place, or mood created by an aroma."
      }
    ],
    keyTerms: ["Scent", "Fragrance", "Perfume", "Scent Impression", "Fragrance Brief"],
    nextLesson: "top-heart-base"
  },
  {
    id: "top-heart-base",
    number: "02",
    title: "Top, Heart & Base",
    shortTitle: "Structure",
    cardDescription: "Understand how perfume moves from first impression to lasting memory.",
    icon: "assets/academy/icons/lesson-pyramid.svg",
    openingLine: "Every perfume has a beginning, a heart, and a memory.",
    objective: "By the end of this lesson, you will understand how a fragrance changes over time and why top, heart, base, and drydown matter when creating a perfume brief.",
    lecture: [
      {
        heading: "Perfume moves through time",
        body: [
          "A perfume is not frozen in one moment. It opens, develops, softens, and leaves a trace.",
          "This movement happens because different aromatic materials evaporate and appear at different speeds. Some are bright and quick. Some are slower, deeper, and more persistent.",
          "To understand this journey, perfumers often speak about top notes, heart notes, and base notes."
        ]
      },
      {
        heading: "Top notes — the opening gate",
        body: [
          "Top notes are the first impression. They appear quickly when the perfume is first sprayed.",
          "They often feel bright, fresh, sharp, green, citrusy, airy, herbal, or sparkling.",
          "Top notes are important because they invite the wearer into the fragrance, but they are not the whole story."
        ]
      },
      {
        heading: "Heart notes — the main character",
        body: [
          "Heart notes appear after the opening begins to fade. This is where the identity of the perfume becomes clearer.",
          "The heart may contain florals, fruits, spices, tea, milk, green accords, gourmand accords, or atmospheric materials.",
          "If top notes are the door, heart notes are the room you enter."
        ]
      },
      {
        heading: "Base notes — the lasting memory",
        body: [
          "Base notes are the foundation. They remain the longest and shape the final memory of the perfume on skin.",
          "Common base directions include musk, woods, amber, moss, vanilla, vetiver, sandalwood, patchouli, resin, and soft skin-like materials.",
          "The drydown is the later stage of the fragrance, when the lighter notes fade and the base becomes more visible."
        ]
      }
    ],
    framework: {
      title: "Opening → Character → Memory",
      steps: [
        "Opening: what should the first impression feel like?",
        "Character: what is the soul of the fragrance?",
        "Memory: what should remain after hours on skin?",
        "Drydown: what should the perfume become at the end?"
      ]
    },
    indischeExample: {
      title: "Forest Shower Lake",
      description: "A clean green fragrance inspired by cold air, soft foam, misty leaves, and mossy water inside Indische World.",
      structure: {
        top: ["Cold Forest Air", "Crystal Lake", "Green Leaves"],
        heart: ["White Foam", "Violet Leaf", "Forest Mist"],
        base: ["White Musk", "Moss", "Vetiver"]
      }
    },
    commonMistakes: [
      "Judging a perfume only from the first spray.",
      "Putting all favorite notes into the top without thinking about the drydown.",
      "Forgetting that a beautiful opening still needs a lasting base."
    ],
    miniExercise: {
      title: "Three Moments of One Memory",
      prompt: "Choose one scent memory and divide it into three parts: first impression, main feeling, and final memory.",
      exampleAnswer: "Rainy café: first impression — wet pavement; main feeling — warm tea and bread; final memory — soft wood and musk."
    },
    checkpoint: [
      {
        question: "Which part of a perfume usually appears first?",
        answer: "Top notes."
      },
      {
        question: "Which part often shapes the main character?",
        answer: "Heart notes."
      },
      {
        question: "What is drydown?",
        answer: "The later stage of a perfume, when lighter notes fade and the lasting base becomes more noticeable."
      }
    ],
    keyTerms: ["Top Notes", "Heart Notes", "Base Notes", "Drydown", "Longevity"],
    previousLesson: "introduction-to-perfumery",
    nextLesson: "fragrance-families"
  },
  {
    id: "fragrance-families",
    number: "03",
    title: "Fragrance Families",
    shortTitle: "Families",
    cardDescription: "Explore the maps of scent character: fresh, floral, woody, gourmand, and more.",
    icon: "assets/academy/icons/lesson-family.svg",
    openingLine: "Fragrance families are maps, not cages.",
    objective: "By the end of this lesson, you will understand the main fragrance families and how they help shape the mood, character, and direction of a perfume concept.",
    lecture: [
      {
        heading: "Why families matter",
        body: [
          "Fragrance families help us speak about the general character of a perfume.",
          "They are not strict rules. A single perfume can belong to several families at once. For example, a scent can be fresh, green, aquatic, and musky at the same time.",
          "When building your own scent brief, families help you avoid confusion. They tell the artisan what kind of world your perfume belongs to."
        ]
      },
      {
        heading: "The main families",
        body: [
          "Fresh scents feel bright, clean, citrusy, airy, or energetic.",
          "Floral scents feel like petals, gardens, bouquets, powdery flowers, or blooming rooms.",
          "Green scents feel like leaves, stems, crushed grass, herbs, vines, or wet gardens.",
          "Woody scents feel like cedar, sandalwood, bark, pencil shavings, old furniture, roots, or warm timber.",
          "Gourmand scents feel edible: vanilla, cream, caramel, jam, chocolate, coffee, bread, milk, or dessert.",
          "Powdery, musky, amber, spicy, aquatic, fruity, and earthy families add texture, intimacy, warmth, sparkle, or depth."
        ]
      },
      {
        heading: "How to use families in a brief",
        body: [
          "Do not choose every family you like. Choose the two or three families that support your story most clearly.",
          "If your story is a shower in a cold forest, Fresh, Green, Aquatic, and Musky may be enough.",
          "If your story is a dessert café at sunset, Gourmand, Fruity, Woody, and Musky may be more useful."
        ]
      }
    ],
    framework: {
      title: "Family Map",
      steps: [
        "Choose one main family as the central direction.",
        "Choose one or two supporting families for depth.",
        "Avoid adding families that do not serve the story.",
        "Use families to communicate mood before listing notes."
      ]
    },
    familyGuide: [
      {
        family: "Fresh",
        smellsLike: "Citrus peel, clean air, watery brightness, light herbs.",
        feeling: "Clear, energetic, modern, bright.",
        indischeMatch: "Crystal Lake, Forest Shower Lake.",
        pairsWith: ["Green", "Aquatic", "Light Floral", "Musk"]
      },
      {
        family: "Floral",
        smellsLike: "Petals, blooming flowers, soft bouquets, rose, jasmine, violet.",
        feeling: "Romantic, elegant, graceful, soft, sometimes dramatic.",
        indischeMatch: "Maison Entonnoir Room, Violette Vanille Chamber.",
        pairsWith: ["Powdery", "Woody", "Fruity", "Musk"]
      },
      {
        family: "Green",
        smellsLike: "Leaves, stems, grass, herbs, crushed plants, gardens after rain.",
        feeling: "Natural, crisp, strange, fresh, alive.",
        indischeMatch: "Carrot Garden, Forest Shower Lake.",
        pairsWith: ["Fresh", "Floral", "Woody", "Earthy"]
      },
      {
        family: "Woody",
        smellsLike: "Cedar, sandalwood, vetiver, bark, roots, old shelves.",
        feeling: "Grounded, elegant, long-lasting, calm.",
        indischeMatch: "Moonlit Library, Maison Entonnoir Room.",
        pairsWith: ["Amber", "Spicy", "Floral", "Musk"]
      },
      {
        family: "Gourmand",
        smellsLike: "Vanilla, cream, jam, caramel, coffee, bread, chocolate.",
        feeling: "Comforting, edible, nostalgic, warm, playful.",
        indischeMatch: "Tonka Ice Cream Café, Plum Jam Café.",
        pairsWith: ["Woody", "Amber", "Fruity", "Musk"]
      },
      {
        family: "Powdery",
        smellsLike: "Iris, violet, cosmetic powder, old paper, soft musk.",
        feeling: "Quiet, elegant, nostalgic, intimate.",
        indischeMatch: "Maison Entonnoir Room, Violette Vanille Chamber.",
        pairsWith: ["Floral", "Woody", "Musk", "Vanilla"]
      }
    ],
    indischeExample: {
      title: "Tonka Ice Cream Café",
      description: "This concept may begin in the Gourmand family, supported by Musky and Woody families so the sweetness becomes wearable instead of heavy.",
      details: [
        "Main family: Gourmand",
        "Supporting families: Musky, Woody, Amber",
        "Effect: creamy, soft, nostalgic, lasting"
      ]
    },
    commonMistakes: [
      "Choosing too many families until the scent direction becomes unclear.",
      "Assuming one family can only express one gender or one occasion.",
      "Forgetting that supporting families can make a concept more wearable."
    ],
    miniExercise: {
      title: "Choose Your Families",
      prompt: "Choose one perfume story. Select one main fragrance family and two supporting families.",
      exampleAnswer: "Story: old café during rain. Main family: Gourmand. Supporting: Woody and Musky."
    },
    checkpoint: [
      {
        question: "Are fragrance families strict rules?",
        answer: "No. They are maps that help describe scent direction."
      },
      {
        question: "Which family often feels edible or dessert-like?",
        answer: "Gourmand."
      },
      {
        question: "Why choose supporting families?",
        answer: "They add depth, balance, texture, and wearability to the main idea."
      }
    ],
    keyTerms: ["Fragrance Family", "Main Family", "Supporting Family", "Mood", "Pairing"],
    previousLesson: "top-heart-base",
    nextLesson: "notes-accords"
  },
  {
    id: "notes-accords",
    number: "04",
    title: "Notes & Accords",
    shortTitle: "Accords",
    cardDescription: "Learn the difference between notes, materials, accords, and fantasy impressions.",
    icon: "assets/academy/icons/lesson-accords.svg",
    openingLine: "A note is what you smell. An accord is what the artisan builds.",
    objective: "By the end of this lesson, you will understand how notes, materials, accords, and olfactive impressions work together in perfume creation.",
    lecture: [
      {
        heading: "What is a note?",
        body: [
          "A note is a scent impression that can be recognized in a fragrance: rose, lemon, tea, coffee, vanilla, musk, moss, or violet.",
          "A note is not always a literal ingredient. Sometimes it is the impression created by several materials working together."
        ]
      },
      {
        heading: "What is a material?",
        body: [
          "A material is what the perfumer uses to build the smell. It can be natural, synthetic, or a prepared base.",
          "For example, a rose note might come from rose absolute, a synthetic rose material, or a blend of materials that creates a rose-like impression.",
          "Materials are the tools. Notes are what the nose recognizes."
        ]
      },
      {
        heading: "What is an accord?",
        body: [
          "An accord is a blend of materials that creates a new, unified idea.",
          "A coffee accord may use roasted, bitter, smoky, chocolate, and warm materials to smell like coffee. A rain accord may use watery, green, mineral, and earthy materials to suggest wet weather.",
          "Inside Indische World, accords can become more imaginative: Bubble Lake, White Foam, Maison Dust, Old Café, or Forest Mist."
        ]
      },
      {
        heading: "Fantasy accords",
        body: [
          "A fantasy accord does not need to exist in nature. It only needs to communicate a believable scent impression.",
          "Bubble Lake Accord is not taken from a real lake. It is an olfactive idea built from clean, airy, watery, soft, and slightly strange materials.",
          "This is where Indische becomes different. The material may be imaginary, but the scent direction must still be clear."
        ]
      }
    ],
    framework: {
      title: "Note → Material → Accord",
      steps: [
        "Note: what the wearer recognizes.",
        "Material: what the perfumer uses.",
        "Accord: a built impression made from several materials.",
        "Fantasy accord: an imaginary scent idea made believable through composition."
      ]
    },
    indischeExample: {
      title: "White Foam Accord",
      description: "A soft clean accord inspired by shower foam, airy bubbles, and gentle skin comfort.",
      details: [
        "Scent impression: clean, airy, soft, shower-like",
        "Possible direction: soft musk, watery freshness, gentle floral transparency, creamy clean texture",
        "Use: clean fragrance, shower scent, airy heart, soft fresh composition"
      ]
    },
    commonMistakes: [
      "Thinking every note must come from one literal ingredient.",
      "Making fantasy accords too abstract without a clear smell direction.",
      "Listing notes without explaining the impression they should create."
    ],
    miniExercise: {
      title: "Invent an Accord",
      prompt: "Create one fantasy accord from your own world. Give it a name, mood, and three scent impressions.",
      exampleAnswer: "Old Window Accord — dusty, cold, wooden; smells like evening air entering an abandoned room."
    },
    checkpoint: [
      {
        question: "What is a note?",
        answer: "A recognizable scent impression in a fragrance."
      },
      {
        question: "What is an accord?",
        answer: "A blend of materials that creates a new unified scent idea."
      },
      {
        question: "Can a fantasy accord exist in perfume storytelling?",
        answer: "Yes, if it communicates a clear scent impression that a perfumer can interpret."
      }
    ],
    keyTerms: ["Note", "Material", "Accord", "Fantasy Accord", "Olfactive Impression"],
    previousLesson: "fragrance-families",
    nextLesson: "building-your-first-scent"
  },
  {
    id: "building-your-first-scent",
    number: "05",
    title: "Building Your First Scent",
    shortTitle: "First Scent",
    cardDescription: "Create your first fragrance idea with story, mood, material, structure, and drydown.",
    icon: "assets/academy/icons/lesson-building.svg",
    openingLine: "A good perfume idea begins with clarity.",
    objective: "By the end of this lesson, you will be able to create a simple scent brief using the framework Story → Mood → World → Materials → Structure → Drydown.",
    lecture: [
      {
        heading: "Do not begin with everything",
        body: [
          "Many beginners start by listing every note they like. This usually makes the concept crowded.",
          "A strong scent idea begins with one clear center. It may be a place, a memory, a weather, a person, a food, or an impossible scene from Indische World.",
          "Once the center is clear, the materials become easier to choose."
        ]
      },
      {
        heading: "Start with story",
        body: [
          "A story gives the perfume direction. It does not have to be long. One sentence is enough.",
          "Example: a small café during afternoon rain. This already tells us temperature, mood, texture, and possible materials.",
          "A good story should suggest what the wearer should feel."
        ]
      },
      {
        heading: "Choose the mood",
        body: [
          "Mood words help the artisan understand the emotional shape of the perfume.",
          "Use words like clean, warm, green, creamy, dusty, cold, elegant, playful, nostalgic, strange, soft, bright, or dark.",
          "Choose two to four mood words. Too many mood words can confuse the direction."
        ]
      },
      {
        heading: "Choose materials with restraint",
        body: [
          "For a first scent concept, choose three to five main materials or accords.",
          "One material can lift the opening. One or two can shape the heart. One or two can hold the base.",
          "The goal is not to make the final formula. The goal is to create a clear brief that can be developed by the artisan."
        ]
      }
    ],
    framework: {
      title: "Story → Mood → World → Materials → Structure → Drydown",
      steps: [
        "Story: what is the scent about?",
        "Mood: what should it feel like?",
        "World: where does it belong in Indische World?",
        "Materials: which notes or accords express it?",
        "Structure: what is top, heart, and base?",
        "Drydown: what memory should remain?"
      ]
    },
    indischeExample: {
      title: "Plum Jam Café During Rain",
      description: "A warm gourmand fragrance inspired by a small café, toasted bread, sticky plum jam, and soft rainy air.",
      brief: {
        story: "A small café during afternoon rain.",
        mood: ["warm", "milky", "nostalgic", "slightly sweet"],
        world: "Plum Jam Café",
        materials: ["Tea Steam", "Plum Jam Accord", "Milk Accord", "Soft Woods", "White Musk"],
        structure: {
          top: ["Tea Steam", "Soft Rain Air"],
          heart: ["Plum Jam Accord", "Milk Accord"],
          base: ["Soft Woods", "White Musk"]
        },
        drydown: "soft woody milk and faint fruit sweetness"
      }
    },
    commonMistakes: [
      "Using too many materials before the story is clear.",
      "Forgetting to mention what you do not want.",
      "Making a scent concept that has many moods fighting each other.",
      "Expecting the simulator output to be the final perfume formula."
    ],
    miniExercise: {
      title: "Five-Line Brief",
      prompt: "Write your first scent idea in five lines: Story, Mood, World, Materials, Drydown.",
      exampleAnswer: "Story: a quiet room after sunset. Mood: powdery, cool, lonely. World: Maison Entonnoir Room. Materials: violet, vanilla, old wood, white musk. Drydown: soft powder and cold wood."
    },
    checkpoint: [
      {
        question: "Why should a beginner limit materials?",
        answer: "To keep the concept clear and easier to develop."
      },
      {
        question: "What should come before choosing materials?",
        answer: "Story and mood."
      },
      {
        question: "Is a scent brief the same as a final formula?",
        answer: "No. A brief is a creative direction that still needs development."
      }
    ],
    keyTerms: ["Brief", "Mood", "Structure", "Drydown", "Balance", "Restraint"],
    previousLesson: "notes-accords",
    nextLesson: "indische-materials"
  },
  {
    id: "indische-materials",
    number: "06",
    title: "Indische Materials",
    shortTitle: "Materials",
    cardDescription: "Explore materials and fantasy accords gathered from Indische World.",
    icon: "assets/academy/icons/lesson-indische.svg",
    openingLine: "The materials of Indische World are fragments of places, memories, and impossible landscapes.",
    objective: "By the end of this lesson, you will understand how Indische Materials work as creative scent directions and how to use them in your bespoke brief.",
    lecture: [
      {
        heading: "Materials from a world of scent",
        body: [
          "The Hall of Artisans keeps both familiar perfume materials and Indische Materials.",
          "Some materials are recognizable: rose, tea, vanilla, musk, sandalwood, moss, vetiver.",
          "Others are born from Indische World: Bubble Lake Accord, White Foam Accord, Forest Mist Accord, Tonka Ice Cream Accord, Plum Jam Accord, Maison Dust Accord, Mooo Milk Accord, and more."
        ]
      },
      {
        heading: "Indische Materials are not random fantasy names",
        body: [
          "Each Indische Material must still communicate a scent direction. It should tell the artisan what kind of smell, texture, mood, and world the creator wants.",
          "For example, White Foam Accord suggests clean, airy, soft, shower-like comfort. Plum Jam Accord suggests sticky fruit, sweetness, tartness, and warmth.",
          "The fantasy name opens the door. The scent description gives the artisan a map."
        ]
      },
      {
        heading: "How to use them",
        body: [
          "Use Indische Materials as emotional anchors in your brief.",
          "Choose one main Indische Material if you want a clear identity. Add supporting materials to balance it.",
          "For example, Tonka Ice Cream Accord can become too sweet if used without balance. It may need woods, musk, tea, almond, or soft spice to become wearable."
        ]
      }
    ],
    materialGuide: [
      {
        name: "Bubble Lake Accord",
        family: "Clean / Aquatic / Airy",
        mood: ["transparent", "watery", "soft", "strange"],
        smellsLike: "A lake filled with delicate bubbles, clean air, and a light watery shimmer.",
        worldLocation: "Bubble Forest Lake",
        bestUsedFor: "fresh openings, watery fantasy effects, transparent clean compositions",
        pairsWellWith: ["White Foam", "Forest Mist", "Violet Leaf", "White Musk"]
      },
      {
        name: "White Foam Accord",
        family: "Clean / Soft Aquatic",
        mood: ["fresh", "airy", "comforting", "shower-like"],
        smellsLike: "Soft white foam floating above warm skin after a clean shower.",
        worldLocation: "Forest Shower Lake",
        bestUsedFor: "clean scents, shower scents, airy hearts, soft fresh compositions",
        pairsWellWith: ["Violet Leaf", "White Musk", "Forest Mist", "Moss"]
      },
      {
        name: "Forest Mist Accord",
        family: "Green / Misty / Atmospheric",
        mood: ["cool", "green", "humid", "quiet"],
        smellsLike: "Moist forest air moving between leaves, moss, and cold branches.",
        worldLocation: "Forest Shower Lake",
        bestUsedFor: "green atmospheric scents, forest concepts, fresh drydowns",
        pairsWellWith: ["Green Leaves", "Moss", "Vetiver", "White Foam"]
      },
      {
        name: "Tonka Ice Cream Accord",
        family: "Gourmand / Creamy / Nutty",
        mood: ["soft", "sweet", "milky", "nostalgic"],
        smellsLike: "Creamy tonka, vanilla milk, almond warmth, and melting ice cream softness.",
        worldLocation: "Tonka Ice Cream Café",
        bestUsedFor: "soft gourmand hearts, creamy drydowns, nostalgic dessert perfumes",
        pairsWellWith: ["Vanilla", "Soft Woods", "White Musk", "Almond", "Caramel"]
      },
      {
        name: "Plum Jam Accord",
        family: "Fruity / Gourmand",
        mood: ["sticky", "warm", "tart", "comforting"],
        smellsLike: "Fresh plum jam spread over warm bread, sweet but slightly sour.",
        worldLocation: "Plum Jam Café",
        bestUsedFor: "fruity gourmand concepts, café scents, nostalgic sweetness",
        pairsWellWith: ["Tea", "Milk Accord", "Soft Woods", "Almond", "Vanilla"]
      },
      {
        name: "Maison Dust Accord",
        family: "Powdery / Woody / Old Room",
        mood: ["quiet", "dusty", "elegant", "mysterious"],
        smellsLike: "An old room with powder, paper, wood, violet, and a trace of time.",
        worldLocation: "Maison Entonnoir Room",
        bestUsedFor: "powdery concepts, old-world stories, quiet floral-woody perfumes",
        pairsWellWith: ["Violet", "Orris", "Vanilla", "White Musk", "Old Wood"]
      }
    ],
    indischeExample: {
      title: "Maison Entonnoir Room",
      description: "A powdery, quiet, old-world scent direction using Maison Dust Accord, violet, vanilla, old wood, and white musk.",
      details: [
        "Main Indische Material: Maison Dust Accord",
        "Supporting mood: quiet, powdery, cool, elegant",
        "Wearable balance: white musk and soft vanilla"
      ]
    },
    commonMistakes: [
      "Choosing an Indische Material only because the name sounds beautiful, without understanding its scent direction.",
      "Using too many fantasy accords in one brief.",
      "Forgetting to balance strange materials with wearable materials."
    ],
    miniExercise: {
      title: "Choose Your Indische Material",
      prompt: "Choose one Indische Material and write where it belongs, what it smells like, and what mood it should create.",
      exampleAnswer: "Forest Mist Accord belongs to Forest Shower Lake. It smells like cool green air, moss, and wet leaves. It should create a quiet clean forest mood."
    },
    checkpoint: [
      {
        question: "Are Indische Materials always literal natural ingredients?",
        answer: "No. Some are fantasy accords or scent directions inspired by Indische World."
      },
      {
        question: "Why does a fantasy accord still need description?",
        answer: "So the artisan can understand the intended smell, mood, and texture."
      },
      {
        question: "What should you do if an Indische Material feels too strange?",
        answer: "Balance it with wearable materials such as musk, woods, florals, tea, or vanilla."
      }
    ],
    keyTerms: ["Indische Material", "Fantasy Accord", "Scent Direction", "World Location", "Wearability"],
    previousLesson: "building-your-first-scent",
    nextAction: "make-your-perfume"
  }
],
  glossary: [
  {
    term: "Fragrance Brief",
    definition: "A written direction that explains the story, mood, notes, materials, and desired feeling of a perfume idea."
  },
  {
    term: "Drydown",
    definition: "The later stage of a perfume, when lighter notes fade and the lasting base becomes more noticeable."
  },
  {
    term: "Accord",
    definition: "A blend of materials that creates a new unified scent impression."
  },
  {
    term: "Olfactive Impression",
    definition: "The smell image or feeling created by a material, note, accord, or finished fragrance."
  },
  {
    term: "Projection",
    definition: "How far a perfume radiates from the skin."
  },
  {
    term: "Sillage",
    definition: "The scent trail a perfume leaves behind as the wearer moves."
  },
  {
    term: "Longevity",
    definition: "How long a perfume remains noticeable after application."
  }
]
};
