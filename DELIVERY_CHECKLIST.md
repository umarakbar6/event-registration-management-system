# Gatherly delivery checklist

This document is the handover format requested by the AI SKOOL Delivery checklist shown in the attached screenshots. The screenshots are treated as project requirements. They do not replace the user request or grant access to external accounts.

## Required submission items

| Item | Status | Evidence |
| --- | --- | --- |
| Live deployed application URL | Ready locally, external deployment pending | `http://localhost:3000` |
| GitHub repository with meaningful commits | Local project ready, GitHub remote pending | Project folder and README |
| README with setup and architecture summary | Complete | `README.md` |
| Test credentials for Admin and Attendee | Complete | `README.md` and `docs/TESTING_EVIDENCE.md` |
| Database schema diagram or screenshot | Complete | `docs/DATABASE_SCHEMA.md` |
| Feature completion checklist | Complete | `docs/FEATURE_COMPLETION_CHECKLIST.md` |
| Screenshots and known limitations | Complete for local evidence, hosted captures pending | `docs/SCREENSHOTS.md` and `docs/TESTING_EVIDENCE.md` |
| Short testing evidence | Complete | `docs/TESTING_EVIDENCE.md` |

## Score audit

| Rubric area | Points | Local result |
| --- | ---: | --- |
| Core functionality | 35 | Ready and exercised through the live API workflow |
| Business rules and data integrity | 20 | Ready with atomic capacity reservation and database constraints |
| Authentication and security | 15 | Ready with backend authorization, sessions, CSRF, validation, and ownership checks |
| UX, responsiveness, and accessibility | 15 | Ready with responsive pages, loading states, empty states, errors, focus states, and browser review |
| Code quality and testing | 10 | Ready with strict TypeScript, organized modules, rule tests, and end to end evidence |
| Deployment and handover | 5 | Local handover ready. Public URL and GitHub remote still require account access |

The local implementation is prepared for the full 100 point rubric. The only items that cannot be completed inside this local workspace are the public URL and GitHub remote. Those two external items must be connected before claiming a final 100 point submission.

## Final run order

1. Set production environment values.
2. Connect PostgreSQL and run the reviewed migration.
3. Run the seed only in a development database.
4. Deploy the application and record the public URL.
5. Push the project to GitHub with meaningful commits.
6. Capture the pages listed in `docs/SCREENSHOTS.md`.
7. Replace development credentials before sharing the public URL.

