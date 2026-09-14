# Gatherly testing evidence

## Automated checks

The following checks passed against the current project:

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm test` | Passed, 12 critical rule tests |
| `pnpm build` | Passed, all pages and API routes compiled |
| `pnpm test:e2e` | Passed against the running application and real database |
| Feedback workflow review | Passed: attendee UI and client helper are wired, only attended events after their end time qualify, and a second submission is rejected |
| n8n JSON parse | Passed |
| n8n Code node syntax | Passed |
| Browser console error check | No errors on the verified events page |

## End to end evidence

The live API acceptance script verifies:

1. Public event discovery.
2. A new attendee registration.
3. Attendee denial for admin event creation.
4. Full event rejection.
5. Valid registration.
6. Duplicate registration rejection.
7. Attendee cancellation and seat release.
8. Admin login and real statistics.
9. Admin draft event creation.
10. Draft publication.
11. Safe deletion protection for published events.
12. Draft cleanup after the test.

The script is `tests/e2e.mjs`. The rule suite is `tests/rules.test.mjs`.

## Demo credentials

These are development credentials only.

Admin: `admin@example.com` with password `Admin123!`

Attendee: `alex@example.com` with password `Attendee123!`

## Known limitations and honest handover notes

1. The live app is deployed at https://event-registration-management-syste-six.vercel.app and was reviewed after deployment.
2. The public repository is https://github.com/umarakbar6/event-registration-management-system.
3. The n8n workflow is importable and the application webhook sender is implemented. It is not connected to an external n8n account yet.
4. SQLite remains available for self contained local review. The live deployment uses the PostgreSQL schema option and a seeded Neon database. The PostgreSQL database was initialized with the reviewed schema.
5. Event images use public Unsplash image URLs for demo presentation. A production deployment can replace them with managed asset storage.
6. Payments, QR check in, reserved seating, SMS infrastructure, advanced ticket pricing, and production scale email delivery are outside the supplied project scope.
