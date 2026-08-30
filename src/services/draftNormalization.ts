import type {
  ArtisanBenchDraftState,
  ArtisanBenchState,
  PerfumeDraft
} from "../types/perfumeDraft";

export type NormalizedArtisanDraftContent = Pick<
  PerfumeDraft,
  "formula" | "formulaMetadata" | "fragranceBrief" | "storyCard" | "benchState"
>;

export function normalizeArtisanDraftContent(value: unknown): NormalizedArtisanDraftContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const legacyBenchState = source.benchState as Partial<ArtisanBenchState> | undefined;
  if (!legacyBenchState || typeof legacyBenchState !== "object") return null;

  const formula = (source.formula ?? legacyBenchState.formula) as PerfumeDraft["formula"] | undefined;
  const formulaMetadata = (source.formulaMetadata ?? legacyBenchState.formulaMetadata) as PerfumeDraft["formulaMetadata"] | undefined;
  if (!Array.isArray(formula) || !formulaMetadata) return null;

  const { formula: _legacyFormula, formulaMetadata: _legacyMetadata, fragranceBrief: legacyBrief,
    storyCard: legacyStoryCard, ...uniqueBenchState } = legacyBenchState;
  const fragranceBrief = ("fragranceBrief" in source ? source.fragranceBrief : legacyBrief) as PerfumeDraft["fragranceBrief"] | null | undefined;
  const storyCard = ("storyCard" in source ? source.storyCard : legacyStoryCard) as PerfumeDraft["storyCard"] | null | undefined;

  return {
    formula,
    formulaMetadata,
    fragranceBrief: fragranceBrief ?? undefined,
    storyCard: storyCard ?? undefined,
    benchState: uniqueBenchState as ArtisanBenchDraftState
  };
}
