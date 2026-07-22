revoke all on function public.assign_app_role(uuid, public.app_role, text)
  from public, anon, authenticated;

revoke all on function public.revoke_app_role(uuid, public.app_role)
  from public, anon, authenticated;

revoke all on function public.manage_artisan_id(uuid, public.artisan_id_status)
  from public, anon, authenticated;

grant execute on function public.assign_app_role(uuid, public.app_role, text)
  to service_role;

grant execute on function public.revoke_app_role(uuid, public.app_role)
  to service_role;

grant execute on function public.manage_artisan_id(uuid, public.artisan_id_status)
  to service_role;
