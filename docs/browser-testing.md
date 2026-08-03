# Browser testing

The Playwright suite protects the public creation journey, responsive layouts, Project Room surface, and customer/staff access boundaries.

## Local deterministic suite

```bash
corepack pnpm test:e2e
```

The configuration reuses `http://127.0.0.1:4173` when it is already running and otherwise starts Vite automatically. On Windows it uses the installed Microsoft Edge channel. In CI, install Chromium before running the suite:

```bash
corepack pnpm exec playwright install --with-deps chromium
corepack pnpm test:e2e
```

## Live role handoff

Copy the names from `.env.e2e.example` into local environment variables or CI secrets. Use dedicated customer, perfumer, and admin test accounts plus one seeded request visible to all three roles. Then run:

```bash
corepack pnpm test:e2e:live
```

The repository never stores the passwords. The live suite is skipped when the complete credential set is absent.

## Known workflow gate

The suite marks proposal approval and revision as `fixme`. `ApprovalRoom` exists, but `READY_FOR_PAYMENT` currently opens `FulfillmentRoom`, so there is no persisted customer approval/revision handoff before checkout. Resolve the product status and database transition before enabling that test.
