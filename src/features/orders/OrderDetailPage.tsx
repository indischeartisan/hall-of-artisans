import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { useOrderDetail } from "./useOrderDetail";
import { orderService } from "./orderService";
import { useDrafts } from "../../contexts/DraftContext";
import CreationPreparation from "./components/CreationPreparation";
import ArtisanReviewRoom from "./components/ArtisanReviewRoom";
import ClosedProjectRoom from "./components/ClosedProjectRoom";
import ProjectRoomShell from "./components/ProjectRoomShell";
import SimplifiedProjectState from "./components/SimplifiedProjectState";
import ProposalDecisionPanel from "./components/ProposalDecisionPanel";
import PaymentTransitionPanel from "./components/PaymentTransitionPanel";
import { getOrderRoom } from "./orderRoom";
import { usesSimplifiedProjectState } from "./projectRoomPresentation";
import type { CommissionPackage } from "./types";
import { useAuth } from "../../contexts/AuthContext";

export default function OrderDetailPage(){
  const{requestId}=useParams();const[search]=useSearchParams();const navigate=useNavigate();const location=useLocation();const[error,setError]=useState("");const[actionBusy,setActionBusy]=useState(false);const{loadDraft}=useDrafts();
  const{user,loading:authLoading}=useAuth();
  const[packages,setPackages]=useState<CommissionPackage[]>([]);const[selectedPackageId,setSelectedPackageId]=useState<string|null>(null);
  const includeDemo=import.meta.env.DEV&&search.get("dev")==="1";
  const[latestId,setLatestId]=useState<string|undefined>(requestId==="latest"?undefined:requestId);
  const[latestResolved,setLatestResolved]=useState(requestId!=="latest");
  const{data,loading,error:loadError,refresh}=useOrderDetail(authLoading||!user?undefined:latestId);
  useEffect(()=>{if(authLoading)return;if(!user){setError("Please sign in to open My Creations.");setLatestResolved(true);return}if(requestId!=="latest"){setLatestId(requestId);setLatestResolved(true);return}setLatestResolved(false);void orderService.getRequests(includeDemo).then(items=>{const id=items[0]?.id;setLatestId(id);const base=location.pathname.startsWith("/my-orders")?"/my-orders":"/my-creations";if(id)navigate(`${base}/${id}${includeDemo?"?dev=1":""}`,{replace:true})}).catch(cause=>setError(cause instanceof Error?cause.message:"My Creations could not be loaded.")).finally(()=>setLatestResolved(true))},[authLoading,includeDemo,location.pathname,navigate,requestId,user]);
  useEffect(()=>{document.body.classList.add("order-detail-page");return()=>document.body.classList.remove("order-detail-page")},[]);
  useEffect(()=>{const request=data?.request;if(!request||request.status!=="DRAFT_PREVIEW")return;setSelectedPackageId(request.selectedPackageId);void orderService.getCommissionPackages().then(setPackages).catch(cause=>setError(cause instanceof Error?cause.message:"Packages could not be loaded."))},[data?.request.id,data?.request.status,data?.request.selectedPackageId]);
  if(authLoading||loading||(requestId==="latest"&&!latestResolved))return <div className="od-loading"><span/><span/><span/></div>;
  if(!data)return <main className="od-not-found"><h1>Request not found</h1><p>{loadError||error||"No request is available for this account."}</p><button onClick={()=>navigate("/chamber-of-creation")}>Start a Creation</button></main>;
  const request=data.request;
  const room=getOrderRoom(request.status);
  const editCreation=async()=>{setError("");const destination=request.creationMode==="described"?"/describe-your-creation":"/artisan-bench";const sourceDraftId=request.previewSnapshot?.sourceDraftId;if(sourceDraftId){try{const draft=await loadDraft(sourceDraftId);if(!draft){setError("The linked draft could not be found.");return}}catch(cause){setError(cause instanceof Error?cause.message:"The linked draft could not be opened.");return}}navigate(destination)};
  const selectPackage=async(packageId:string)=>{setError("");setActionBusy(true);try{const result=await orderService.selectCommissionPackage(request.id,packageId);if(!result.ok){setError(result.error??"The package could not be selected.");return}setSelectedPackageId(packageId)}finally{setActionBusy(false)}};
  const run=async(kind:"primary"|"cancel")=>{setError("");setActionBusy(true);let result;try{
    if(kind==="cancel")result=await orderService.updateStatus(request.id,"CANCELLED","customer","Request cancelled by customer");
    else if(request.status==="DRAFT_PREVIEW")result=await orderService.submitForReview(request.id);
    else if(["READY_FOR_PAYMENT","PAYMENT_PENDING"].includes(request.status)){navigate(`/checkout/${request.id}`);return}
    else if(request.status==="CONSULTATION"){document.querySelector(".od-compose input")?.scrollIntoView({behavior:"smooth",block:"center"});return}
    if(result&&!result.ok)setError(result.error??"The action is not allowed.");
  }finally{setActionBusy(false)}
  };
  const approveProposal=async()=>{setError("");setActionBusy(true);try{const result=await orderService.updateStatus(request.id,"READY_FOR_PAYMENT","customer","Creation approved by customer");if(!result.ok)setError(result.error??"Your approval could not be saved. Please try again.")}catch(cause){setError(cause instanceof Error?cause.message:"Your approval could not be saved. Please try again.")}finally{setActionBusy(false)}};
  const requestRevision=async(note:string)=>{setError("");setActionBusy(true);try{const message=await orderService.sendMessage(request.id,note);if(!message.ok){setError(message.error??"Your adjustment note could not be sent.");return}const result=await orderService.updateStatus(request.id,"REVISION_REQUESTED","customer","Customer requested an adjustment");if(!result.ok)setError(result.error??"Your adjustment request could not be saved.")}catch(cause){setError(cause instanceof Error?cause.message:"Your adjustment request could not be saved.")}finally{setActionBusy(false)}};
  let roomContent;
  if(request.status==="READY_FOR_APPROVAL"||request.status==="REVISION_REQUESTED")roomContent=<ProposalDecisionPanel request={request} messages={data.messages} activity={data.activity} busy={actionBusy} onApprove={()=>void approveProposal()} onRevision={note=>void requestRevision(note)}/>;
  else if(request.status==="READY_FOR_PAYMENT"||request.status==="PAYMENT_PENDING")roomContent=<PaymentTransitionPanel request={request} order={data.order} busy={actionBusy} onCheckout={()=>void run("primary")}/>;
  else if(usesSimplifiedProjectState(request.status))roomContent=<SimplifiedProjectState request={{...request,status:request.status}} order={data.order} messages={data.messages} activity={data.activity}/>;
  else if(room==="preparation")roomContent=<CreationPreparation request={request} busy={actionBusy} packages={packages} selectedPackageId={selectedPackageId} onSelectPackage={packageId=>void selectPackage(packageId)} onEdit={()=>void editCreation()} onSubmit={()=>void run("primary")}/>;
  else if(room==="review")roomContent=<ArtisanReviewRoom request={request} messages={data.messages} activity={data.activity} busy={actionBusy} onCancel={()=>window.confirm("Cancel this project? Your submitted record will be closed.")&&void run("cancel")}/>;
  else if(room==="closed")roomContent=<ClosedProjectRoom request={request} activity={data.activity}/>;
  else roomContent=<section className="customer-project-room__fallback"><h2>We&apos;re preparing your creation.</h2><p>This Project Room will update as soon as the next step is ready.</p></section>;
  return <><GlobalHeader variant="light" activeLabel="My Creations"/><ProjectRoomShell request={request} includeDemo={includeDemo} error={error||loadError} onRetry={loadError?()=>void refresh():undefined}><button className="customer-project-room__refresh" type="button" disabled={actionBusy} onClick={() => void refresh()}>Refresh Messages &amp; Status</button>{roomContent}</ProjectRoomShell></>;
}
