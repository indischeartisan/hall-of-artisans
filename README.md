# The Hall of Artisans

Vite + React + TypeScript application for The Hall of Artisans / Indische World.

Supabase Phase 1 setup and security guidance is documented in [`docs/supabase-phase-1-setup.md`](docs/supabase-phase-1-setup.md). Registration, login, profiles, roles, and Artisan IDs use Supabase Auth and Postgres; customer draft/order workflow persistence remains local until later phases.

## Application routes

- `/` — main entrance
- `/hall` — The Hall lobby
- `/academy` — The Academy
- `/library` — The Library
- `/chamber-of-creation` — creation mode selection
- `/artisan-bench` — Artisan Bench perfume simulator
- `/bespoke-atelier` — Bespoke Atelier
- `/artisan-register` — Artisan registration
- `/artisan-login` — secure returning-artisan access through Supabase Auth
- `/my-artisan-id` — personal Artisan ID ledger
- `/hall-archive` — public Hall Archive

All primary pages are rendered by React Router. `index.html` is the only HTML entry point.

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

The production build includes TypeScript project checking through `tsc -b`.

## Project structure

- `src/pages/` — route-level React pages
- `src/components/` — shared React UI
- `src/data/` — application data modules
- `src/styles/` — React page styles
- `public/assets/` — public images, icons, backgrounds, legacy data/behavior scripts, and page styles

The Academy, Library, and Artisan Bench still load their existing legacy behavior scripts from `public/assets/js`. These are retained temporarily to preserve their mature interactive behavior while the rest of the application is fully routed through React.
