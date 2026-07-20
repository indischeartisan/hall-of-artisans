export type WorkflowStatus =
  | "DRAFT_PREVIEW" | "SUBMITTED" | "UNDER_REVIEW" | "WAITING_FOR_REPLY"
  | "READY_FOR_APPROVAL" | "REVISION_REQUESTED" | "READY_FOR_CHECKOUT"
  | "PAYMENT_PENDING" | "PAID" | "IN_PRODUCTION" | "SHIPPED"
  | "COMPLETED" | "CANCELLED";

export type WorkflowActor = "customer" | "reviewer" | "admin" | "system";
export type AppRole = "customer" | "reviewer" | "admin" | "super_admin";

export interface WorkflowTransition { to: WorkflowStatus; actors: readonly WorkflowActor[] }
export interface WorkflowStatusConfig {
  key: WorkflowStatus; label: string; description: string;
  allowedTransitions: readonly WorkflowTransition[];
  customerVisible: boolean; chatAvailable: boolean; cancellationAvailable: boolean; checkoutAvailable: boolean;
}

const transition = (to: WorkflowStatus, ...actors: WorkflowActor[]): WorkflowTransition => ({ to, actors });
export const WORKFLOW: Record<WorkflowStatus, WorkflowStatusConfig> = {
  DRAFT_PREVIEW:{key:"DRAFT_PREVIEW",label:"Creation Preview",description:"Review the creation before it is sent.",allowedTransitions:[transition("SUBMITTED","customer"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:false,cancellationAvailable:true,checkoutAvailable:false},
  SUBMITTED:{key:"SUBMITTED",label:"Submitted",description:"The creation has entered the review queue.",allowedTransitions:[transition("UNDER_REVIEW","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  UNDER_REVIEW:{key:"UNDER_REVIEW",label:"Under Review",description:"An artisan is reviewing the submitted snapshot.",allowedTransitions:[transition("WAITING_FOR_REPLY","reviewer","admin"),transition("READY_FOR_APPROVAL","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  WAITING_FOR_REPLY:{key:"WAITING_FOR_REPLY",label:"Waiting for Your Reply",description:"The review is waiting for customer guidance.",allowedTransitions:[transition("UNDER_REVIEW","customer","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  READY_FOR_APPROVAL:{key:"READY_FOR_APPROVAL",label:"Ready for Approval",description:"The review result is ready for a customer decision.",allowedTransitions:[transition("REVISION_REQUESTED","customer"),transition("READY_FOR_CHECKOUT","customer"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  REVISION_REQUESTED:{key:"REVISION_REQUESTED",label:"Revision Requested",description:"The customer requested changes to the review result.",allowedTransitions:[transition("UNDER_REVIEW","reviewer","admin"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:false},
  READY_FOR_CHECKOUT:{key:"READY_FOR_CHECKOUT",label:"Ready for Checkout",description:"The approved and priced creation may enter checkout.",allowedTransitions:[transition("PAYMENT_PENDING","customer","system"),transition("CANCELLED","customer","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:true,checkoutAvailable:true},
  PAYMENT_PENDING:{key:"PAYMENT_PENDING",label:"Payment Pending",description:"An order exists and awaits payment confirmation.",allowedTransitions:[transition("PAID","system","admin"),transition("CANCELLED","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:true},
  PAID:{key:"PAID",label:"Paid",description:"Payment is confirmed and production awaits an administrator.",allowedTransitions:[transition("IN_PRODUCTION","admin"),transition("CANCELLED","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  IN_PRODUCTION:{key:"IN_PRODUCTION",label:"In Production",description:"The creation is being produced.",allowedTransitions:[transition("SHIPPED","admin"),transition("CANCELLED","admin")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  SHIPPED:{key:"SHIPPED",label:"Shipped",description:"The creation has been dispatched.",allowedTransitions:[transition("COMPLETED","admin","system")],customerVisible:true,chatAvailable:true,cancellationAvailable:false,checkoutAvailable:false},
  COMPLETED:{key:"COMPLETED",label:"Completed",description:"The order item journey is complete.",allowedTransitions:[],customerVisible:true,chatAvailable:false,cancellationAvailable:false,checkoutAvailable:false},
  CANCELLED:{key:"CANCELLED",label:"Cancelled",description:"The record is preserved but its workflow is closed.",allowedTransitions:[],customerVisible:true,chatAvailable:false,cancellationAvailable:false,checkoutAvailable:false}
};

export const WORKFLOW_STATUSES = Object.keys(WORKFLOW) as WorkflowStatus[];
export const canTransition = (from: WorkflowStatus, to: WorkflowStatus, actor: WorkflowActor) => WORKFLOW[from].allowedTransitions.some(rule => rule.to === to && rule.actors.includes(actor));
export const getAllowedTransitions = (status: WorkflowStatus, actor: WorkflowActor) => WORKFLOW[status].allowedTransitions.filter(rule => rule.actors.includes(actor)).map(rule => rule.to);
export const canCustomerCancel = (status: WorkflowStatus) => WORKFLOW[status].cancellationAvailable && canTransition(status,"CANCELLED","customer");
export const isChatAvailable = (status: WorkflowStatus) => WORKFLOW[status].chatAvailable;
export const isCheckoutAvailable = (status: WorkflowStatus) => WORKFLOW[status].checkoutAvailable;

