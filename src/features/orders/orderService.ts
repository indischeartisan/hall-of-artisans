import { cloneSubmissionSnapshot, createDescribedCreationSnapshot, type DescribedCreationInput } from "../../domain/creation";
import { validateCheckoutCandidates } from "../../domain/checkout";
import { canTransition, isChatAvailable, isCheckoutAvailable, type WorkflowActor, type WorkflowStatus } from "../../domain/workflow";
import { DEMO_REQUEST_ID, demoActivity, demoMessages, demoRequest } from "../../dev/fixtures/orderFixtures";
import type { CheckoutDetails, Order, OrderDetailSnapshot, RequestActivity, RequestMessage, ReviewRequest } from "./types";

export type BespokeSubmissionInput = DescribedCreationInput;
export interface ServiceResult<T=undefined> { ok:boolean; data?:T; error?:string }
export const PROTOTYPE_USER_ID="prototype-user-local-only";
export const ORDER_STORAGE_KEYS={requests:"hallOfArtisans.reviewRequests.v1",messages:"hallOfArtisans.requestMessages.v1",activity:"hallOfArtisans.requestActivity.v1",orders:"hallOfArtisans.orders.v1",checkout:"hallOfArtisans.checkout.v1"} as const;
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value)) as T;
const id=(prefix:string)=>`${prefix}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const now=()=>new Date().toISOString();
function read<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
function write<T>(key:string,value:T){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent("hoa:orders-change"))}
const requests=()=>read<ReviewRequest[]>(ORDER_STORAGE_KEYS.requests,[]);
const messages=()=>read<RequestMessage[]>(ORDER_STORAGE_KEYS.messages,[]);
const activities=()=>read<RequestActivity[]>(ORDER_STORAGE_KEYS.activity,[]);
const orders=()=>read<Order[]>(ORDER_STORAGE_KEYS.orders,[]);

function initializeStorage(){
  if(!localStorage.getItem(ORDER_STORAGE_KEYS.requests))write(ORDER_STORAGE_KEYS.requests,import.meta.env.DEV?[clone(demoRequest)]:[]);
  if(!localStorage.getItem(ORDER_STORAGE_KEYS.messages))write(ORDER_STORAGE_KEYS.messages,import.meta.env.DEV?clone(demoMessages):[]);
  if(!localStorage.getItem(ORDER_STORAGE_KEYS.activity))write(ORDER_STORAGE_KEYS.activity,import.meta.env.DEV?clone(demoActivity):[]);
  if(!localStorage.getItem(ORDER_STORAGE_KEYS.orders))write<Order[]>(ORDER_STORAGE_KEYS.orders,[]);
}

function activityLabel(status:WorkflowStatus){return status.replaceAll("_"," ").toLowerCase()}
function validCurrency(value:string){return /^[A-Z]{3}$/.test(value)}

export const orderService={
  ensureDemoData(){initializeStorage();return import.meta.env.DEV?DEMO_REQUEST_ID:undefined},
  getRequests(includeDemo=false){initializeStorage();return requests().filter(item=>includeDemo&&import.meta.env.DEV||item.id!==DEMO_REQUEST_ID).sort((a,b)=>b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))},
  async getDetail(requestId:string):Promise<OrderDetailSnapshot|null>{initializeStorage();const request=requests().find(item=>item.id===requestId);if(!request)return null;return{request,messages:messages().filter(item=>item.requestId===requestId),activity:activities().filter(item=>item.requestId===requestId),order:orders().find(item=>item.reviewRequestId===requestId||item.items?.some(orderItem=>orderItem.reviewRequestId===requestId))??null}},

  async createBespokePreview(input:BespokeSubmissionInput,existingPreviewId?:string):Promise<ReviewRequest>{
    initializeStorage();const stamp=now();const list=requests();const snapshot=createDescribedCreationSnapshot(input,stamp);const existingIndex=existingPreviewId?list.findIndex(item=>item.id===existingPreviewId&&item.status==="DRAFT_PREVIEW"):-1;const requestId=existingIndex>=0?list[existingIndex].id:id("bespoke");
    const request:ReviewRequest={id:requestId,userId:PROTOTYPE_USER_ID,creationId:id("creation"),requestNumber:"Preview only",status:"DRAFT_PREVIEW",creationMode:"described",previewSnapshot:snapshot,submissionId:null,submissionSnapshot:null,perfumeName:snapshot.perfumeName,concentration:snapshot.concentration,bottleSize:"To be confirmed",fragranceDirection:snapshot.preferredNotes,topNotes:[],heartNotes:[],baseNotes:[],fragranceBrief:snapshot.writtenStory,storyCardData:{title:snapshot.title,subtitle:"A personal story awaiting artisan interpretation.",imageUrl:"/assets/images/my-artisan-id-conservatory.webp"},customerNotes:[snapshot.notesToAvoid.length?`Please avoid: ${snapshot.notesToAvoid.join(", ")}.`:"",snapshot.additionalNotes].filter(Boolean).join(" "),countryCode:"ID",pricingRegion:"Indonesia",currency:"IDR",estimatedPriceMin:699000,estimatedPriceMax:1499000,finalPrice:null,artisanReview:null,recommendedAdjustments:[],includedItems:[],estimatedProduction:null,revisionsIncluded:null,submittedAt:null,reviewedAt:null,approvedAt:null,paidAt:null,shippedAt:null,completedAt:null,lastUpdatedAt:stamp};
    if(existingIndex>=0)list[existingIndex]=request;else list.unshift(request);write(ORDER_STORAGE_KEYS.requests,list);return clone(request);
  },

  async submitForReview(requestId:string):Promise<ServiceResult<ReviewRequest>>{
    const list=requests();const index=list.findIndex(item=>item.id===requestId);if(index<0)return{ok:false,error:"Preview not found."};const current=list[index];if(!canTransition(current.status,"SUBMITTED","customer"))return{ok:false,error:`Cannot submit a creation from ${current.status}.`};if(!current.previewSnapshot)return{ok:false,error:"This preview has no creation snapshot."};
    const stamp=now();const sequence=list.filter(item=>item.requestNumber.startsWith("HOA-RV-")).length+473;const submitted={...current,requestNumber:`HOA-RV-${new Date().getFullYear()}-${String(sequence).padStart(5,"0")}`,status:"SUBMITTED" as const,submissionId:id("submission"),submissionSnapshot:cloneSubmissionSnapshot(current.previewSnapshot),submittedAt:stamp,lastUpdatedAt:stamp};list[index]=submitted;write(ORDER_STORAGE_KEYS.requests,list);
    const messageList=messages();messageList.push({id:id("msg"),requestId,senderRole:"system",senderName:"The Hall of Artisans",message:"Your creation snapshot has been received for artisan review.",createdAt:stamp,readAt:stamp});write(ORDER_STORAGE_KEYS.messages,messageList);const activity=activities();activity.push({id:id("act"),requestId,eventType:"submitted",label:"Immutable creation snapshot submitted for artisan review",createdAt:stamp});write(ORDER_STORAGE_KEYS.activity,activity);return{ok:true,data:clone(submitted)};
  },

  async updateStatus(requestId:string,status:WorkflowStatus,actor:WorkflowActor,label?:string):Promise<ServiceResult<ReviewRequest>>{
    const stamp=now();const list=requests();const index=list.findIndex(item=>item.id===requestId);if(index<0)return{ok:false,error:"Request not found."};const current=list[index];if(!canTransition(current.status,status,actor))return{ok:false,error:`${actor} cannot move ${current.status} to ${status}.`};if(status==="READY_FOR_CHECKOUT"&&(!(current.finalPrice&&current.finalPrice>0)||!validCurrency(current.currency)))return{ok:false,error:"A valid admin-set final price and currency are required before approval."};
    const dates:Partial<ReviewRequest>=status==="UNDER_REVIEW"?{submittedAt:current.submittedAt??stamp}:status==="READY_FOR_APPROVAL"?{reviewedAt:stamp}:status==="READY_FOR_CHECKOUT"?{approvedAt:stamp}:status==="PAID"?{paidAt:stamp}:status==="SHIPPED"?{shippedAt:stamp}:status==="COMPLETED"?{completedAt:stamp}:{};const updated={...current,...dates,status,lastUpdatedAt:stamp};list[index]=updated;write(ORDER_STORAGE_KEYS.requests,list);const log=activities();log.push({id:id("act"),requestId,eventType:status.toLowerCase(),label:label??activityLabel(status),createdAt:stamp,metadata:{actor}});write(ORDER_STORAGE_KEYS.activity,log);return{ok:true,data:clone(updated)};
  },

  async setFinalPrice(requestId:string,price:number,actor:WorkflowActor):Promise<ServiceResult>{if(!["admin","system"].includes(actor))return{ok:false,error:"Only an administrator may set the final price."};if(!Number.isSafeInteger(price)||price<=0)return{ok:false,error:"Final price must be a positive integer in minor units."};const list=requests();const index=list.findIndex(item=>item.id===requestId);if(index<0)return{ok:false,error:"Request not found."};list[index]={...list[index],finalPrice:price,lastUpdatedAt:now()};write(ORDER_STORAGE_KEYS.requests,list);return{ok:true}},
  async sendMessage(requestId:string,message:string,senderRole:"customer"|"artisan"="customer"):Promise<ServiceResult>{const request=requests().find(item=>item.id===requestId);if(!request)return{ok:false,error:"Request not found."};const actor:WorkflowActor=senderRole==="customer"?"customer":"reviewer";if(!isChatAvailable(request.status))return{ok:false,error:"Chat is not available for this status."};const list=messages();list.push({id:id("msg"),requestId,senderRole,senderName:senderRole==="customer"?"You":"Indische Artisan",message:message.trim(),createdAt:now(),readAt:senderRole==="customer"?now():null});write(ORDER_STORAGE_KEYS.messages,list);if(request.status==="WAITING_FOR_REPLY"&&actor==="customer")await this.updateStatus(requestId,"UNDER_REVIEW","customer","Customer replied; artisan review resumed");return{ok:true}},
  getCheckoutSelection(){return read<string[]>(ORDER_STORAGE_KEYS.checkout,[])},
  setCheckoutSelection(requestIds:string[]){write(ORDER_STORAGE_KEYS.checkout,[...new Set(requestIds)])},
  getCheckoutEligibleRequests(){return this.getRequests().filter(item=>isCheckoutAvailable(item.status)&&item.status==="READY_FOR_CHECKOUT"&&item.finalPrice!==null&&item.finalPrice>0&&validCurrency(item.currency)&&Boolean(item.submissionId&&item.submissionSnapshot))},

  async createCheckout(requestIds:string[],details:CheckoutDetails):Promise<ServiceResult<Order>>{
    const uniqueIds=[...new Set(requestIds)];const selected=requests().filter(item=>uniqueIds.includes(item.id));const validationError=validateCheckoutCandidates(selected);if(validationError)return{ok:false,error:validationError};const currencies=[...new Set(selected.map(item=>item.currency))];
    const list=orders();const existingIds=new Set(list.flatMap(item=>item.items?.map(x=>x.reviewRequestId)??(item.reviewRequestId?[item.reviewRequestId]:[])));if(selected.some(item=>existingIds.has(item.id)))return{ok:false,error:"One of these creations already belongs to an order."};
    for(const request of selected){const result=await this.updateStatus(request.id,"PAYMENT_PENDING","customer","Checkout created; awaiting payment confirmation");if(!result.ok)return{ok:false,error:result.error}}
    const order:Order={id:id("order"),items:selected.map(request=>({reviewRequestId:request.id,submissionId:request.submissionId!,submissionSnapshot:cloneSubmissionSnapshot(request.submissionSnapshot!),creationName:request.perfumeName,amount:request.finalPrice!,currency:request.currency,productionStatus:"not_started",shippingStatus:"not_shipped"})),orderNumber:`HO-${new Date().getFullYear()}-${String(list.length+1).padStart(5,"0")}`,amount:selected.reduce((total,request)=>total+request.finalPrice!,0),currency:currencies[0],paymentStatus:"pending",productionStatus:"not_started",shippingStatus:"not_shipped",shippingPreference:details.shippingPreference??"together",createdAt:now()};list.push(order);write(ORDER_STORAGE_KEYS.orders,list);this.setCheckoutSelection([]);return{ok:true,data:clone(order)};
  },

  async simulatePaymentConfirmation(requestId:string):Promise<ServiceResult>{if(!import.meta.env.DEV)return{ok:false,error:"Mock payment simulation is development-only."};const list=orders();const index=list.findIndex(order=>order.items?.some(item=>item.reviewRequestId===requestId)||order.reviewRequestId===requestId);if(index<0)return{ok:false,error:"Order not found."};const order=list[index];if(order.paymentStatus!=="pending")return{ok:false,error:"Order is not awaiting payment."};for(const item of order.items??[]){const result=await this.updateStatus(item.reviewRequestId,"PAID","system",`Mock provider confirmed payment for ${order.orderNumber}`);if(!result.ok)return{ok:false,error:result.error}}list[index]={...order,paymentStatus:"paid"};write(ORDER_STORAGE_KEYS.orders,list);return{ok:true}
  }
};
