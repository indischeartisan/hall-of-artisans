-- Keep the browser-facing authenticated role limited to the CRUD operations
-- used by the creation draft repository. RLS policies continue to restrict
-- every operation to rows owned by auth.uid().
revoke all privileges on table public.creation_drafts from authenticated;

grant select, insert, update, delete
on table public.creation_drafts
to authenticated;
