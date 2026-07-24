import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { useOrderDetail } from "./useOrderDetail";
import { orderService } from "./orderService";
import { useDrafts } from "../../contexts/DraftContext";
import CreationPreparation from "./components/CreationPreparation";
import ArtisanReviewRoom from "./components/ArtisanReviewRoom";
import ApprovalRoom from "./components/ApprovalRoom";
import FulfillmentRoom from "./components/FulfillmentRoom";
import ClosedProjectRoom from "./components/ClosedProjectRoom";
import { CreationIdentity } from "./components/OrderComponents";
import { getOrderRoom } from "./orderRoom";

export default function OrderDetailPage(){
  const{requestId}=useParams();const[search]=useSearchParams();const navigate=useNavigate();const[error,setError]=useState("");const[actionBusy,setActionBusy]=useState(false);const{loadDraft}=useDrafts();
  const includeDemo=import.meta.env.DEV&&search.get("dev")==="1";
  const[latestId,setLatestId]=useState<string|undefined>(requestId==="latest"?undefined:requestId);
  const{data,loading,error:loadError}=useOrderDetail(latestId);
  useEffect(()=>{if(requestId!=="latest"){setLatestId(requestId);return}void orderService.getRequests(includeDemo).then(items=>{const id=items[0]?.id;setLatestId(id);if(id)navigate(`/my-orders/${id}${includeDemo?"?dev=1":""}`,{replace:true})}).catch(cause=>setError(cause instanceof Error?cause.message:"My Orders could not be loaded."))},[includeDemo,navigate,requestId]);
  useEffect(()=>{document.body.classList.add("order-detail-page");return()=>document.body.classList.remove("order-detail-page")},[]);
  if(loading||(requestId==="latest"&&!latestId))return <div className="od-loading"><span/><span/><span/></div>;
  if(!data)return <main className="od-not-found"><h1>Request not found</h1><p>{loadError||error||"No request is available for this account."}</p><button onClick={()=>navigate("/chamber-of-creation")}>Start a Creation</button></main>;
  const request=data.request;
  const room=getOrderRoom(request.status);
  const editCreation=async()=>{setError("");const destination=request.creationMode==="described"?"/describe-your-creation":"/artisan-bench";const sourceDraftId=request.previewSnapshot?.sourceDraftId;if(sourceDraftId){try{const draft=await loadDraft(sourceDraftId);if(!draft){setError("The linked draft could not be found.");return}}catch(cause){setError(cause instanceof Error?cause.message:"The linked draft could not be opened.");return}}navigate(destination)};
  const run=async(kind:"primary"|"revision"|"cancel")=>{setError("");setActionBusy(true);let result;try{
    if(kind==="cancel")result=await orderService.updateStatus(request.id,"CANCELLED","customer","Request cancelled by customer");
    else if(kind==="revision")result=await orderService.updateStatus(request.id,"REVISION_REQUESTED","customer","Customer requested a revision");
    else if(request.status==="DRAFT_PREVIEW")result=await orderService.submitForReview(request.id);
    else if(request.status==="READY_FOR_APPROVAL")result=await orderService.updateStatus(request.id,"READY_FOR_CHECKOUT","customer","Creation details approved by customer");
    else if(["READY_FOR_CHECKOUT","PAYMENT_PENDING"].includes(request.status)){navigate(`/checkout/${request.id}`);return}
    else if(["UNDER_REVIEW","WAITING_FOR_REPLY"].includes(request.status)){document.querySelector(".od-compose input")?.scrollIntoView({behavior:"smooth",block:"center"});return}
    if(result&&!result.ok)setError(result.error??"The action is not allowed.");
  }finally{setActionBusy(false)}
  };
  if(room==="preparation")return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="order-preparation-shell"><CreationIdentity request={request} includeDemo={includeDemo}/>{error&&<p className="od-action-error" role="alert">{error}</p>}<CreationPreparation request={request} busy={actionBusy} onEdit={()=>void editCreation()} onSubmit={()=>void run("primary")}/></main></>;
  if(room==="review")return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="project-room-shell"><CreationIdentity request={request} includeDemo={includeDemo}/>{error&&<p className="od-action-error" role="alert">{error}</p>}<ArtisanReviewRoom request={request} messages={data.messages} activity={data.activity} busy={actionBusy} onCancel={()=>window.confirm("Cancel this project? Your submitted record will be closed.")&&void run("cancel")}/></main></>;
  if(room==="approval")return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="project-room-shell"><CreationIdentity request={request} includeDemo={includeDemo}/>{error&&<p className="od-action-error" role="alert">{error}</p>}<ApprovalRoom request={request} messages={data.messages} activity={data.activity} busy={actionBusy} onApprove={()=>void run("primary")} onRevision={()=>void run("revision")} onCancel={()=>window.confirm("Cancel this project? The artisan proposal will be closed.")&&void run("cancel")}/></main></>;
  if(room==="fulfillment")return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="project-room-shell"><CreationIdentity request={request} includeDemo={includeDemo}/>{error&&<p className="od-action-error" role="alert">{error}</p>}<FulfillmentRoom request={request} order={data.order} messages={data.messages} activity={data.activity} busy={actionBusy} onCheckout={()=>void run("primary")} onCancel={()=>window.confirm("Cancel this approved project before checkout?")&&void run("cancel")}/></main></>;
  return <><GlobalHeader variant="light" activeLabel="My Orders"/><main className="project-room-shell"><CreationIdentity request={request} includeDemo={includeDemo}/><ClosedProjectRoom request={request} activity={data.activity}/></main></>;
}
