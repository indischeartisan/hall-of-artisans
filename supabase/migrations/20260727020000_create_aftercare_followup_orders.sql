alter table public.review_requests
  add column if not exists parent_request_id text references public.review_requests(id) on delete restrict,
  add column if not exists follow_up_kind text check (follow_up_kind in ('ADJUSTMENT','REORDER'));

create index if not exists review_requests_parent_idx
  on public.review_requests(parent_request_id, created_at desc)
  where parent_request_id is not null;

create or replace function private.create_aftercare_case_legacy(
  target_request_id text,
  case_kind text,
  case_subject text,
  case_body text,
  case_rating smallint default null
)
returns public.aftercare_cases
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  request_row public.review_requests;
  result public.aftercare_cases;
  follow_up public.review_requests;
  actor_name text;
  stamp timestamptz := now();
begin
  if actor_id is null then raise exception 'Sign in is required' using errcode = '42501'; end if;
  select * into request_row from public.review_requests where id = target_request_id for update;
  if request_row.id is null or request_row.user_id <> actor_id then
    raise exception 'Completed project not found' using errcode = 'P0002';
  end if;
  if request_row.status <> 'COMPLETED' then
    raise exception 'Aftercare opens after delivery is complete' using errcode = '22023';
  end if;
  case_kind := upper(btrim(case_kind));
  if case_kind not in ('GRATITUDE','REVIEW','ISSUE','ADJUSTMENT','REORDER') then
    raise exception 'Choose a valid aftercare request' using errcode = '22023';
  end if;
  if case_subject is null or char_length(btrim(case_subject)) not between 1 and 160
    or case_body is null or char_length(btrim(case_body)) not between 1 and 5000 then
    raise exception 'Complete the subject and message' using errcode = '22023';
  end if;
  if case_kind = 'REVIEW' and case_rating is null then
    raise exception 'Choose a rating for your review' using errcode = '22023';
  end if;

  insert into public.aftercare_cases(review_request_id, user_id, assigned_reviewer_id, kind, subject, body, rating)
  values (request_row.id, actor_id, request_row.assigned_reviewer_id, case_kind, btrim(case_subject), btrim(case_body), case_rating)
  returning * into result;

  if case_kind in ('ADJUSTMENT','REORDER') then
    insert into public.review_requests(
      user_id, creation_id, request_number, status, creation_mode, preview_snapshot,
      submission_id, submission_snapshot, perfume_name, concentration, bottle_size,
      fragrance_direction, top_notes, heart_notes, base_notes, fragrance_brief,
      story_card_data, customer_notes, country_code, pricing_region, currency,
      estimated_price_min, estimated_price_max, final_price, selected_package_id,
      package_snapshot, assigned_reviewer_id, assigned_at, submitted_at,
      ready_for_payment_at, parent_request_id, follow_up_kind
    ) values (
      actor_id, extensions.gen_random_uuid()::text,
      'HOA-RV-' || to_char(stamp, 'YYYY') || '-' || lpad(nextval('public.review_request_number_seq')::text, 5, '0'),
      case when case_kind = 'REORDER' then 'READY_FOR_PAYMENT' else 'SUBMITTED' end,
      request_row.creation_mode, request_row.preview_snapshot,
      extensions.gen_random_uuid()::text, coalesce(request_row.submission_snapshot, request_row.preview_snapshot),
      request_row.perfume_name || case when case_kind = 'REORDER' then ' — Reorder' else ' — Adjustment' end,
      request_row.concentration, request_row.bottle_size, request_row.fragrance_direction,
      request_row.top_notes, request_row.heart_notes, request_row.base_notes,
      request_row.fragrance_brief, request_row.story_card_data,
      btrim(case_body), request_row.country_code, request_row.pricing_region, request_row.currency,
      request_row.estimated_price_min, request_row.estimated_price_max,
      case when case_kind = 'REORDER' then request_row.final_price else null end,
      request_row.selected_package_id, request_row.package_snapshot,
      request_row.assigned_reviewer_id, case when request_row.assigned_reviewer_id is null then null else stamp end,
      stamp, case when case_kind = 'REORDER' then stamp else null end,
      request_row.id, case_kind
    ) returning * into follow_up;

    update public.aftercare_cases
      set linked_review_request_id = follow_up.id, updated_at = stamp
      where id = result.id
      returning * into result;

    insert into public.request_messages(request_id, user_id, sender_role, sender_name, message, read_at)
    values (
      follow_up.id, actor_id, 'system', 'The Hall of Artisans',
      case when case_kind = 'REORDER'
        then 'Your reorder has been created from the preserved completed formula. Continue to checkout when ready.'
        else 'Your adjustment project has been created and linked to the completed original commission.' end,
      stamp
    );
    insert into public.request_activity(request_id, user_id, event_type, label, metadata)
    values (
      follow_up.id, actor_id, lower(case_kind),
      case when case_kind = 'REORDER' then 'Reorder created from completed commission' else 'Adjustment project created from completed commission' end,
      jsonb_build_object('actor','customer','parent_request_id',request_row.id,'aftercare_case_id',result.id)
    );
  end if;

  select display_name into actor_name from public.profiles where id = actor_id;
  insert into public.aftercare_messages(case_id, sender_id, sender_role, sender_name, message)
  values (result.id, actor_id, 'customer', coalesce(nullif(btrim(actor_name), ''), 'Customer'), btrim(case_body));
  return result;
end;
$$;

revoke all on function private.create_aftercare_case_legacy(text, text, text, text, smallint) from public, anon;
grant execute on function private.create_aftercare_case_legacy(text, text, text, text, smallint) to authenticated;

comment on column public.review_requests.parent_request_id is 'Immutable source commission for an adjustment or reorder follow-up.';
comment on column public.review_requests.follow_up_kind is 'Identifies a follow-up project created from completed aftercare.';
