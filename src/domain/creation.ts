import type { FragranceBrief, FormulaLayer, FormulaMetadata, PerfumeDraft, StoryCardData } from "../types/perfumeDraft";

export type CreationMode = "artisan_bench" | "described";
export const SUBMISSION_SNAPSHOT_SCHEMA_VERSION = 1;

export interface FormulaMaterialSnapshot { materialId: string; materialName: string; layer: FormulaLayer | null; percentage: number }
export interface CreationSubmissionSnapshot {
  schemaVersion: number; snapshotId: string; sourceDraftId: string | null; creationMode: CreationMode;
  title: string; perfumeName: string; concentration: string;
  formulaMaterials: FormulaMaterialSnapshot[]; formulaMetadata: FormulaMetadata | null;
  fragranceBrief: FragranceBrief | null; storyCardData: StoryCardData | null;
  writtenStory: string; preferredNotes: string[]; notesToAvoid: string[]; moodOrDirection: string[];
  additionalNotes: string; createdAt: string;
}

export interface DescribedCreationInput { creationTitle: string; story: string; preferredNotes: string[]; notesToAvoid: string[]; additionalNotes: string }
const makeId = () => `snapshot-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const clone = <T,>(value:T):T => JSON.parse(JSON.stringify(value)) as T;

export function createDescribedCreationSnapshot(input: DescribedCreationInput, createdAt = new Date().toISOString(), sourceDraftId: string | null = null): CreationSubmissionSnapshot {
  return clone({schemaVersion:SUBMISSION_SNAPSHOT_SCHEMA_VERSION,snapshotId:makeId(),sourceDraftId,creationMode:"described",title:input.creationTitle.trim(),perfumeName:input.creationTitle.trim(),concentration:"To be interpreted",formulaMaterials:[],formulaMetadata:null,fragranceBrief:null,storyCardData:null,writtenStory:input.story.trim(),preferredNotes:[...input.preferredNotes],notesToAvoid:[...input.notesToAvoid],moodOrDirection:[...input.preferredNotes],additionalNotes:input.additionalNotes.trim(),createdAt});
}

export function createArtisanBenchSubmissionSnapshot(draft: PerfumeDraft, materialNames: Record<string,string> = {}, createdAt = new Date().toISOString()): CreationSubmissionSnapshot {
  const state=draft.benchState;
  return clone({schemaVersion:SUBMISSION_SNAPSHOT_SCHEMA_VERSION,snapshotId:makeId(),sourceDraftId:draft.id,creationMode:"artisan_bench",title:draft.draftName,perfumeName:state.perfumeName||draft.perfumeName||draft.draftName,concentration:state.concentration,formulaMaterials:state.formula.map(item=>({materialId:item.id,materialName:materialNames[item.id]??item.id,layer:item.layer??null,percentage:item.percent})),formulaMetadata:state.formulaMetadata,fragranceBrief:state.fragranceBrief,storyCardData:state.storyCard,writtenStory:state.fragranceBrief?.concept??"",preferredNotes:[],notesToAvoid:[],moodOrDirection:state.storyCard?.directionTags??[],additionalNotes:"",createdAt});
}

export const cloneSubmissionSnapshot = (snapshot: CreationSubmissionSnapshot) => clone(snapshot);

