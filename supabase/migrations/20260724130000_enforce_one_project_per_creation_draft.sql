with ranked_projects as (
  select
    id,
    row_number() over (
      partition by user_id, preview_snapshot ->> 'sourceDraftId'
      order by
        (submission_id is not null) desc,
        updated_at desc,
        created_at desc,
        id desc
    ) as project_rank
  from public.review_requests
  where nullif(preview_snapshot ->> 'sourceDraftId', '') is not null
)
delete from public.review_requests as request
using ranked_projects as ranked
where request.id = ranked.id
  and ranked.project_rank > 1;

create unique index review_requests_one_project_per_draft_idx
  on public.review_requests (user_id, ((preview_snapshot ->> 'sourceDraftId')))
  where nullif(preview_snapshot ->> 'sourceDraftId', '') is not null;

create or replace function public.create_review_preview(request_payload jsonb)
returns public.review_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  result public.review_requests;
  requested_id text := nullif(btrim(request_payload ->> 'id'), '');
  snapshot jsonb := request_payload -> 'previewSnapshot';
  source_draft_id text;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if request_payload is null or jsonb_typeof(request_payload) <> 'object' then raise exception 'Invalid request payload' using errcode = '22023'; end if;
  if snapshot is null or jsonb_typeof(snapshot) <> 'object' then raise exception 'A creation snapshot is required' using errcode = '22023'; end if;

  source_draft_id := nullif(btrim(snapshot ->> 'sourceDraftId'), '');

  if requested_id is not null then
    select * into result
    from public.review_requests
    where id = requested_id
      and user_id = owner_id
      and status = 'DRAFT_PREVIEW'
    for update;
  end if;

  if result.id is null and source_draft_id is not null then
    select * into result
    from public.review_requests
    where user_id = owner_id
      and preview_snapshot ->> 'sourceDraftId' = source_draft_id
    for update;

    if result.id is not null and result.status <> 'DRAFT_PREVIEW' then
      raise exception 'This draft already has a submitted project in My Orders.' using errcode = '23505';
    end if;
  end if;

  if result.id is null then
    insert into public.review_requests(
      id,user_id,creation_id,creation_mode,preview_snapshot,perfume_name,concentration,bottle_size,
      fragrance_direction,top_notes,heart_notes,base_notes,fragrance_brief,story_card_data,
      customer_notes,country_code,pricing_region,currency,estimated_price_min,estimated_price_max
    ) values (
      coalesce(requested_id, extensions.gen_random_uuid()::text), owner_id,
      coalesce(nullif(request_payload ->> 'creationId',''), extensions.gen_random_uuid()::text),
      (request_payload ->> 'creationMode')::public.creation_mode, snapshot,
      btrim(request_payload ->> 'perfumeName'), btrim(request_payload ->> 'concentration'),
      coalesce(nullif(btrim(request_payload ->> 'bottleSize'),''),'To be confirmed'),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'fragranceDirection','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'topNotes','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'heartNotes','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'baseNotes','[]'::jsonb))),
      coalesce(request_payload ->> 'fragranceBrief',''), coalesce(request_payload -> 'storyCardData','{}'::jsonb),
      coalesce(request_payload ->> 'customerNotes',''), coalesce(nullif(request_payload ->> 'countryCode',''),'ID'),
      coalesce(nullif(request_payload ->> 'pricingRegion',''),'Indonesia'), coalesce(nullif(request_payload ->> 'currency',''),'IDR'),
      coalesce((request_payload ->> 'estimatedPriceMin')::bigint,699000),
      coalesce((request_payload ->> 'estimatedPriceMax')::bigint,1499000)
    ) returning * into result;
  else
    update public.review_requests set
      preview_snapshot = snapshot,
      creation_mode = (request_payload ->> 'creationMode')::public.creation_mode,
      perfume_name = btrim(request_payload ->> 'perfumeName'),
      concentration = btrim(request_payload ->> 'concentration'),
      bottle_size = coalesce(nullif(btrim(request_payload ->> 'bottleSize'),''),'To be confirmed'),
      fragrance_direction = array(select jsonb_array_elements_text(coalesce(request_payload -> 'fragranceDirection','[]'::jsonb))),
      top_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'topNotes','[]'::jsonb))),
      heart_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'heartNotes','[]'::jsonb))),
      base_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'baseNotes','[]'::jsonb))),
      fragrance_brief = coalesce(request_payload ->> 'fragranceBrief',''),
      story_card_data = coalesce(request_payload -> 'storyCardData','{}'::jsonb),
      customer_notes = coalesce(request_payload ->> 'customerNotes','')
    where id = result.id
    returning * into result;
  end if;

  return result;
exception
  when unique_violation then
    raise exception 'This draft already has a project in My Orders.' using errcode = '23505';
end;
$$;

revoke all on function public.create_review_preview(jsonb) from public, anon, authenticated;
grant execute on function public.create_review_preview(jsonb) to authenticated;
