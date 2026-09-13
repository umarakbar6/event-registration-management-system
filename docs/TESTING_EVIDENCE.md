# Gatherly testing evidence

## Live verification

Live application: https://event-registration-management-syste-six.vercel.app

Public repository: https://github.com/umarakbar6/event-registration-management-system

The deployed application uses Neon PostgreSQL with the seeded evaluation data.

## Automated checks

| Check | Result |
| --- | --- |
| pnpm typecheck | Passed |
| pnpm test | Passed, 12 critical business rule tests |
| pnpm build | Passed, all pages and API routes compiled |
| pnpm test:e2e | Passed against the application and real database |
| n8n workflow JSON parse | Passed |
| n8n Code node syntax | Passed |
| Browser console review | No errors on the verified events page |

## Live smoke review

The following behavior was verified on the deployed application:

1. Public event discovery loads real database records.
2. Event capacity and remaining seats are shown correctly.
3. Attendee login succeeds with the evaluation account.
4. Attendee dashboard shows real registrations and Nowshera event locations.
5. Attendee access to the admin area is denied by the server.
6. Logout succeeds and a signed out user is redirected to login for protected pages.
7. Admin login succeeds with the evaluation account.
8. Admin dashboard shows real event, registration, attendee, and capacity totals.
9. Admin event management shows draft, published, cancelled, and completed events.
10. Admin registration management shows real attendee records and export controls.
11. Reports show registration counts and capacity utilization from the database.

## Business rule evidence

The automated acceptance flow verifies public discovery, valid registration, attendee denial for admin event creation, full event rejection, duplicate registration rejection, attendee cancellation, and seat release.

The registration service uses a database transaction with an atomic capacity update and a unique active registration constraint. This prevents duplicate active records and prevents the final seat from being assigned twice.

## Evaluation accounts

Admin: admin@example.com / Admin123!

Attendee: alex@example.com / Attendee123!

These accounts are for development and evaluation only.

## Known limitations

The brief excludes online payments, reserved seating, native mobile applications, real SMS infrastructure, QR code check in, multi language support, advanced ticket pricing, and production scale email delivery.

The n8n workflow is included and validated for import. No external n8n account was connected because it is optional in the brief.
