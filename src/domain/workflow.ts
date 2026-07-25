export type WorkflowStatus =
  | "DRAFT_PREVIEW" | "SUBMITTED" | "UNDER_REVIEW" | "CONSULTATION" | "READY_FOR_PAYMENT"
  | "PAYMENT_PENDING" | "PAID" | "IN_PRODUCTION" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export type WorkflowActor = "customer" | "reviewer" | "admin" | "system";
export type AppRole = "customer" | "reviewer" | "admin" | "super_admin";
export interface WorkflowTransition { to: WorkflowStatus; actors: readonly WorkflowActor[] }
export interface WorkflowStatusConfig { key: WorkflowStatus; label: string; description: string; allowedTransitions: readonly WorkflowTransition[]; customerVisible: boolean; chatAvailable: boolean; cancellationAvailable: boolean; checkoutAvailable: boolean }
const transition = (to: WorkflowStatus, ...actors: WorkflowActor[]): WorkflowTransition => ({ to, actors });

export const WORKFLOW: Record<WorkflowStatus, WorkflowStatusConfig> = {
  DRAFT_PREVIEW:{key:"DRAFT_PREVIEW",label:"Creation Preview",description:"Choose a package and review the creation before sending it.",allowedTransitions:[transition("SUBMITTED","customer"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:false,cancellationAvailable:true,checkoutAvailable:false},
  SUBMITTED:{key:"SUBMITTED",label:"Submitted",description:"The creation has entered the artisan review queue.",allowedTransitions:[transition("UNDER_REVIEW","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:false,cancellationAvailable:true,checkoutAvailable:false},
  UNDER_REVIEW:{key:"UNDER_REVIEW",label:"Under Review",description:"An artisan is studying the submitted snapshot.",allowedTransitions:[transition("CONSULTATION","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:false,cancellationAvailable:true,checkoutAvailable:false},
  CONSULTATION:{key:"CONSULTATION",label:"Consultation",description:"Customer and artisan refine the creation together in chat.",allowedTransitions:[transition("READY_FOR_PAYMENT","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  READY_FOR_PAYMENT:{key:"READY_FOR_PAYMENT",label:"Ready for Payment",description:"The artisan is ready to begin after payment is confirmed.",allowedTransitions:[transition("PAYMENT_PENDING","customer","system"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:true},
  PAYMENT_PENDING:{key:"PAYMENT_PENDING",label:"Payment Pending",description:"The order exists and awaits payment confirmation.",allowedTransitions:[transition("PAID","system","admin"),transition("CANCELLED","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:true},
  PAID:{key:"PAID",label:"Paid",description:"Payment is confirmed and production can be scheduled.",allowedTransitions:[transition("IN_PRODUCTION","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  IN_PRODUCTION:{key:"IN_PRODUCTION",label:"In Production",description:"The fragrance is being crafted.",allowedTransitions:[transition("SHIPPED","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  SHIPPED:{key:"SHIPPED",label:"Shipped",description:"The finished creation has been dispatched.",allowedTransitions:[transition("COMPLETED","admin","system")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  COMPLETED:{key:"COMPLETED",label:"Completed",description:"The commission journey is complete.",allowedTransitions:[],customerVisible:true,chatAvailable:false,cancellationAvailable:false,checkoutAvailable:false},
  CANCELLED:{key:"CANCELLED",label:"Cancelled",description:"The record is preserved but its workflow is closed.",allowedTransitions:[],customerVisible:true,chatAvailable:false,cancellationAvailable:false,checkoutAvailable:false}
};

export const WORKFLOW_STATUSES = Object.keys(WORKFLOW) as WorkflowStatus[];
export const canTransition = (from: WorkflowStatus, to: WorkflowStatus, actor: WorkflowActor) => WORKFLOW[from].allowedTransitions.some(rule => rule.to === to && rule.actors.includes(actor));
export const getAllowedTransitions = (status: WorkflowStatus, actor: WorkflowActor) => WORKFLOW[status].allowedTransitions.filter(rule => rule.actors.includes(actor)).map(rule => rule.to);
export const canCustomerCancel = (status: WorkflowStatus) => WORKFLOW[status].cancellationAvailable && canTransition(status,"CANCELLED","customer");
export const isChatAvailable = (status: WorkflowStatus) => WORKFLOW[status].chatAvailable;
export const isCheckoutAvailable = (status: WorkflowStatus) => WORKFLOW[status].checkoutAvailable;
