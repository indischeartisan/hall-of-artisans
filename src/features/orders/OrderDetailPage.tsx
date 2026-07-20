import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { canCustomerCancel } from "../../domain/workflow";
import { useOrderDetail } from "./useOrderDetail";
import { orderService } from "./orderService";
import { CompletedActions,CreationIdentity,CreationSummary,CurrentActionCard,CurrentStatusCard,DevPanel,JourneyTimeline,NotesYouSent,PricingCard,ProductionTimeline,RequestSummaryCard,RequestTabs,ShipmentCard } from "./components/OrderComponents";

export default function OrderDetailPage(){
  const{requestId}=useParams();const[search]=useSearchParams();const navigate=useNavigate();const[error,setError]=useState("");
  const includeDemo=import.meta.env.DEV&&search.get("dev")==="1";
  const latestId=requestId==="latest"?orderService.getRequests(includeDemo)[0]?.id:requestId;
  const{data,loading}=useOrderDetail(latestId);
  useEffect(()=>{if(requestId==="latest"&&latestId)navigate(`/my-orders/${latestId}${includeDemo?"?dev=1":""}`,{replace:true})},[includeDemo,latestId,navigate,requestId]);
  useEffect(()=>{document.body.classList.add("order-detail-page");return()=>document.body.classList.remove("order-detail-page")},[]);
  if(loading)return <div className="od-loading"><span/><span/><span/></div>;
  if(!data)return <main className="od-not-found"><h1>Request not found</h1><p>No local request is available for this account.</p><button onClick={()=>navigate("/chamber-of-creation")}>Start a Creation</button></main>;
  const request=data.request;
  const run=async(kind:"primary"|"revision"|"cancel")=>{setError("");let result;
    if(kind==="cancel")result=await orderService.updateStatus(request.id,"CANCELLED","customer","Request cancelled by customer");
    else if(kind==="revision")result=await orderService.updateStatus(request.id,"REVISION_REQUESTED","customer","Customer requested a revision");
    else if(request.status==="DRAFT_PREVIEW")result=await orderService.submitForReview(request.id);
    else if(request.status==="READY_FOR_APPROVAL")result=await orderService.updateStatus(request.id,"READY_FOR_CHECKOUT","customer","Creation details approved by customer");
    else if(["READY_FOR_CHECKOUT","PAYMENT_PENDING"].includes(request.status)){navigate(`/checkout/${request.id}`);return}
    else if(["UNDER_REVIEW","WAITING_FOR_REPLY"].includes(request.status)){document.querySelector(".od-compose input")?.scrollIntoView({behavior:"smooth",block:"center"});return}
    if(result&&!result.ok)setError(result.error??"The action is not allowed.");
  };
  return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="order-detail-shell"><div className="od-hero-bg"/><div className="od-top"><CreationIdentity request={request}/><JourneyTimeline request={request}/></div>{error&&<p className="od-action-error" role="alert">{error}</p>}<div className="od-grid"><div className="od-left"><CreationSummary request={request}/><NotesYouSent request={request}/></div><RequestTabs request={request} messages={data.messages} activity={data.activity}/><aside className="od-right"><CurrentStatusCard request={request}/><PricingCard request={request}/><CurrentActionCard request={request} onAction={()=>void run("primary")} onRevision={()=>void run("revision")}/><RequestSummaryCard request={request}/><ProductionTimeline request={request}/><ShipmentCard request={request}/>{request.status==="COMPLETED"&&<CompletedActions/>}{canCustomerCancel(request.status)&&<section className="od-cancel"><p>You can cancel this request<br/>before final checkout.</p><button onClick={()=>window.confirm("Cancel this request?")&&void run("cancel")}>ⓧ &nbsp; Cancel Request</button></section>}</aside></div><footer className="od-disclaimer">This page follows the customer-visible workflow. Payment confirmation and production changes require system or administrative actors.</footer>{includeDemo&&<DevPanel request={request}/>}</main></>;
}
