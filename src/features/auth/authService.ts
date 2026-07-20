import type { AuthError } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

export interface AuthServiceError{code:string;message:string;status?:number}
export type AuthResult<T>={ok:true;data:T}|{ok:false;error:AuthServiceError};
const normalize=(error:unknown):AuthServiceError=>{const value=error as Partial<AuthError>|undefined;return{code:value?.code??"auth_error",message:value?.message??"Authentication request failed.",status:value?.status}};
async function run<T extends {data?:unknown;error:AuthError|null}>(operation:()=>Promise<T>):Promise<AuthResult<T["data"]>>{try{const response=await operation();return response.error?{ok:false,error:normalize(response.error)}:{ok:true,data:response.data}}catch(error){return{ok:false,error:normalize(error)}}}

export const authService={
  signUp(email:string,password:string,displayName:string,emailRedirectTo?:string){return run(()=>getSupabaseClient().auth.signUp({email,password,options:{data:{display_name:displayName},emailRedirectTo}}))},
  signIn(email:string,password:string){return run(()=>getSupabaseClient().auth.signInWithPassword({email,password}))},
  signOut(){return run(()=>getSupabaseClient().auth.signOut())},
  getSession(){return run(()=>getSupabaseClient().auth.getSession())},
  getCurrentUser(){return run(()=>getSupabaseClient().auth.getUser())},
  requestPasswordReset(email:string,redirectTo?:string){return run(()=>getSupabaseClient().auth.resetPasswordForEmail(email,{redirectTo}))},
  updatePassword(password:string){return run(()=>getSupabaseClient().auth.updateUser({password}))},
  resendVerificationEmail(email:string,emailRedirectTo?:string){return run(()=>getSupabaseClient().auth.resend({type:"signup",email,options:{emailRedirectTo}}))}
};
