# Gatherly test recording

The project now records each verification as an individual evidence row. A run includes the command checks and the named business and API acceptance cases.

## Run the complete record

From the project folder, run:

```text
pnpm test:record
```

This runs strict TypeScript validation, the business rule suite, a production build, resets the local demo database for deterministic fixtures, and runs the ten AI SKOOL PRD acceptance cases against the local application. The reset is only for the local SQLite test database; never point this command at production data. The runner writes:

- `docs/test-records/latest.md` for the submission friendly summary.
- `docs/test-records/latest.json` for machine readable evidence.
- `work/test-records/gatherly-business-rules-latest.md` for the twelve individual rule cases.
- `work/test-records/gatherly-prd-acceptance-cases-latest.md` for the ten individual PRD cases.

Each case records its ID, title, expected result, actual result, PASS or FAIL status, duration, timestamp, and error message when applicable. The PRD record uses the stable IDs `PRD-01` through `PRD-10`, matching the updated AI SKOOL Test Cases section exactly.

## Evidence discipline

Every new requirement should receive a stable test ID before implementation is marked complete. A passing summary without a matching individual row is not considered complete evidence. If a test fails, keep the generated record and fix the implementation before creating the next passing run.

The browser screenshots in `docs/screenshots/` remain visual evidence for the main attendee and admin journeys. Add a screenshot reference to the relevant test row whenever the updated AI SKOOL submission form asks for visual proof.
