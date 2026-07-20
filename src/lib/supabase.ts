import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const url=import.meta.env.VITE_SUPABASE_URL?.trim()??"";
const publishableKey=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()??"";
export const isSupabaseConfigured=Boolean(url&&publishableKey);

export class SupabaseConfigurationError extends Error { constructor(){super("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a local environment file.");this.name="SupabaseConfigurationError"} }

export const supabase:SupabaseClient<Database>|null=isSupabaseConfigured?createClient<Database>(url,publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export function getSupabaseClient():SupabaseClient<Database>{if(!supabase)throw new SupabaseConfigurationError();return supabase}
export const supabaseConfigurationDiagnostic=import.meta.env.DEV?{configured:isSupabaseConfigured,urlPresent:Boolean(url),publishableKeyPresent:Boolean(publishableKey)}:null;
