import { useState } from "react";
import { orderService } from "../orderService";
import { useNavigate } from "react-router";
import type { RequestActivity, RequestMessage, ReviewRequest, ReviewRequestStatus } from "../types";
import { isChatAvailable, WORKFLOW } from "../../../domain/workflow";
import { groupOrderRequests } from "../orderGrouping";

export const money = (amount: number | null, currency: string) => amount == null ? "—" : currency === "IDR" ? `Rp${amount.toLocaleString("id-ID")}` : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
export const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

function OrderPickerItem({ item, currentId, includeDemo, onChoose }: { item: ReviewRequest; currentId: string; includeDemo: boolean; onChoose: (path: string) => void }) {
  return <button type="button" className={item.id === currentId ? "active" : ""} onClick={() => onChoose(`/my-creations/${item.id}${includeDemo ? "?dev=1" : ""}`)}><span><strong>{item.perfumeName}</strong><small>{item.requestNumber}</small></span><em>{WORKFLOW[item.status].label}</em></button>;
}

export function CreationIdentity({ request, includeDemo=false }: { request: ReviewRequest; includeDemo?:boolean }) {
  const navigate=useNavigate();
  const[open,setOpen]=useState(false);
  const[items,setItems]=useState<ReviewRequest[]>([]);
  const refresh=()=>void orderService.getRequests(includeDemo).then(setItems).catch(()=>setItems([]));
  const {active,previews,closed}=groupOrderRequests(items);
  const choose=(path:string)=>{setOpen(false);navigate(path)};
  const group=(label:string,groupItems:ReviewRequest[])=><section className="od-order-group" key={label}><h3>{label}<span>{groupItems.length}</span></h3>{groupItems.map(item=><OrderPickerItem item={item} currentId={request.id} includeDemo={includeDemo} onChoose={choose} key={item.id}/>)}</section>;
  return <section className="od-identity"><div className="od-order-picker"><button type="button" aria-expanded={open} onClick={()=>{refresh();setOpen(value=>!value)}}>MY CREATIONS <span>{open?"▴":"▾"}</span></button><span>›</span><b>{request.perfumeName.toUpperCase()}</b>{open&&<div className="od-order-menu">{items.length?<>{active.length>0&&group("Active Projects",active)}{previews.length>0&&group("Creation Previews",previews)}{closed.length>0&&<details className="od-order-closed"><summary>Closed Projects <span>{closed.length}</span></summary>{group("Closed",closed)}</details>}</>:<p>No creation projects yet.</p>}</div>}</div><div><h1>{request.perfumeName}</h1><span className="od-status-pill">{WORKFLOW[request.status].label}</span></div><p>{request.concentration} <b>•</b> {request.bottleSize} <b>•</b> Created by account holder</p><div className="od-identifiers"><span><small>Request No.</small>{request.requestNumber}</span><span><small>Submitted On</small>{formatDate(request.submittedAt)}</span><span><small>Last Update</small>{formatDate(request.lastUpdatedAt)}</span></div></section>;
}

export function ChatPanel({ requestId,status,messages }: { requestId:string;status:ReviewRequestStatus;messages:RequestMessage[] }) { const [text,setText]=useState(""); const enabled=isChatAvailable(status); const send=async()=>{if(!enabled||!text.trim())return;const result=await orderService.sendMessage(requestId,text);if(result.ok)setText("")}; return <section className="od-chat">{messages.length?messages.map(message=><article className={message.senderRole} key={message.id}><div className="od-avatar">{message.senderRole==="artisan"?"IA":message.senderRole==="system"?"✦":"YO"}</div><div><header><strong>{message.senderRole==="customer"?"You":message.senderName}</strong><small>{formatDate(message.createdAt)}</small></header><p>{message.message}</p></div></article>):<p className="od-empty">No letters yet. Your conversation with the artisan will appear here.</p>}<div className="od-compose"><input disabled={!enabled} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();void send()}}} placeholder={enabled?"Type your message...":"Chat is unavailable for this status."}/><button type="button" disabled={!enabled} onClick={()=>void send()}>➤</button></div><small>You will be notified here and via email for any updates.</small></section> }
export function ActivityPanel({ activity }: { activity:RequestActivity[] }) { return <section className="od-activity">{activity.length?activity.slice().reverse().map(item=><article key={item.id}><i>✓</i><div><strong>{item.label}</strong><small>{formatDate(item.createdAt)}</small></div></article>):<p className="od-empty">No activity has been recorded yet.</p>}</section> }
