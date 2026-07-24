create or replace function private.delete_linked_draft_previews()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.review_requests
  where user_id = old.user_id
    and status = 'DRAFT_PREVIEW'
    and preview_snapshot ->> 'sourceDraftId' = old.id::text;

  return old;
end;
$$;

revoke all on function private.delete_linked_draft_previews() from public, anon, authenticated;
