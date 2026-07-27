drop index if exists public.review_requests_one_project_per_draft_idx;

create unique index review_requests_one_project_per_draft_idx
  on public.review_requests(user_id, (preview_snapshot ->> 'sourceDraftId'))
  where nullif(preview_snapshot ->> 'sourceDraftId', '') is not null
    and parent_request_id is null;
