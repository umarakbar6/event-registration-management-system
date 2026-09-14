# Gatherly screenshot evidence

The submission includes captures from the deployed Gatherly application and the database schema. The live application is available at https://event-registration-management-syste-six.vercel.app. Every capture listed below is stored in this repository under `docs/screenshots/` and is rendered in the README.

| Capture | Page | Evidence to show | Stored file |
| --- | --- | --- | --- |
| 1 | `/` | Product value, browse events, and account calls to action | `docs/screenshots/01-home.png` |
| 2 | `/events` | Published events, search, availability, and sorting | `docs/screenshots/02-events.png` |
| 3 | `/events/[id]` | Event details, capacity, remaining seats, and registration state | `docs/screenshots/03-event-details.png` |
| 4 | `/login` | Attendee sign-in form and validation entry point | `docs/screenshots/04-login.png` |
| 5 | `/register` | Attendee account creation form | `docs/screenshots/05-register.png` |
| 6 | `/dashboard` | Attendee welcome, totals, upcoming registrations, and quick actions | `docs/screenshots/06-dashboard.png` |
| 7 | `/dashboard/registrations` | Personal history, cancellation action, and completed-event feedback UI | `docs/screenshots/07-dashboard-registrations.png` |
| 8 | `/admin` | Real statistics and events nearing capacity | `docs/screenshots/08-admin.png` |
| 9 | `/admin/events` | Event lifecycle controls and capacity table | `docs/screenshots/09-admin-events.png` |
| 10 | `/admin/registrations` | Attendee list, search, filters, and status controls | `docs/screenshots/10-admin-registrations.png` |
| 11 | `/admin/reports` | Demand chart, status breakdown, and capacity utilization | `docs/screenshots/11-admin-reports.png` |
| 12 | Database schema | Entity relationships from `docs/DATABASE_SCHEMA.md` and `prisma/schema.prisma` | `docs/screenshots/12-database-schema.png` |

The Nowshera location update is present in the database seed and the deployed event data. The admin report capture also shows full-capacity events as `At capacity`, while `Cancelled` is reserved for genuinely cancelled events.
