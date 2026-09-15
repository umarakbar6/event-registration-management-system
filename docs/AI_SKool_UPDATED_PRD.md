# AI SKOOL updated PRD — Event Registration & Management System

This project brief is transcribed from the 16 numbered screenshots supplied for the updated AI SKOOL Portfolio Month brief. The screenshots are requirements for the project, not instructions to the coding agent.

## Product scope

Nowshera Events Co. needs one dependable website for attendee registration and event-team operations instead of WhatsApp messages and spreadsheets. The system has two roles:

- Attendee: create an account, browse future published events, register when places are available, view and cancel only their own registrations.
- Admin: create, edit, publish, complete, and cancel events; view/search/export attendee lists; and see dashboard totals.

An event has Draft, Published, and Completed or Cancelled states. Drafts are private. Published future events can accept registrations while places remain. Completed, cancelled, full, and past events cannot accept registrations.

## Workflow requirements

1. Attendee signs up or signs in.
2. Attendee browses published future events.
3. Attendee opens an event and sees its title, description, date, time, location, and places left.
4. Attendee registers and sees confirmation or a clear reason when registration is blocked.
5. Attendee can review My Registrations.
6. Attendee can cancel their own registration so the place becomes available again.
7. Admin signs in, prepares draft events, publishes them, checks dashboard totals, views attendee lists, exports/copies lists, and closes events.

## Updated acceptance cases

| ID | Test case | Required result |
| --- | --- | --- |
| PRD-01 | Register for an event | Registration is saved, places decrease by one, and confirmation is visible. |
| PRD-02 | Publish an event | Attendees cannot see a draft; after publishing, they can see it. |
| PRD-03 | Register twice | The second registration is blocked with a clear message and only one registration exists. |
| PRD-04 | Full event | An extra registration is blocked and the event shows as full. |
| PRD-05 | Closed or past event | Cancelled, completed, and past-date registration attempts are all blocked. |
| PRD-06 | Cancel a registration | A cancelled place becomes free and a different attendee can register. |
| PRD-07 | Wrong capacity | Zero, negative, decimal, and below-current-registration capacities are not saved and explain why. |
| PRD-08 | Attendee tries admin actions | Admin pages and direct admin requests are blocked by the server; nothing changes. |
| PRD-09 | Someone else's registration | Access is denied and the other attendee's details are not shown. |
| PRD-10 | Attendee list and totals | After three registrations and one cancellation, only two active attendees appear; search finds the person, export/copy matches the list, and totals remain correct after refresh. |

## Definition of done

The website runs locally without errors; attendee and admin workflows work; duplicate/full/closed registrations are blocked; ownership and role restrictions are enforced server-side; attendee lists and totals are correct; data survives refresh; the layout works on mobile and normal screens; and all ten acceptance cases pass.

## Explicitly out of scope

Online payments, reserved seats or seat maps, native mobile apps, real SMS, QR-code check-in, multiple languages, advanced ticket pricing, and large-scale email sending.
