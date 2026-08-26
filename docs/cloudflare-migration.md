# Cloudflare Pages migration

This application is a Vite/React single-page application. Cloudflare Pages hosts
the compiled frontend while Supabase remains responsible for Auth, Postgres,
Realtime, and Storage. No Pages Functions, Workers, D1, KV, or R2 bindings are
required for the current architecture.

## Pages project settings

- Repository: `indischeartisan/hall-of-artisans`
- Production branch: `main`
- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: repository root
- Build system: v3
- Node version: `22.16.0` (pinned by `.node-version`)
- Build environment variable: `PNPM_VERSION=11.9.0`

Cloudflare Pages treats a deployment without a top-level `404.html` as a SPA,
so React Router deep links are served through `index.html` automatically.

## Build environment

Configure these variables separately for Preview and Production:

```text
VITE_APP_ENV
VITE_BETA_MODE
VITE_SITE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`PNPM_VERSION=11.9.0` is a Cloudflare build variable rather than an application
variable. Set it in both environments so Pages uses the package-manager version
pinned in `package.json` instead of the build image default.

Only the Supabase publishable key belongs in the frontend. Never add a secret
key or service-role key to a `VITE_*` variable because Vite embeds those values
in the browser bundle.

For preview deployments, `VITE_SITE_URL` may be left empty so auth redirects use
the current browser origin. For production, set it to the exact final domain.

## Supabase Auth cutover

Before testing account flows on Cloudflare:

1. Add the Cloudflare preview URL to Authentication > URL Configuration > Redirect URLs.
2. Test registration, confirmation, login, logout, and password reset.
3. When the final domain is ready, set it as the Supabase Site URL and add exact
   redirect paths used by the application.
4. Retain the Vercel URL during the rollback window, then remove it after the
   Cloudflare deployment has been stable and verified.

## Cutover rule

Do not remove `vercel.json`, disconnect Vercel, or change production DNS until a
Cloudflare preview passes the release tests. Vercel remains the rollback target
during migration.
