export const DRAFT_SCHEMA_VERSION = 1;

export type DraftStatus = "draft" | "ready";
export type DraftMode = "artisan_bench" | "described";
export type FormulaLayer = "top" | "heart" | "base";

export interface FormulaItem {
  id: string;
  layer?: FormulaLayer;
  percent: number;
}

export interface ScentProfile {
  freshness: number;
  sweetness: number;
  warmth: number;
  green: number;
  floral: number;
  woody: number;
  powdery: number;
  clean: number;
  darkness: number;
  strangeness: number;
  intensity: number;
  longevity: number;
}

export interface FormulaMetadata {
  concentration: string;
  total: number;
  layerTotals: Record<FormulaLayer, number>;
  profile: ScentProfile;
  warnings: string[];
  positives: string[];
}

export interface FragranceBrief {
  perfumeName: string;
  concentration: string;
  olfactiveFamily: string;
  concept: string;
  notes: Record<FormulaLayer, string[]>;
  drydown: Array<{ time: string; label: string; text: string }>;
  profile: ScentProfile;
  internalBrief: string;
}

export interface StoryCardData {
  isEmpty: boolean;
  concentration: string;
  perfumeName: string;
  conceptLine: string;
  description: string;
  directionTags: string[];
  profile: ScentProfile;
  notes: Record<FormulaLayer, string[]>;
  identity: {
    hasPerfumerId: boolean;
    creatorName?: string;
    artisanId?: string;
    archiveNo?: string;
  };
}

export interface ArtisanBenchState {
  concentration: string;
  perfumeName: string;
  nameEdited: boolean;
  suggestedNames: string[];
  formula: FormulaItem[];
  formulaMetadata: FormulaMetadata;
  fragranceBrief: FragranceBrief | null;
  storyCard: StoryCardData | null;
}

export interface PerfumeDraft {
  id: string;
  schemaVersion: number;
  mode: "artisan_bench";
  draftName: string;
  perfumeName?: string;
  formula: FormulaItem[];
  formulaMetadata: FormulaMetadata;
  fragranceBrief?: FragranceBrief;
  storyCard?: StoryCardData;
  benchState: ArtisanBenchState;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DescribedCreationLetter {
  creationTitle: string;
  story: string;
  preferredNotes: string[];
  notesToAvoid: string[];
  additionalNotes: string;
}

export interface DescribedCreationDraft {
  id: string;
  schemaVersion: number;
  mode: "described";
  draftName: string;
  perfumeName?: string;
  letter: DescribedCreationLetter;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreationDraft = PerfumeDraft | DescribedCreationDraft;
export type NewDraftData = Omit<PerfumeDraft, "id" | "schemaVersion" | "mode" | "createdAt" | "updatedAt">;
export type NewDescribedDraftData = Omit<DescribedCreationDraft, "id" | "schemaVersion" | "mode" | "createdAt" | "updatedAt">;

export const isArtisanBenchDraft = (draft: CreationDraft | null | undefined): draft is PerfumeDraft => draft?.mode === "artisan_bench";
export const isDescribedCreationDraft = (draft: CreationDraft | null | undefined): draft is DescribedCreationDraft => draft?.mode === "described";
