type TextRun = { text: string; emphasis?: boolean };
type RichSection =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; runs: TextRun[] }
  | { type: "bullet_list" | "numbered_list"; items: string[] };

export type AcademyBlockContent =
  | { type: "rich_text"; sections: RichSection[] }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "diagram"; title: string; stages: Array<{ label: string; time: string; description: string }> }
  | { type: "quote"; quote: string; attribution?: string }
  | { type: "perfumer_note"; title: string; note: string }
  | { type: "exercise"; title: string; instructions: string[] }
  | { type: "summary"; title: string; points: string[] }
  | { type: "divider" };

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

function richSections(value: unknown): value is RichSection[] {
  if (!Array.isArray(value)) return false;
  return value.every((section) => {
    if (!record(section) || !text(section.type)) return false;
    if (section.type === "heading") return (section.level === 2 || section.level === 3) && text(section.text);
    if (section.type === "paragraph") return Array.isArray(section.runs) && section.runs.every((run) => record(run) && text(run.text) && (run.emphasis === undefined || typeof run.emphasis === "boolean"));
    return (section.type === "bullet_list" || section.type === "numbered_list") && strings(section.items);
  });
}

export function parseAcademyBlockContent(blockType: string, value: unknown): AcademyBlockContent | null {
  if (!record(value) || "html" in value || "raw_html" in value) return null;
  switch (blockType) {
    case "rich_text": return richSections(value.sections) ? { type: blockType, sections: value.sections } : null;
    case "image": return text(value.src) && text(value.alt) ? { type: blockType, src: value.src, alt: value.alt, ...(text(value.caption) ? { caption: value.caption } : {}) } : null;
    case "diagram": return text(value.title) && Array.isArray(value.stages) && value.stages.every((stage) => record(stage) && text(stage.label) && text(stage.time) && text(stage.description)) ? { type: blockType, title: value.title, stages: value.stages as Array<{ label: string; time: string; description: string }> } : null;
    case "quote": return text(value.quote) ? { type: blockType, quote: value.quote, ...(text(value.attribution) ? { attribution: value.attribution } : {}) } : null;
    case "perfumer_note": return text(value.title) && text(value.note) ? { type: blockType, title: value.title, note: value.note } : null;
    case "exercise": return text(value.title) && strings(value.instructions) ? { type: blockType, title: value.title, instructions: value.instructions } : null;
    case "summary": return text(value.title) && strings(value.points) ? { type: blockType, title: value.title, points: value.points } : null;
    case "divider": return { type: blockType };
    default: return null;
  }
}
