export type ArchiveRecord = {
  archiveNumber: string;
  title: string;
  creator: string;
  mood: string[];
  story: string;
  image: string;
  status: "Archived";
};

/** Public archive development fixtures. Production starts with no synthetic archive rows. */
export const archiveRecords: ArchiveRecord[] = import.meta.env.DEV ? [
  { archiveNumber: "HOA-0127", title: "Forest Shower", creator: "Farras Agung", mood: ["Green", "Rainwashed"], story: "A quiet forest after rainfall, where wet leaves, cool air, and softened earth hold the morning still.", image: "/assets/archive/forest-shower.png", status: "Archived" },
  { archiveNumber: "HOA-0128", title: "Violet Library", creator: "Anya", mood: ["Violet", "Literary"], story: "Pressed violets resting between old pages, warmed by polished wood and the hush of a private library.", image: "/assets/archive/violet-library.png", status: "Archived" },
  { archiveNumber: "HOA-0129", title: "Tonka Rain", creator: "Raka", mood: ["Amber", "Misty"], story: "Soft rain over tonka and dark timber, lingering like a familiar coat carried home at dusk.", image: "/assets/archive/tonka-rain.png", status: "Archived" },
  { archiveNumber: "HOA-0130", title: "Sunlit Remember", creator: "Livia Natassa", mood: ["Radiant", "Nostalgic"], story: "A golden recollection of sunlit rooms, pale flowers, and a summer afternoon preserved in glass.", image: "/assets/archive/sunlit-remember.png", status: "Archived" },
  { archiveNumber: "HOA-0131", title: "Amber Letter", creator: "Noah Letterwell", mood: ["Amber", "Intimate"], story: "An unopened letter beside amber resin and warm paper, carrying words that time could not erase.", image: "/assets/archive/amber-letter.png", status: "Archived" },
  { archiveNumber: "HOA-0132", title: "White Fig", creator: "Celine Blanc", mood: ["Clean", "Botanical"], story: "Milky fig, pale woods, and sun-warmed leaves composed with the clarity of an ivory morning.", image: "/assets/archive/white-fig.png", status: "Archived" },
  { archiveNumber: "HOA-0133", title: "Plum Jam Room", creator: "Milo Berry", mood: ["Gourmand", "Velvet"], story: "Dark plum preserves, old velvet, and the glow of a room prepared for an indulgent winter gathering.", image: "/assets/archive/plum-jam-room.png", status: "Archived" },
  { archiveNumber: "HOA-0134", title: "Misty Foam", creator: "Elara Frost", mood: ["Aquatic", "Ethereal"], story: "Sea mist dissolving into airy foam, cool minerals, and the distant shimmer of a quiet shore.", image: "/assets/archive/misty-foam.png", status: "Archived" },
  { archiveNumber: "HOA-0135", title: "Sandal Script", creator: "Devan Singh", mood: ["Woody", "Contemplative"], story: "Sandalwood and ink traced across handmade paper, calm as a thought written before sunrise.", image: "/assets/archive/sandal-script.png", status: "Archived" },
  { archiveNumber: "HOA-0136", title: "Night Scholar", creator: "Alistair Moore", mood: ["Nocturnal", "Mysterious"], story: "Midnight study rooms, blue-black ink, and resinous woods beneath a sky crowded with stars.", image: "/assets/archive/night-scholar.png", status: "Archived" },
  { archiveNumber: "HOA-0137", title: "Rose Discourse", creator: "Isabelle Rose", mood: ["Floral", "Poetic"], story: "A conversation in rose petals—measured, luminous, and softened by powdery woods and afternoon light.", image: "/assets/archive/rose-discourse.png", status: "Archived" },
  { archiveNumber: "HOA-0138", title: "Golden Silence", creator: "Marcus Levy", mood: ["Golden", "Serene"], story: "A still composition of pale amber, quiet woods, and warm light suspended at the end of day.", image: "/assets/archive/golden-silence.png", status: "Archived" }
] : [];
