create or replace function private.delete_linked_draft_previews()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.review_requests
    where user_id = old.user_id
      and submission_id is not null
      and preview_snapshot ->> 'sourceDraftId' = old.id::text
  ) then
    raise exception 'This draft cannot be deleted because its creation has already been submitted.'
      using errcode = '23503';
  end if;

  delete from public.review_requests
  where user_id = old.user_id
    and status = 'DRAFT_PREVIEW'
    and preview_snapshot ->> 'sourceDraftId' = old.id::text;

  return old;
end;
$$;

revoke all on function private.delete_linked_draft_previews() from public, anon, authenticated;

drop trigger if exists creation_drafts_delete_linked_previews on public.creation_drafts;
create trigger creation_drafts_delete_linked_previews
before delete on public.creation_drafts
for each row execute function private.delete_linked_draft_previews();

delete from public.review_requests as request
where request.status = 'DRAFT_PREVIEW'
  and (
    nullif(request.preview_snapshot ->> 'sourceDraftId', '') is null
    or not exists (
      select 1
      from public.creation_drafts as draft
      where draft.id::text = request.preview_snapshot ->> 'sourceDraftId'
        and draft.user_id = request.user_id
    )
  );
