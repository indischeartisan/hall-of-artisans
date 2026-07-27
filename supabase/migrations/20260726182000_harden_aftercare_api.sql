create index aftercare_cases_user_idx on public.aftercare_cases(user_id, updated_at desc);
create index aftercare_cases_linked_request_idx on public.aftercare_cases(linked_review_request_id) where linked_review_request_id is not null;
create index aftercare_messages_sender_idx on public.aftercare_messages(sender_id, created_at desc);

alter function public.create_aftercare_case(text, text, text, text, smallint) rename to create_aftercare_case_legacy;
alter function public.send_aftercare_message(uuid, text) rename to send_aftercare_message_legacy;
alter function public.resolve_aftercare_case(uuid) rename to resolve_aftercare_case_legacy;

alter function public.create_aftercare_case_legacy(text, text, text, text, smallint) set schema private;
alter function public.send_aftercare_message_legacy(uuid, text) set schema private;
alter function public.resolve_aftercare_case_legacy(uuid) set schema private;

create function public.create_aftercare_case(target_request_id text, case_kind text, case_subject text, case_body text, case_rating smallint default null)
returns public.aftercare_cases language sql security invoker set search_path = ''
as $$ select private.create_aftercare_case_legacy(target_request_id, case_kind, case_subject, case_body, case_rating); $$;

create function public.send_aftercare_message(target_case_id uuid, message_body text)
returns public.aftercare_messages language sql security invoker set search_path = ''
as $$ select private.send_aftercare_message_legacy(target_case_id, message_body); $$;

create function public.resolve_aftercare_case(target_case_id uuid)
returns public.aftercare_cases language sql security invoker set search_path = ''
as $$ select private.resolve_aftercare_case_legacy(target_case_id); $$;

revoke all on function private.create_aftercare_case_legacy(text, text, text, text, smallint) from public, anon;
revoke all on function private.send_aftercare_message_legacy(uuid, text) from public, anon;
revoke all on function private.resolve_aftercare_case_legacy(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.create_aftercare_case_legacy(text, text, text, text, smallint) to authenticated;
grant execute on function private.send_aftercare_message_legacy(uuid, text) to authenticated;
grant execute on function private.resolve_aftercare_case_legacy(uuid) to authenticated;

revoke all on function public.create_aftercare_case(text, text, text, text, smallint) from public, anon;
revoke all on function public.send_aftercare_message(uuid, text) from public, anon;
revoke all on function public.resolve_aftercare_case(uuid) from public, anon;
grant execute on function public.create_aftercare_case(text, text, text, text, smallint) to authenticated;
grant execute on function public.send_aftercare_message(uuid, text) to authenticated;
grant execute on function public.resolve_aftercare_case(uuid) to authenticated;
