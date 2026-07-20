# Frontend Domain Decisions Before Supabase

Status: approved and locked for Phase 1 migrations. Workflow source of truth: `src/domain/workflow.ts`. Creation snapshot source of truth: `src/domain/creation.ts`.

## Authentication and Artisan ID

- Use email/password. Email verification is required before submission or checkout.
- Visitors may use Artisan Bench and keep anonymous drafts in `localStorage`.
- Authentication is required for cloud drafts, submission, My Orders, My Archive, and checkout.
- First-login local-draft migration comes later; forgot password uses Supabase email reset.
- One account has one active Artisan ID.
- The ID is issued after completed registration and verified email, without initial manual approval.
- The database generates one permanent number. Display-name updates and visual-card reissue do not change it.
- Historical creator snapshots survive profile edits; administrative suspension preserves history.
- Local registration uses explicitly non-production `PROTO-LOCAL-*` identifiers.

## Roles and permission matrix

Unauthenticated visitors are not stored as roles.

| Capability | Customer | Reviewer | Admin | Super admin |
|---|---|---|---|---|
| Draft ownership | Own only | No | Policy-based support | Audited support |
| Submission visibility | Own | Assigned | Operational | All |
| Chat | Own threads | Assigned | Operational | All |
| Review transitions | Submit/reply/approve/revise/eligible cancel | Review transitions | Review/operations | All operations |
| Price setting | No | No | Yes | Yes |
| Payment state | No | No | Provider reconciliation | Provider reconciliation |
| Production/shipping | Read own | Read assigned | Change | Change |
| Archive publishing | No | Propose | Publish | Publish |
| Role assignment | No | No | No | Yes |
| Internal notes | No | Assigned notes | Yes | Yes |

Prototype actor mapping is explicit: customer UI=`customer`; artisan fixture=`reviewer`; price/production tools=`admin`; mock provider=`system`.

## Data boundaries

- Public: published Hall Archive entries, public artwork, optional creator display snapshot.
- Customer-private: drafts, profile, contact/address, submissions, chat, orders, payment state, My Archive.
- Internal: reviewer/admin notes, costing, assignment, refund notes, administrative audit events, sensitive operations.

Customer view models do not include internal fields.

## Lifecycle and checkout

- Draft is editable source work. Preview is local and excluded from the review queue.
- `Send for Review` creates an immutable, schema-versioned submission snapshot.
- Both `artisan_bench` and `described` modes produce `CreationSubmissionSnapshot` through deliberate deep-cloning builders.
- Order items reference stable submission IDs/snapshots, never editable drafts.
- Checkout accepts only `READY_FOR_CHECKOUT` submissions with positive admin-set final price and valid currency.
- One order has one or more items and exactly one currency.
- Each item has production/shipping state. Combined shipping is default; split shipping is contract-only for now.
- Checkout creates `PAYMENT_PENDING`; only system/admin confirms `PAID`; only admin starts production.
- Paid-item cancellation is administrative, never a direct customer action.

