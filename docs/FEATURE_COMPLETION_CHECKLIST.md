# Gatherly feature completion checklist

This checklist maps the attached AI SKOOL requirements to the current implementation.

## Attendee journey

- [x] Create an attendee account with validation and password hashing.
- [x] Sign in and sign out.
- [x] Browse published future events.
- [x] Search by event title or location.
- [x] Filter by availability and sort events.
- [x] View date, time, location, capacity, registered count, and remaining seats.
- [x] Register for an eligible event.
- [x] See a clear success notice after registration.
- [x] See personal registrations after refresh.
- [x] Cancel an active personal registration.
- [x] See cancellation status and released capacity.
- [x] Receive useful messages for full, closed, past, duplicate, and missing events.
- [x] Update the attendee profile.
- [x] Submit feedback for a completed event once.

## Admin journey

- [x] Sign in as an admin.
- [x] View real event, registration, attendee, and capacity totals.
- [x] Create an event as a draft or publish it immediately.
- [x] Edit event details and capacity.
- [x] Publish a draft event.
- [x] Mark an event completed or cancelled.
- [x] Prevent unsafe deletion of published events or events with history.
- [x] Search and filter events.
- [x] View all registrations with attendee name, email, event, date, and status.
- [x] Search and filter registrations.
- [x] Update a registration to attended or no show where operations permit.
- [x] Review reports for demand, status mix, and capacity utilization.
- [x] Copy or export a practical attendee list from the admin registration view.

## Rules and security

- [x] Enforce one active registration per attendee and event.
- [x] Enforce published status, future start time, and available capacity on the backend.
- [x] Prevent capacity overbooking with an atomic database reservation update.
- [x] Release a seat when an active registration is cancelled.
- [x] Prevent new registrations for cancelled or completed events.
- [x] Validate every mutation with Zod.
- [x] Protect admin operations with server side role checks.
- [x] Protect attendee records with ownership checks.
- [x] Use HTTP only session cookies and same site settings.
- [x] Use keyed HMAC hashes for stored session tokens.
- [x] Use a double submit CSRF token for mutations.
- [x] Keep secrets in environment variables.
- [x] Sanitize errors before returning them to the browser.

## Experience quality

- [x] Responsive desktop, tablet, and mobile layouts.
- [x] Accessible labels, focus states, semantic tables, and keyboard friendly controls.
- [x] Loading, empty, success, and error states.
- [x] Toast notifications for important actions.
- [x] Confirmation before cancellation.
- [x] Persistent database data after page refresh.
- [x] No critical browser errors in the verified events page.

## Evidence

- [x] README with setup, architecture, API, security, testing, and deployment notes.
- [x] Seed data with admin, attendee, published, nearly full, full, draft, cancelled, and completed events.
- [x] Prisma schema and migration.
- [x] PostgreSQL schema option.
- [x] Importable n8n registration workflow.
- [x] Rule test evidence and live API acceptance evidence.
- [x] Known limitations documented in `docs/TESTING_EVIDENCE.md`.
- [ ] Public hosted URL.
- [ ] GitHub repository URL with remote commits.

