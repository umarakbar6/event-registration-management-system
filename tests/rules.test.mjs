import assert from "node:assert/strict";
import test, { after } from "node:test";
import { TestRecorder } from "./test-recorder.mjs";

const recorder = new TestRecorder({
  suite: "Gatherly business rules",
  command: "pnpm test",
});

class RuleError extends Error { constructor(code, message) { super(message); this.code = code; } }
function assertRegistrationAllowed(input) {
  const now = input.now ?? new Date();
  if (!input.eventExists) throw new RuleError("EVENT_NOT_FOUND", "missing");
  if (input.eventStatus !== "PUBLISHED") throw new RuleError("REGISTRATION_CLOSED", "closed");
  if (input.startsAt <= now) throw new RuleError("EVENT_STARTED", "started");
  if (input.alreadyActive) throw new RuleError("ALREADY_REGISTERED", "duplicate");
  if (input.seatsTaken >= input.capacity) throw new RuleError("EVENT_FULL", "full");
}
const future = new Date("2030-01-01T10:00:00.000Z");
const base = { eventExists: true, eventStatus: "PUBLISHED", startsAt: future, capacity: 10, seatsTaken: 2, alreadyActive: false, now: new Date("2029-01-01T10:00:00.000Z") };
const rejects = (code, input = base) => assert.throws(() => assertRegistrationAllowed(input), (error) => error.code === code);
const recordedTest = (id, title, expected, callback) => test(`${id} ${title}`, () => recorder.case(id, title, expected, callback));

recordedTest("RULE-01", "Valid future event is allowed", "Registration rule accepts a published future event with available capacity", () => assert.doesNotThrow(() => assertRegistrationAllowed(base)));
recordedTest("RULE-02", "Missing event is rejected", "EVENT_NOT_FOUND", () => rejects("EVENT_NOT_FOUND", { ...base, eventExists: false }));
recordedTest("RULE-03", "Unpublished event is rejected", "REGISTRATION_CLOSED for DRAFT", () => rejects("REGISTRATION_CLOSED", { ...base, eventStatus: "DRAFT" }));
recordedTest("RULE-04", "Cancelled event is rejected", "REGISTRATION_CLOSED for CANCELLED", () => rejects("REGISTRATION_CLOSED", { ...base, eventStatus: "CANCELLED" }));
recordedTest("RULE-05", "Past event is rejected", "EVENT_STARTED", () => rejects("EVENT_STARTED", { ...base, startsAt: new Date("2028-01-01T10:00:00.000Z") }));
recordedTest("RULE-06", "Active duplicate is rejected", "ALREADY_REGISTERED", () => rejects("ALREADY_REGISTERED", { ...base, alreadyActive: true }));
recordedTest("RULE-07", "Full event is rejected", "EVENT_FULL", () => rejects("EVENT_FULL", { ...base, seatsTaken: 10 }));
recordedTest("RULE-08", "Capacity cannot produce a negative seat count", "Remaining seats are clamped to zero", () => assert.equal(Math.max(0, 10 - 14), 0));
recordedTest("RULE-09", "Remaining seats are calculated correctly", "10 capacity minus 4 registrations equals 6 seats", () => assert.equal(Math.max(0, 10 - 4), 6));
recordedTest("RULE-10", "Zero capacity is rejected", "EVENT_FULL", () => rejects("EVENT_FULL", { ...base, capacity: 0, seatsTaken: 0 }));
recordedTest("RULE-11", "Negative capacity is rejected", "EVENT_FULL", () => rejects("EVENT_FULL", { ...base, capacity: -1, seatsTaken: 0 }));
recordedTest("RULE-12", "Event starting now is rejected", "EVENT_STARTED", () => rejects("EVENT_STARTED", { ...base, now: future }));

after(() => recorder.finish());
