# The Hall of Artisans

Vite + React + TypeScript application for The Hall of Artisans / Indische World.

The customer experience is connected to Supabase Auth and Postgres. Registration, login, profiles, Artisan IDs, drafts, creation previews, review requests, messages, activity, and order records are persisted with row-level security. Payment confirmation and staff operations are intentionally still simulated until the Admin Portal stage.

## Application routes

- `/` — main entrance
- `/hall` — The Hall lobby
- `/academy` — The Academy
- `/library` — The Library
- `/chamber-of-creation` — creation mode selection
- `/describe-your-creation` — story-led creation form
- `/artisan-bench` — structured perfume builder
- `/my-drafts` — full draft workspace
- `/my-artisan-id` — personal identity and record chamber
- `/my-orders/:requestId` — unified customer Project Room
- `/checkout/:requestId` — development checkout
- `/bespoke-atelier` — Bespoke Atelier
- `/artisan-register` — Artisan registration
- `/artisan-login` — returning-artisan access through Supabase Auth
- `/hall-archive` — public Hall Archive
- `/admin` — role-gated reviewer and administrator workspace

All primary pages are rendered by React Router. `index.html` is the only HTML entry point.

## Project Room workflow

My Orders uses one customer-facing Project Room with views selected by the persisted workflow status:

1. Creation preparation and preview
2. Artisan review and conversation
3. Customer approval or revision request
4. Checkout, production, shipping, and completion
5. Preserved closed-project record for cancelled requests

The My Orders picker separates active projects, creation previews, and collapsed closed projects. Submitted records are preserved even if the original editable draft changes.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm preview
```

`pnpm test` checks the 13-status workflow contract, Project Room routing, and My Orders grouping. The production build includes TypeScript project checking through `tsc -b`.

## Project structure

- `src/pages/` — route-level React pages
- `src/features/` — domain-focused customer workflows
- `src/components/` — shared React UI
- `src/contexts/` — authentication, theme, and draft state
- `src/domain/` — creation and workflow contracts
- `src/styles/` — page and feature styles
- `supabase/migrations/` — database schema and workflow migrations
- `public/assets/` — images, icons, backgrounds, and retained legacy assets

The Academy and Library still use retained legacy behavior scripts. They remain a known modernization task after the Admin Portal foundation.

For the current implementation boundary and next stage, see [`docs/project-status.md`](docs/project-status.md). Supabase setup and security guidance is in [`docs/supabase-phase-1-setup.md`](docs/supabase-phase-1-setup.md).
