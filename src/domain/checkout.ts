export interface CheckoutCandidate { status:string; finalPrice:number|null; currency:string; submissionId?:string|null; submissionSnapshot?:unknown; hasSubmissionSnapshot?:boolean }
export function validateCheckoutCandidates(items:readonly CheckoutCandidate[]):string|null{
  if(!items.length)return "Select at least one creation.";
  if(items.some(item=>item.status!=="READY_FOR_PAYMENT"||!item.finalPrice||item.finalPrice<=0||!/^[A-Z]{3}$/.test(item.currency)||!item.submissionId||!(item.hasSubmissionSnapshot??Boolean(item.submissionSnapshot))))return "Every creation must finish consultation, have an exact package price, and keep its submitted snapshot.";
  if(new Set(items.map(item=>item.currency)).size!==1)return "All creations in one order must use the same currency.";
  return null;
}
