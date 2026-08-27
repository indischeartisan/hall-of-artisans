import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

// These production fallbacks are public browser credentials, not privileged
// secrets. Environment variables remain the first choice so a future project
// migration can replace them without another application change.
const productionUrl="https://jnjaotrdtzcxtrfftidv.supabase.co";
const productionPublishableKey="sb_publishable_KxEmA9Dmu22w-qddfb3SAA_MozbJDl4";
const url=import.meta.env.VITE_SUPABASE_URL?.trim()||(import.meta.env.PROD?productionUrl:"");
const publishableKey=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()||(import.meta.env.PROD?productionPublishableKey:"");
export const isSupabaseConfigured=Boolean(url&&publishableKey);

export class SupabaseConfigurationError extends Error { constructor(){super("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to a local environment file.");this.name="SupabaseConfigurationError"} }

export const supabase:SupabaseClient<Database>|null=isSupabaseConfigured?createClient<Database>(url,publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export function getSupabaseClient():SupabaseClient<Database>{if(!supabase)throw new SupabaseConfigurationError();return supabase}
export const supabaseConfigurationDiagnostic=import.meta.env.DEV?{configured:isSupabaseConfigured,urlPresent:Boolean(url),publishableKeyPresent:Boolean(publishableKey)}:null;
