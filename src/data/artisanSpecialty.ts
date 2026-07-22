export const artisanSpecialtyGroups = [
  { id: "direction", label: "Scent Direction", options: ["Fresh", "Clean", "Green", "Floral", "Gourmand", "Woody", "Powdery", "Dark", "Experimental"] },
  { id: "mood", label: "Scent Mood", options: ["Bright", "Misty", "Warm", "Cold", "Nostalgic", "Elegant", "Mysterious", "Playful"] },
  { id: "style", label: "Artisan Style", options: ["Storyteller", "Explorer", "Collector", "Archivist", "Dreamer", "Composer", "Experimentalist", "Observer"] }
] as const;

export type ArtisanSpecialty = {
  direction: (typeof artisanSpecialtyGroups)[0]["options"][number];
  mood: (typeof artisanSpecialtyGroups)[1]["options"][number];
  style: (typeof artisanSpecialtyGroups)[2]["options"][number];
};

export const defaultArtisanSpecialty: ArtisanSpecialty = { direction: "Fresh", mood: "Bright", style: "Storyteller" };

export const formatArtisanSpecialty = ({ mood, direction, style }: ArtisanSpecialty) => `${mood} ${direction} ${style}`;

export function parseArtisanSpecialty(value?: string): ArtisanSpecialty {
  const words = new Set((value ?? "").split(/\s+/));
  const direction = artisanSpecialtyGroups[0].options.find(option => words.has(option)) ?? defaultArtisanSpecialty.direction;
  const mood = artisanSpecialtyGroups[1].options.find(option => words.has(option)) ?? defaultArtisanSpecialty.mood;
  const style = artisanSpecialtyGroups[2].options.find(option => words.has(option)) ?? defaultArtisanSpecialty.style;
  return { direction, mood, style };
}
