# Gatherly testing evidence

## Automated checks

The following checks passed against the current project:

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm test` | Passed, 12 critical rule tests |
| `pnpm build` | Passed, all pages and API routes compiled |
| `pnpm test:e2e` | Passed against the running application and real database |
| `pnpm test:record` | Passed, 5 command checks and 22 individual cases recorded |
| Updated AI SKOOL PRD acceptance coverage | Passed: all ten PRD cases are recorded individually as `PRD-01` through `PRD-10` |
| Browser console error check | No errors on the verified events page |

## End to end evidence

The updated PRD acceptance script verifies these ten cases:

1. Register for an event.
2. Publish an event.
3. Register twice.
4. Full event.
5. Closed or past event.
6. Cancel a registration and reuse the place.
7. Wrong capacity: zero, negative, decimal, and below current registrations.
8. Attendee attempts admin pages and direct admin actions.
9. Attendee attempts to open someone else's registration.
10. Event-specific attendee list, active totals, search/export/copy controls, and refresh-stable dashboard totals.

The script is `tests/e2e.mjs`. The rule suite is `tests/rules.test.mjs`. Run `pnpm test:record` to run all checks and generate the complete record at `docs/test-records/latest.md` and `docs/test-records/latest.json`.

The current passing run contains 12 business rule cases and 10 PRD acceptance cases. Each row includes a stable ID, expected result, actual result, status, duration, and timestamp. The PRD suite also proves that cancelling a registration returns the reserved seat and lets a different attendee take it.

## Demo credentials

These are development credentials only.

Admin: `admin@example.com` with password `Admin123!`

Attendee: `alex@example.com` with password `Attendee123!`

## Known limitations and honest handover notes

1. The live app is deployed at https://event-registration-management-syste-six.vercel.app and was reviewed after deployment.
2. The public repository is https://github.com/umarakbar6/event-registration-management-system.
3. SQLite remains available for self contained local review. The live deployment uses the PostgreSQL schema option and a seeded Neon database. The local PRD recorder resets only its development SQLite fixtures before each deterministic run.
4. Event images use public Unsplash image URLs for demo presentation. A production deployment can replace them with managed asset storage.
5. Payments, QR check in, reserved seating, SMS infrastructure, advanced ticket pricing, and production scale email delivery are outside the supplied project scope.
