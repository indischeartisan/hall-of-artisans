import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type SupabaseDiagnosticStatus="not_configured"|"unreachable"|"reachable"|"schema_not_migrated";
export interface SupabaseDiagnosticResult{status:SupabaseDiagnosticStatus;message:string}
export async function diagnoseSupabaseConnection():Promise<SupabaseDiagnosticResult>{
  if(!import.meta.env.DEV)return{status:"not_configured",message:"Diagnostics are disabled outside development."};
  if(!isSupabaseConfigured)return{status:"not_configured",message:"Supabase browser variables are missing."};
  try{
    const{error}=await getSupabaseClient().from("profiles").select("id",{head:true,count:"exact"}).limit(0);
    if(!error)return{status:"reachable",message:"Supabase is reachable and the Phase 1 schema is available."};
    if(error.code==="PGRST205"||error.code==="42P01")return{status:"schema_not_migrated",message:"Supabase is reachable, but Phase 1 migrations are not available."};
    return{status:"reachable",message:"Supabase responded; anonymous profile access remains restricted as expected."};
  }catch{return{status:"unreachable",message:"Supabase is configured but could not be reached."}}
}
