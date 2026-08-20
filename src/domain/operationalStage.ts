import type { WorkflowStatus } from "./workflow";

export type OperationalStage = "brief" | "review" | "consultation" | "payment" | "crafting" | "delivery";

export interface OperationalStageConfig {
  key: OperationalStage;
  label: string;
  statuses: readonly WorkflowStatus[];
}

export const OPERATIONAL_STAGES: readonly OperationalStageConfig[] = [
  { key: "brief", label: "Brief", statuses: ["DRAFT_PREVIEW", "SUBMITTED"] },
  { key: "review", label: "Review", statuses: ["UNDER_REVIEW"] },
  { key: "consultation", label: "Consultation", statuses: ["CONSULTATION", "READY_FOR_APPROVAL", "REVISION_REQUESTED"] },
  { key: "payment", label: "Payment", statuses: ["READY_FOR_PAYMENT", "PAYMENT_PENDING"] },
  { key: "crafting", label: "Crafting", statuses: ["PAID", "IN_PRODUCTION"] },
  { key: "delivery", label: "Delivery", statuses: ["SHIPPED", "COMPLETED"] }
] as const;

export const OPERATIONAL_STAGE_BY_KEY = Object.fromEntries(
  OPERATIONAL_STAGES.map(stage => [stage.key, stage])
) as Record<OperationalStage, OperationalStageConfig>;

export const getOperationalStage = (status: WorkflowStatus) =>
  OPERATIONAL_STAGES.find(stage => stage.statuses.includes(status)) ?? null;

export const isOperationalStageStatus = (stage: OperationalStage, status: WorkflowStatus) =>
  OPERATIONAL_STAGE_BY_KEY[stage].statuses.includes(status);
