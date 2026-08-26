import { getSupabaseClient } from "../../lib/supabase";

export const CHAT_ATTACHMENT_BUCKET="chat-attachments";
export const CHAT_IMAGE_TYPES=["image/jpeg","image/png","image/webp"];
export const CHAT_IMAGE_MAX_BYTES=2*1024*1024;
const SIGNED_URL_TTL_SECONDS=3600;
const SIGNED_URL_CACHE_MS=55*60*1000;
const signedUrlCache=new Map<string,{url:string;expiresAt:number}>();

const extensionFor=(file:File)=>file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
export function validateChatImage(file:File){if(!CHAT_IMAGE_TYPES.includes(file.type))throw new Error("Choose a JPG, PNG, or WebP image.");if(file.size>CHAT_IMAGE_MAX_BYTES)throw new Error("The image must be 2 MB or smaller.")}
export async function uploadCustomerChatImage(requestId:string,file:File){validateChatImage(file);const client=getSupabaseClient();const user=await client.auth.getUser();if(user.error||!user.data.user)throw new Error("Please sign in before attaching an image.");const path=`${requestId}/${user.data.user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;const upload=await client.storage.from(CHAT_ATTACHMENT_BUCKET).upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});if(upload.error)throw upload.error;return path}
export async function signedChatAttachment(path:string|null|undefined){if(!path)return undefined;if(/^https?:\/\//i.test(path))return path;const cached=signedUrlCache.get(path);if(cached&&cached.expiresAt>Date.now())return cached.url;const result=await getSupabaseClient().storage.from(CHAT_ATTACHMENT_BUCKET).createSignedUrl(path,SIGNED_URL_TTL_SECONDS);if(result.error)return undefined;signedUrlCache.set(path,{url:result.data.signedUrl,expiresAt:Date.now()+SIGNED_URL_CACHE_MS});return result.data.signedUrl}
