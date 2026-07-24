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
    and preview_snapshot ->> 'sourceDraftId' = old.id;

  return old;
end;
$$;

revoke all on function private.delete_linked_draft_previews() from public, anon, authenticated;

drop trigger if exists creation_drafts_delete_linked_previews on public.creation_drafts;
create trigger creation_drafts_delete_linked_previews
after delete on public.creation_drafts
for each row execute function private.delete_linked_draft_previews();

comment on function private.delete_linked_draft_previews() is
  'Deletes only draft-preview review requests linked to a deleted creation draft; submitted workflow records remain immutable.';
