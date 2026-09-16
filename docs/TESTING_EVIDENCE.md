# Gatherly testing evidence

## Automated checks

The following checks passed against the current project:

| Check | Result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm test` | Passed, 12 critical rule tests |
| `pnpm build` | Passed, all pages and API routes compiled |
| `pnpm test:e2e` | Passed against the running application and real database |
| `pnpm test:record` | Passed, 4 command checks and 29 individual cases recorded |
| Profile, registration-status, and feedback E2E coverage | Passed: profile edits, Zod status validation, admin status transitions, attended-event feedback, and duplicate feedback rejection are exercised |
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
8. Profile update for the newly created attendee.
9. Admin login and real statistics.
10. Invalid status rejection through Zod validation.
11. Admin reactivation and no-show status transitions.
12. Admin draft event creation and publication.
13. Registration for a completed test event.
14. Attended status and feedback submission.
15. Duplicate feedback rejection.
16. Safe deletion protection for events with registration history.
17. Every case is written to a machine readable JSON record and a submission friendly Markdown record.

The script is `tests/e2e.mjs`. The rule suite is `tests/rules.test.mjs`. Run `pnpm test:record` to run all checks and generate the complete record at `docs/test-records/latest.md` and `docs/test-records/latest.json`.

The current passing run contains 12 business rule cases and 17 API acceptance cases. Each row includes a stable ID, expected result, actual result, status, duration, and timestamp. The API suite also proves that cancelling a registration returns the reserved seat to the event capacity.

## Demo credentials

These are development credentials only.

Admin: `admin@nowshera-events.pk` with password `NowsheraAdmin123!`

Attendee: `ahmad@nowshera-events.pk` with password `NowsheraAttendee123!`

## Known limitations and honest handover notes

1. The live app is deployed at https://event-registration-management-syste-six.vercel.app and was reviewed after deployment.
2. The public repository is https://github.com/umarakbar6/event-registration-management-system.
3. SQLite remains available for self contained local review. The live deployment uses the PostgreSQL schema option and a seeded Neon database. The PostgreSQL database was initialized with the reviewed schema. The feedback E2E check intentionally creates a completed QA event so its history cannot be deleted through the safe-delete API.
4. Event images use public Unsplash image URLs for demo presentation. A production deployment can replace them with managed asset storage.
5. Payments, QR check in, reserved seating, SMS infrastructure, advanced ticket pricing, and production scale email delivery are outside the supplied project scope.
