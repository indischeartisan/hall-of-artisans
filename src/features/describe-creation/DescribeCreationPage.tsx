import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import DraftsModal from "../../components/DraftsModal";
import { useDrafts } from "../../contexts/DraftContext";
import { isDescribedCreationDraft } from "../../types/perfumeDraft";
import { orderService, type BespokeSubmissionInput } from "../orders/orderService";

const DRAFT_KEY="hallOfArtisans.describeCreationDraft.v1";
type LetterDraft=BespokeSubmissionInput;
const emptyDraft:LetterDraft={creationTitle:"",story:"",preferredNotes:[],notesToAvoid:[],additionalNotes:""};
const steps=[{icon:"➤",title:"Submitted",text:"Your creation is sent for review"},{icon:"⌕",title:"Under Review",text:"Our artisans review your story"},{icon:"♢",title:"Approval",text:"Receive interpretation and details"},{icon:"▣",title:"Checkout",text:"Confirm and complete payment"},{icon:"△",title:"Production",text:"Your fragrance is being crafted"},{icon:"◇",title:"Delivery",text:"Your creation arrives"}];
function readDraft():LetterDraft{try{const value=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null") as Partial<LetterDraft>|null;return value&&typeof value.creationTitle==="string"&&typeof value.story==="string"?{...emptyDraft,...value,preferredNotes:Array.isArray(value.preferredNotes)?value.preferredNotes:[],notesToAvoid:Array.isArray(value.notesToAvoid)?value.notesToAvoid:[]}:emptyDraft}catch{return emptyDraft}}
function TagField({value,onChange,examples}:{value:string[];onChange:(tags:string[])=>void;examples:string[]}){const[input,setInput]=useState("");const add=(tag:string)=>{const clean=tag.trim();if(clean&&!value.some(item=>item.toLowerCase()===clean.toLowerCase()))onChange([...value,clean]);setInput("")};const key=(event:KeyboardEvent<HTMLInputElement>)=>{if(event.key==="Enter"||event.key===","){event.preventDefault();add(input)}else if(event.key==="Backspace"&&!input&&value.length)onChange(value.slice(0,-1))};return <div className="dc-tag-field">{value.map(tag=><button type="button" key={tag} onClick={()=>onChange(value.filter(item=>item!==tag))}>{tag}<span>×</span></button>)}<input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={key} onBlur={()=>add(input)} placeholder={value.length?"Add another note…":examples.slice(0,3).join(", ")+"…"}/></div>}
export default function DescribeCreationPage(){
  const navigate=useNavigate();
  const{activeDraft:createDraftRecord,createDescribedDraft,saveDraft,source}=useDrafts();
  const activeDraft=isDescribedCreationDraft(createDraftRecord)?createDraftRecord:null;
  const[draft,setDraft]=useState<LetterDraft>(()=>activeDraft?.letter??readDraft());const[message,setMessage]=useState("");const[errors,setErrors]=useState<string[]>([]);const[saving,setSaving]=useState(false);const[draftsOpen,setDraftsOpen]=useState(false);
  useEffect(()=>{document.title="Describe Your Creation | The Hall of Artisans";document.body.classList.add("describe-creation-page");return()=>document.body.classList.remove("describe-creation-page")},[]);
  const update=<K extends keyof LetterDraft>(key:K,value:LetterDraft[K])=>setDraft(current=>({...current,[key]:value}));
  const save=async()=>{
    setSaving(true);setMessage("");
    const title=draft.creationTitle.trim();const draftName=title||"Untitled Story Draft";const status=title&&draft.story.trim()?"ready":"draft";
    try{
      if(activeDraft)await saveDraft(activeDraft.id,{draftName,perfumeName:title||undefined,letter:draft,status});
      else await createDescribedDraft({draftName,perfumeName:title||undefined,letter:draft,status});
      localStorage.removeItem(DRAFT_KEY);
      setMessage(source==="supabase"?"Your story draft has been saved to your account.":"Your story draft has been saved on this device.");
    }catch{setMessage("This draft could not be saved. Please check your connection and sign-in session.")}finally{setSaving(false)}
  };
  const preview=async()=>{const nextErrors=[];if(!draft.creationTitle.trim())nextErrors.push("Please give your creation a title.");if(!draft.story.trim())nextErrors.push("Please tell the artisan about the creation you imagine.");setErrors(nextErrors);if(nextErrors.length)return;try{const title=draft.creationTitle.trim();const draftData={draftName:title||"Untitled Story Draft",perfumeName:title||undefined,letter:draft,status:"ready" as const};const linkedDraft=activeDraft?await saveDraft(activeDraft.id,draftData):await createDescribedDraft(draftData);if(!linkedDraft)throw new Error("The current draft could not be linked to this preview.");const request=await orderService.createBespokePreview(draft,undefined,linkedDraft.id);localStorage.removeItem(DRAFT_KEY);navigate(`/my-orders/${request.id}`)}catch(cause){const text=cause instanceof Error?cause.message:"The preview could not be created.";if(text.toLowerCase().includes("sign in")){localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));navigate("/artisan-login");return}setErrors([text])}};
  return <><GlobalHeader activeLabel="Chamber of Creation" variant="light"/><main className="describe-shell"><section className="dc-hero"><div><span>⌁</span><h1>Describe Your Creation</h1><p>Describe the creation you imagine.<br/>Our artisans will review your story and transform it into a bespoke fragrance.</p></div></section><form className="dc-letter" onSubmit={e=>{e.preventDefault();void preview()}}>
    <section><header><span>01.</span><h2>Creation Title</h2><i>❧</i></header><input value={draft.creationTitle} onChange={e=>update("creationTitle",e.target.value)} placeholder="Give your creation a title..."/><small>Examples: A Rainy Library, Forest Morning, My Childhood Home</small></section>
    <section><header><span>02.</span><h2>Your Story</h2></header><p>Tell us about the creation you imagine.</p><div className="dc-story-wrap"><textarea maxLength={2000} value={draft.story} onChange={e=>update("story",e.target.value)} placeholder={'Tell us about the creation you imagine.\n\nYou can describe atmosphere, memories, emotions, places, seasons, colors, dreams, or anything that inspires your fragrance.'}/><small>{draft.story.length} / 2000</small></div></section>
    <section><header><span>03.</span><h2>Preferred Notes</h2><small>(Optional)</small></header><p>Notes, accords, or aromas you love</p><TagField value={draft.preferredNotes} onChange={value=>update("preferredNotes",value)} examples={["Tea","Rain","Vanilla","Fresh Air","Cedarwood","White Musk"]}/></section>
    <section><header><span>04.</span><h2>Notes to Avoid</h2><small>(Optional)</small></header><p>Notes or aromas you prefer to avoid</p><TagField value={draft.notesToAvoid} onChange={value=>update("notesToAvoid",value)} examples={["Smoke","Heavy Floral","Strong Oud","Too Sweet"]}/></section>
    <section><header><span>05.</span><h2>Additional Notes</h2><small>(Optional)</small></header><p>Anything else our artisans should know?</p><textarea className="dc-additional" value={draft.additionalNotes} onChange={e=>update("additionalNotes",e.target.value)} placeholder="Anything else our artisans should know?"/></section>
    {errors.length>0&&<div className="dc-errors" role="alert">{errors.map(error=><p key={error}>{error}</p>)}</div>}<div className="dc-actions"><button type="button" onClick={()=>setDraftsOpen(true)}>My Drafts</button><button type="button" disabled={saving} onClick={()=>{void save()}}>▣ &nbsp; {saving?"Saving...":"Save Draft"}</button><button type="submit">Preview Creation &nbsp; ➤</button></div><p className="dc-message" role="status">{message}</p>
  </form><section className="dc-journey"><header><h2>⌁ &nbsp; Your Bespoke Journey &nbsp; ⌁</h2><p>Here is the journey of your creation.</p></header><div>{steps.map(step=><article key={step.title}><i>{step.icon}</i><strong>{step.title}</strong><small>{step.text}</small></article>)}</div></section></main><DraftsModal open={draftsOpen} onClose={()=>setDraftsOpen(false)} initialMode="described"/></>;
}
