export const DRAFT_SCHEMA_VERSION = 1;

export type DraftStatus = "draft" | "ready";
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

export type NewDraftData = Omit<PerfumeDraft, "id" | "schemaVersion" | "createdAt" | "updatedAt">;
