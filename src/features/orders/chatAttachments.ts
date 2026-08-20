import { getSupabaseClient } from "../../lib/supabase";

export const CHAT_ATTACHMENT_BUCKET="chat-attachments";
export const CHAT_IMAGE_TYPES=["image/jpeg","image/png","image/webp","image/gif"];
export const CHAT_IMAGE_MAX_BYTES=2*1024*1024;

const extensionFor=(file:File)=>{const supplied=file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g,"");if(supplied&&supplied.length<=5)return supplied;return file.type==="image/png"?"png":file.type==="image/webp"?"webp":file.type==="image/gif"?"gif":"jpg"};
export function validateChatImage(file:File){if(!CHAT_IMAGE_TYPES.includes(file.type))throw new Error("Choose a JPG, PNG, WebP, or GIF image.");if(file.size>CHAT_IMAGE_MAX_BYTES)throw new Error("The image must be 2 MB or smaller.")}
export async function uploadCustomerChatImage(requestId:string,file:File){validateChatImage(file);const client=getSupabaseClient();const user=await client.auth.getUser();if(user.error||!user.data.user)throw new Error("Please sign in before attaching an image.");const path=`${requestId}/${user.data.user.id}/${crypto.randomUUID()}.${extensionFor(file)}`;const upload=await client.storage.from(CHAT_ATTACHMENT_BUCKET).upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});if(upload.error)throw upload.error;return path}
export async function signedChatAttachment(path:string|null|undefined){if(!path)return undefined;if(/^https?:\/\//i.test(path))return path;const result=await getSupabaseClient().storage.from(CHAT_ATTACHMENT_BUCKET).createSignedUrl(path,3600);return result.error?undefined:result.data.signedUrl}
