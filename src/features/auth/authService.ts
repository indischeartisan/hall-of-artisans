import { getSupabaseClient } from "../../lib/supabase";
import type { ArtisanIdStatus } from "../../types/database.types";

export interface AuthServiceError{code:string;message:string;status?:number}
export type AuthResult<T>={ok:true;data:T}|{ok:false;error:AuthServiceError};
const normalize=(error:unknown):AuthServiceError=>{const value=error as {code?:string;message?:string;status?:number}|undefined;return{code:value?.code??"auth_error",message:value?.message??"Authentication request failed.",status:value?.status}};
async function run<T extends {data?:unknown;error:unknown|null}>(operation:()=>Promise<T>):Promise<AuthResult<T["data"]>>{try{const response=await operation();return response.error?{ok:false,error:normalize(response.error)}:{ok:true,data:response.data}}catch(error){return{ok:false,error:normalize(error)}}}

export interface ArtisanIdentity { userId:string;email:string;displayName:string;publicId:string;status:ArtisanIdStatus;issuedAt:string;specialty:string }

async function getArtisanIdentity():Promise<AuthResult<ArtisanIdentity>>{
  try{
    const client=getSupabaseClient();
    const userResponse=await client.auth.getUser();
    if(userResponse.error||!userResponse.data.user)return{ok:false,error:normalize(userResponse.error??new Error("Please sign in to open your Artisan ID."))};
    const user=userResponse.data.user;
    const displayName=String(user.user_metadata.display_name??user.email?.split("@")[0]??"Artisan").trim();
    const completed=await client.rpc("complete_profile",{new_display_name:displayName});
    if(completed.error)return{ok:false,error:normalize(completed.error)};
    const issued=await client.rpc("issue_artisan_id");
    if(issued.error)return{ok:false,error:normalize(issued.error)};
    return{ok:true,data:{userId:user.id,email:user.email??"",displayName:completed.data.display_name,publicId:issued.data.public_id,status:issued.data.status,issuedAt:issued.data.issued_at,specialty:String(user.user_metadata.specialty??"Artisan Perfumer")}};
  }catch(error){return{ok:false,error:normalize(error)}}
}

export const authService={
  signUp(email:string,password:string,displayName:string,metadata:Record<string,string>={},emailRedirectTo?:string){return run(()=>getSupabaseClient().auth.signUp({email,password,options:{data:{...metadata,display_name:displayName},emailRedirectTo}}))},
  signIn(email:string,password:string){return run(()=>getSupabaseClient().auth.signInWithPassword({email,password}))},
  signOut(){return run(()=>getSupabaseClient().auth.signOut())},
  getSession(){return run(()=>getSupabaseClient().auth.getSession())},
  getCurrentUser(){return run(()=>getSupabaseClient().auth.getUser())},
  requestPasswordReset(email:string,redirectTo?:string){return run(()=>getSupabaseClient().auth.resetPasswordForEmail(email,{redirectTo}))},
  updatePassword(password:string){return run(()=>getSupabaseClient().auth.updateUser({password}))},
  resendVerificationEmail(email:string,emailRedirectTo?:string){return run(()=>getSupabaseClient().auth.resend({type:"signup",email,options:{emailRedirectTo}}))},
  getArtisanIdentity
};
