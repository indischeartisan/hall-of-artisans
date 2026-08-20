insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-attachments','chat-attachments',false,2097152,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists chat_attachments_insert_customer on storage.objects;
create policy chat_attachments_insert_customer on storage.objects for insert to authenticated
with check (bucket_id='chat-attachments' and (storage.foldername(name))[2]=(select auth.uid())::text and exists (
  select 1 from public.review_requests request where request.id=(storage.foldername(name))[1] and request.user_id=(select auth.uid())
));

drop policy if exists chat_attachments_select_project_participant on storage.objects;
create policy chat_attachments_select_project_participant on storage.objects for select to authenticated
using (bucket_id='chat-attachments' and exists (
  select 1 from public.review_requests request where request.id=(storage.foldername(name))[1] and (
    request.user_id=(select auth.uid()) or request.assigned_reviewer_id=(select auth.uid()) or (select private.is_admin())
  )
));

create or replace function public.send_customer_request_message_with_attachment(target_request_id text,message_body text,attachment_path text default null)
returns public.request_messages language plpgsql security definer set search_path=''
as $$
declare owner_id uuid:=auth.uid(); request_status text; normalized_message text:=btrim(coalesce(message_body,'')); normalized_attachment text:=nullif(btrim(coalesce(attachment_path,'')),''); result public.request_messages;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if normalized_attachment is null and char_length(normalized_message)=0 then raise exception 'Add a message or an image' using errcode='22023'; end if;
  if char_length(normalized_message)>5000 then raise exception 'Message must contain at most 5000 characters' using errcode='22023'; end if;
  if normalized_attachment is not null and (char_length(normalized_attachment)>1000 or split_part(normalized_attachment,'/',1)<>target_request_id or split_part(normalized_attachment,'/',2)<>owner_id::text) then raise exception 'Invalid attachment path' using errcode='22023'; end if;
  select status into request_status from public.review_requests where id=target_request_id and user_id=owner_id;
  if request_status is null then raise exception 'Request not found' using errcode='P0002'; end if;
  if request_status not in ('CONSULTATION','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then raise exception 'Conversation opens when artisan consultation begins' using errcode='22023'; end if;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,attachment_url)
  values(target_request_id,owner_id,'customer','Customer',case when normalized_message='' then 'Shared an image.' else normalized_message end,normalized_attachment) returning * into result;
  return result;
end;
$$;
revoke all on function public.send_customer_request_message_with_attachment(text,text,text) from public,anon,authenticated;
grant execute on function public.send_customer_request_message_with_attachment(text,text,text) to authenticated;
