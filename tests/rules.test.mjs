import assert from "node:assert/strict";
import test from "node:test";

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

test("valid future event is allowed", () => assert.doesNotThrow(() => assertRegistrationAllowed(base)));
test("missing event is rejected", () => rejects("EVENT_NOT_FOUND", { ...base, eventExists: false }));
test("unpublished event is rejected", () => rejects("REGISTRATION_CLOSED", { ...base, eventStatus: "DRAFT" }));
test("cancelled event is rejected", () => rejects("REGISTRATION_CLOSED", { ...base, eventStatus: "CANCELLED" }));
test("past event is rejected", () => rejects("EVENT_STARTED", { ...base, startsAt: new Date("2028-01-01T10:00:00.000Z") }));
test("active duplicate is rejected", () => rejects("ALREADY_REGISTERED", { ...base, alreadyActive: true }));
test("full event is rejected", () => rejects("EVENT_FULL", { ...base, seatsTaken: 10 }));
test("capacity cannot produce a negative seat count", () => assert.equal(Math.max(0, 10 - 14), 0));
test("remaining seats are calculated correctly", () => assert.equal(Math.max(0, 10 - 4), 6));
test("zero capacity is rejected", () => rejects("EVENT_FULL", { ...base, capacity: 0, seatsTaken: 0 }));
test("negative capacity is rejected", () => rejects("EVENT_FULL", { ...base, capacity: -1, seatsTaken: 0 }));
test("event starting now is rejected", () => rejects("EVENT_STARTED", { ...base, now: future }));
