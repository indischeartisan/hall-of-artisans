import type { WorkflowStatus } from "../../domain/workflow";

export type CustomerJourneyStage = "brief" | "review" | "consultation" | "crafting" | "delivery";

export interface CustomerJourneyStageConfig {
  key: CustomerJourneyStage;
  label: string;
  compactLabel: string;
}

export const CUSTOMER_JOURNEY_STAGES: readonly CustomerJourneyStageConfig[] = [
  { key: "brief", label: "Brief", compactLabel: "Brief" },
  { key: "review", label: "Review", compactLabel: "Review" },
  { key: "consultation", label: "Consultation", compactLabel: "Consultation" },
  { key: "crafting", label: "Crafting", compactLabel: "Craft" },
  { key: "delivery", label: "Delivery", compactLabel: "Delivery" }
] as const;

/**
 * Customer-facing projection of the existing workflow.
 *
 * Cancelled projects intentionally have no active journey stage. Cancellation
 * can happen at several points, so assigning it to a fixed stage would make a
 * preserved project record misleading.
 */
export const CUSTOMER_JOURNEY_STAGE_BY_STATUS: Record<WorkflowStatus, CustomerJourneyStage | null> = {
  DRAFT_PREVIEW: "brief",
  SUBMITTED: "brief",
  UNDER_REVIEW: "review",
  CONSULTATION: "consultation",
  READY_FOR_APPROVAL: "consultation",
  REVISION_REQUESTED: "consultation",
  READY_FOR_PAYMENT: "consultation",
  PAYMENT_PENDING: "consultation",
  PAID: "crafting",
  IN_PRODUCTION: "crafting",
  SHIPPED: "delivery",
  COMPLETED: "delivery",
  CANCELLED: null
};

export const getCustomerJourneyStage = (status: WorkflowStatus) => CUSTOMER_JOURNEY_STAGE_BY_STATUS[status];

export const getCustomerJourneyStageIndex = (status: WorkflowStatus) => {
  const stage = getCustomerJourneyStage(status);
  return stage === null ? -1 : CUSTOMER_JOURNEY_STAGES.findIndex((item) => item.key === stage);
};
