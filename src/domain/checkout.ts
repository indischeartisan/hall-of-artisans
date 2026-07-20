export interface CheckoutCandidate { status:string; finalPrice:number|null; currency:string; submissionId?:string|null; submissionSnapshot?:unknown }
export function validateCheckoutCandidates(items:readonly CheckoutCandidate[]):string|null{
  if(!items.length)return "Select at least one creation.";
  if(items.some(item=>item.status!=="READY_FOR_CHECKOUT"||!item.finalPrice||item.finalPrice<=0||!/^[A-Z]{3}$/.test(item.currency)||!item.submissionId||!item.submissionSnapshot))return "Every creation must be approved, priced, and have a submitted snapshot.";
  if(new Set(items.map(item=>item.currency)).size!==1)return "All creations in one order must use the same currency.";
  return null;
}
