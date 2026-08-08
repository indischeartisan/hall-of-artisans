type TextRun = { text: string; emphasis?: boolean };
export type RichSection =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; runs: TextRun[] }
  | { type: "quote"; runs: TextRun[] }
  | { type: "bullet_list" | "numbered_list"; items: string[] };
type TitledBody = { title: string; body: string };
type Misconception = { claim: string; correction: string };

export type AcademyBlockContent =
  | { type: "rich_text"; sections?: RichSection[]; heading?: string; paragraphs?: string[]; subheading?: string; exampleParagraphs?: string[]; misconception?: Misconception; items?: TitledBody[]; closing?: string; nextLesson?: { title: string; question: string } }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "diagram"; title: string; layout: "process" | "radial" | "cycle"; stages?: Array<{ label: string; time: string; description: string }>; steps?: string[]; center?: string; nodes?: string[] }
  | { type: "quote"; quote: string; attribution?: string }
  | { type: "perfumer_note"; title: string; note?: string; sections?: RichSection[] }
  | { type: "exercise"; title: string; sections?: RichSection[]; instructions?: string[]; purpose?: string; materials?: string[]; steps?: TitledBody[]; closing?: string }
  | { type: "journal_prompt"; title: string; sections?: RichSection[]; prompts?: string[]; note?: string }
  | { type: "summary"; title: string; sections?: RichSection[]; points?: string[]; items?: TitledBody[] }
  | { type: "divider" };

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const titledBodies = (value: unknown): value is TitledBody[] => Array.isArray(value) && value.every((item) => record(item) && text(item.title) && text(item.body));

function richSections(value: unknown): value is RichSection[] {
  if (!Array.isArray(value)) return false;
  return value.every((section) => {
    if (!record(section) || !text(section.type)) return false;
    if (section.type === "heading") return (section.level === 2 || section.level === 3 || section.level === 4) && text(section.text);
    if (section.type === "paragraph") return Array.isArray(section.runs) && section.runs.every((run) => record(run) && text(run.text) && (run.emphasis === undefined || typeof run.emphasis === "boolean"));
    if (section.type === "quote") return Array.isArray(section.runs) && section.runs.every((run) => record(run) && text(run.text) && (run.emphasis === undefined || typeof run.emphasis === "boolean"));
    return (section.type === "bullet_list" || section.type === "numbered_list") && strings(section.items);
  });
}

function misconception(value: unknown): value is Misconception {
  return record(value) && text(value.claim) && text(value.correction);
}

export function parseAcademyBlockContent(blockType: string, value: unknown, settings: unknown = {}): AcademyBlockContent | null {
  if (!record(value) || "html" in value || "raw_html" in value) return null;
  const config = record(settings) ? settings : {};
  switch (blockType) {
    case "rich_text": {
      if (richSections(value.sections)) return { type: blockType, sections: value.sections, ...(text(value.heading) ? { heading: value.heading } : {}) };
      if (!text(value.heading)) return null;
      if (value.paragraphs !== undefined && !strings(value.paragraphs)) return null;
      if (value.exampleParagraphs !== undefined && !strings(value.exampleParagraphs)) return null;
      if (value.items !== undefined && !titledBodies(value.items)) return null;
      if (value.misconception !== undefined && !misconception(value.misconception)) return null;
      if (value.nextLesson !== undefined && !(record(value.nextLesson) && text(value.nextLesson.title) && text(value.nextLesson.question))) return null;
      return { type: blockType, heading: value.heading, ...(strings(value.paragraphs) ? { paragraphs: value.paragraphs } : {}), ...(text(value.subheading) ? { subheading: value.subheading } : {}), ...(strings(value.exampleParagraphs) ? { exampleParagraphs: value.exampleParagraphs } : {}), ...(misconception(value.misconception) ? { misconception: value.misconception } : {}), ...(titledBodies(value.items) ? { items: value.items } : {}), ...(text(value.closing) ? { closing: value.closing } : {}), ...(record(value.nextLesson) && text(value.nextLesson.title) && text(value.nextLesson.question) ? { nextLesson: value.nextLesson as { title: string; question: string } } : {}) };
    }
    case "image": return text(value.src) && text(value.alt) ? { type: blockType, src: value.src, alt: value.alt, ...(text(value.caption) ? { caption: value.caption } : {}) } : null;
    case "diagram": {
      if (!text(value.title)) return null;
      if (Array.isArray(value.stages) && value.stages.every((stage) => record(stage) && text(stage.label) && text(stage.time) && text(stage.description))) return { type: blockType, title: value.title, layout: "process", stages: value.stages as Array<{ label: string; time: string; description: string }> };
      const layout = config.layout;
      if ((layout === "process" || layout === "cycle") && strings(value.steps)) return { type: blockType, title: value.title, layout, steps: value.steps };
      if (layout === "radial" && text(value.center) && strings(value.nodes)) return { type: blockType, title: value.title, layout, center: value.center, nodes: value.nodes };
      return null;
    }
    case "quote": return text(value.quote) ? { type: blockType, quote: value.quote, ...(text(value.attribution) ? { attribution: value.attribution } : {}) } : null;
    case "perfumer_note": return text(value.title) && (richSections(value.sections) || text(value.note) || text(value.body)) ? { type: blockType, title: value.title, ...(richSections(value.sections) ? { sections: value.sections } : {}), ...(text(value.note) ? { note: value.note } : text(value.body) ? { note: value.body } : {}) } : null;
    case "exercise": {
      if (!text(value.title)) return null;
      if (richSections(value.sections)) return { type: blockType, title: value.title, sections: value.sections };
      if (strings(value.instructions)) return { type: blockType, title: value.title, instructions: value.instructions };
      return text(value.purpose) && strings(value.materials) && titledBodies(value.steps) && text(value.closing) ? { type: blockType, title: value.title, purpose: value.purpose, materials: value.materials, steps: value.steps, closing: value.closing } : null;
    }
    case "journal_prompt": return text(value.title) && (richSections(value.sections) || (strings(value.prompts) && text(value.note))) ? { type: blockType, title: value.title, ...(richSections(value.sections) ? { sections: value.sections } : {}), ...(strings(value.prompts) ? { prompts: value.prompts } : {}), ...(text(value.note) ? { note: value.note } : {}) } : null;
    case "summary": return text(value.title) && (richSections(value.sections) || strings(value.points) || titledBodies(value.items)) ? { type: blockType, title: value.title, ...(richSections(value.sections) ? { sections: value.sections } : {}), ...(strings(value.points) ? { points: value.points } : {}), ...(titledBodies(value.items) ? { items: value.items } : {}) } : null;
    case "divider": return { type: blockType };
    default: return null;
  }
}

export function getAcademyBlockContentsLabel(blockType: string, value: unknown, settings: unknown = {}): string | null {
  const content = parseAcademyBlockContent(blockType, value, settings);
  if (!content || content.type === "image" || content.type === "quote" || content.type === "divider") return null;
  const label = content.type === "rich_text" ? content.heading : content.title;
  return label?.replace(/^\s*\d+\.\s*/, "").trim() || null;
}
