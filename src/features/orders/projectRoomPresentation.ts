import type { ReviewRequestStatus } from "./types";

export type SimplifiedProjectStatus = Extract<
  ReviewRequestStatus,
  "UNDER_REVIEW" | "CONSULTATION" | "PAID" | "IN_PRODUCTION" | "SHIPPED" | "COMPLETED"
>;

export type ProjectRoomAction = "conversation" | "order-details" | "create-another";

export interface ProjectRoomPresentation {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: ProjectRoomAction | null;
  primaryLabel: string | null;
}

export const SIMPLIFIED_PROJECT_STATUSES: readonly SimplifiedProjectStatus[] = [
  "UNDER_REVIEW", "CONSULTATION", "PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED"
];

export const PROJECT_ROOM_PRESENTATION: Record<SimplifiedProjectStatus, ProjectRoomPresentation> = {
  UNDER_REVIEW: {
    eyebrow: "What's Happening Now",
    title: "Your creation is being reviewed.",
    description: "An artisan is studying your brief and creative direction. You don't need to do anything yet.",
    primaryAction: null,
    primaryLabel: null
  },
  CONSULTATION: {
    eyebrow: "What's Happening Now",
    title: "Your artisan would like to discuss your creation.",
    description: "Continue the private conversation so the fragrance direction can be refined before moving forward.",
    primaryAction: "conversation",
    primaryLabel: "Open Conversation"
  },
  PAID: {
    eyebrow: "Payment Confirmed",
    title: "Your commission is entering the atelier.",
    description: "Payment has been recorded. The production team will schedule your fragrance for crafting.",
    primaryAction: "order-details",
    primaryLabel: "View Order Details"
  },
  IN_PRODUCTION: {
    eyebrow: "Crafting",
    title: "Your fragrance is being crafted.",
    description: "Our artisan has started creating your fragrance. We'll update this room when it is ready to travel.",
    primaryAction: "order-details",
    primaryLabel: "View Order Details"
  },
  SHIPPED: {
    eyebrow: "Delivery",
    title: "Your creation is on its way.",
    description: "The finished commission has left the atelier. Shipping details are preserved below.",
    primaryAction: "order-details",
    primaryLabel: "View Delivery Details"
  },
  COMPLETED: {
    eyebrow: "Journey Complete",
    title: "Your creation has arrived.",
    description: "Your fragrance has been delivered and is now part of your collection. Thank you for creating with us.",
    primaryAction: "create-another",
    primaryLabel: "Create Another Fragrance"
  }
};

const simplifiedStatusSet = new Set<ReviewRequestStatus>(SIMPLIFIED_PROJECT_STATUSES);

export const usesSimplifiedProjectState = (status: ReviewRequestStatus): status is SimplifiedProjectStatus => simplifiedStatusSet.has(status);

export const getProjectRoomPresentation = (status: SimplifiedProjectStatus) => PROJECT_ROOM_PRESENTATION[status];
