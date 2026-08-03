import type { AcademyLocale } from "./academyLocale";

export type LocalizedText = { en: string } & Partial<Record<Exclude<AcademyLocale, "en">, string>>;
export type LessonBlockType =
  | "rich_text" | "image" | "diagram" | "quote" | "perfumer_note" | "exercise"
  | "journal_prompt" | "knowledge_check" | "summary" | "download" | "divider";

type LessonBlockBase<T extends LessonBlockType> = { id: string; type: T };
export type RichTextBlock = LessonBlockBase<"rich_text"> & { paragraphs: LocalizedText[] };
export type ImageBlock = LessonBlockBase<"image"> & { src: string; alt: LocalizedText; caption?: LocalizedText };
export type DiagramBlock = LessonBlockBase<"diagram"> & { title: LocalizedText; description: LocalizedText; assetKey: string };
export type QuoteBlock = LessonBlockBase<"quote"> & { quote: LocalizedText; attribution?: LocalizedText };
export type PerfumerNoteBlock = LessonBlockBase<"perfumer_note"> & { title: LocalizedText; note: LocalizedText };
export type ExerciseBlock = LessonBlockBase<"exercise"> & { title: LocalizedText; instructions: LocalizedText; estimatedMinutes?: number };
export type JournalPromptBlock = LessonBlockBase<"journal_prompt"> & { prompt: LocalizedText; guidance?: LocalizedText };
export type KnowledgeCheckBlock = LessonBlockBase<"knowledge_check"> & { question: LocalizedText; options: Array<{ id: string; label: LocalizedText }>; correctOptionId: string; explanation: LocalizedText };
export type SummaryBlock = LessonBlockBase<"summary"> & { title: LocalizedText; points: LocalizedText[] };
export type DownloadBlock = LessonBlockBase<"download"> & { label: LocalizedText; resourceKey: string; fileType?: string };
export type DividerBlock = LessonBlockBase<"divider"> & { label?: LocalizedText };

export type LessonBlock = RichTextBlock | ImageBlock | DiagramBlock | QuoteBlock | PerfumerNoteBlock
  | ExerciseBlock | JournalPromptBlock | KnowledgeCheckBlock | SummaryBlock | DownloadBlock | DividerBlock;

const lessonBlockTypes = new Set<LessonBlockType>([
  "rich_text", "image", "diagram", "quote", "perfumer_note", "exercise",
  "journal_prompt", "knowledge_check", "summary", "download", "divider"
]);

const isLocalizedText = (value: unknown): value is LocalizedText => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return typeof (value as Record<string, unknown>).en === "string";
};
const isLocalizedTextArray = (value: unknown): value is LocalizedText[] => Array.isArray(value) && value.every(isLocalizedText);

export function isKnownLessonBlock(value: unknown): value is LessonBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !candidate.id.trim() || typeof candidate.type !== "string"
    || !lessonBlockTypes.has(candidate.type as LessonBlockType)) return false;

  switch (candidate.type as LessonBlockType) {
    case "rich_text": return isLocalizedTextArray(candidate.paragraphs);
    case "image": return typeof candidate.src === "string" && isLocalizedText(candidate.alt)
      && (candidate.caption === undefined || isLocalizedText(candidate.caption));
    case "diagram": return isLocalizedText(candidate.title) && isLocalizedText(candidate.description) && typeof candidate.assetKey === "string";
    case "quote": return isLocalizedText(candidate.quote) && (candidate.attribution === undefined || isLocalizedText(candidate.attribution));
    case "perfumer_note": return isLocalizedText(candidate.title) && isLocalizedText(candidate.note);
    case "exercise": return isLocalizedText(candidate.title) && isLocalizedText(candidate.instructions)
      && (candidate.estimatedMinutes === undefined || typeof candidate.estimatedMinutes === "number");
    case "journal_prompt": return isLocalizedText(candidate.prompt) && (candidate.guidance === undefined || isLocalizedText(candidate.guidance));
    case "knowledge_check": {
      const options = candidate.options;
      return isLocalizedText(candidate.question) && Array.isArray(options)
        && options.every((option) => Boolean(option) && typeof option === "object"
          && typeof (option as Record<string, unknown>).id === "string"
          && isLocalizedText((option as Record<string, unknown>).label))
        && typeof candidate.correctOptionId === "string" && isLocalizedText(candidate.explanation);
    }
    case "summary": return isLocalizedText(candidate.title) && isLocalizedTextArray(candidate.points);
    case "download": return isLocalizedText(candidate.label) && typeof candidate.resourceKey === "string"
      && (candidate.fileType === undefined || typeof candidate.fileType === "string");
    case "divider": return candidate.label === undefined || isLocalizedText(candidate.label);
  }
  return false;
}

export function isUnknownLessonBlock(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.type === "string"
    && !lessonBlockTypes.has(candidate.type as LessonBlockType);
}
