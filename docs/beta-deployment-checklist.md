# Beta deployment checklist

The beta environment is intentionally separate from production. It uses mock checkout only and must not contain real customer or payment data.

## One-time setup

- [ ] Create a persistent Supabase beta/staging project or persistent branch.
- [ ] Apply every file in `supabase/migrations` in timestamp order.
- [ ] Confirm all public tables have RLS and the intended `anon`/`authenticated` grants.
- [ ] Confirm the `archive-images` and material image Storage buckets and policies exist.
- [ ] Create dedicated beta admin and perfumer accounts; assign roles through the trusted admin process.
- [ ] In Supabase Auth URL Configuration, set the beta domain as Site URL.
- [ ] Add exact beta callbacks for `/artisan-login`, `/artisan-reset-password`, `/admin/login`, and `/perfumer/login` as allowed redirect URLs.
- [ ] Create a Vercel project and add the values from `.env.beta.example` to its Beta/Preview environment.
- [ ] Keep service-role/secret keys out of all `VITE_*` variables.

## Before every beta release

1. Run `pnpm test:beta`.
2. Review migrations added since the previous release.
3. Build with `VITE_BETA_MODE=true` and confirm the Beta badge is visible.
4. Verify checkout still says mock/development and cannot mark an order paid from the customer client.
5. Test a fresh account: registration, email confirmation, login, password reset, and logout.
6. Test one creation through draft, submission, perfumer review, consultation, mock checkout, admin production, delivery, aftercare, and Hall Archive setup.
7. Test direct navigation and refresh on nested routes such as `/my-orders/:id`, `/admin/orders`, and `/perfumer/creations`.
8. Test mobile modal scrolling and image uploads.

## Release rule

Beta deployments may be updated incrementally. Do not promote beta data to production automatically. Promote only reviewed code and migrations; create production records separately.
