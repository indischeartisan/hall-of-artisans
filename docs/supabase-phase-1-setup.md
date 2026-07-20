# Supabase Phase 1 Setup

Phase 1 adds only the authentication foundation: `profiles`, `user_roles`, `artisan_ids`, RLS, provisioning triggers, trusted RPCs, a browser client, and auth wrappers. Drafts, submissions, chat, orders, checkout, payments, Hall Archive, and admin UI remain local.

## Package manager

`pnpm-lock.yaml` is authoritative and `packageManager` pins pnpm 11.9.0. The stale npm lockfile was removed during activation preparation; do not regenerate it.

## Credentials

Copy `.env.example` to `.env.local` and add the project URL and browser anon/publishable key. The anon key is constrained by RLS. A service-role/secret key bypasses RLS and must live only in a trusted server, Edge Function, CI secret manager, or manual admin environment—never in `VITE_*`, React, logs, or committed files. Credentials from `supabase start` are local-only.

## CLI and migrations

Local development requires the official Supabase CLI and a supported container runtime:

```bash
supabase start
supabase db reset
supabase status
supabase db lint
```

`db reset` is destructive to the selected local database. Verify the target. To use a hosted development project:

```bash
supabase login
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_REF
supabase db push --dry-run
supabase db push
```

Use separate development, staging, and production projects. Migration order is helpers/enums, profiles/roles, Artisan IDs, then RLS/role management. Stable Phase 1 role and Artisan ID states use PostgreSQL enums. Workflow enums are deferred because those tables are out of scope.

## Provisioning and Artisan ID

The auth trigger creates a profile and only `customer`. Display-name metadata initializes a non-privileged field; role metadata is ignored. Users may hold multiple roles, with `customer` as the least-privileged baseline and each additional role stored as a separate auditable assignment. Call `complete_profile(display_name)` after onboarding and `issue_artisan_id()` only afterward. Issuance verifies `auth.users.email_confirmed_at`, profile completion, and suspension/deletion state.

Public numbers use a concurrency-safe PostgreSQL sequence: `HA-YYYY-000001`. The year is the issuance year and the numeric sequence is global rather than annually reset. Repeated issuance returns the permanent existing row. Card reissue never changes the number.

## First super-admin

Normal signup and seed never create privileged users. After creating and verifying the intended account, use SQL Editor or a trusted local SQL session with the exact Auth UUID:

```sql
insert into public.user_roles(user_id, role, reason)
values ('EXACT-AUTH-USER-UUID', 'super_admin', 'Initial trusted bootstrap')
on conflict (user_id, role)
do update set revoked_at = null, reason = excluded.reason;
```

Never bootstrap by email domain, signup metadata, or production seed. Later trusted operations use `assign_app_role` and `revoke_app_role`.

## Generated types

`src/types/database.types.ts` is temporary and hand-maintained. After migrations run, replace it:

```bash
supabase gen types typescript --local > src/types/database.types.ts
# or
supabase gen types typescript --linked > src/types/database.types.ts
```

Review the diff and rebuild.

## RLS checks

Use two ordinary verified users and one trusted admin. Verify anonymous denial, own/other profile isolation, approved profile-column updates, self-role escalation denial, own Artisan ID visibility, number/status update denial, and concurrent unique issuance. Service-role tests belong only in trusted test code.

`diagnoseSupabaseConnection()` is nonvisual and development-only. It reports not configured, unreachable, reachable, or schema not migrated without printing credentials or private rows.

Phase 1 does not read, migrate, update, or delete existing `localStorage` data. Local-to-cloud migration is a later explicit phase.
