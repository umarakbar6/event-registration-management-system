import assert from "node:assert/strict";
import fs from "node:fs";
import { TestRecorder } from "./test-recorder.mjs";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const recorder = new TestRecorder({
  suite: "Gatherly PRD acceptance cases",
  command: "pnpm test:e2e",
  environment: baseUrl.includes("localhost") ? "local application and database" : baseUrl,
});

class Client {
  cookies = new Map();

  cookieHeader() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  remember(response) {
    for (const raw of response.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const separator = pair.indexOf("=");
      if (separator > 0) this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }

  async request(path, options = {}) {
    const headers = new Headers(options.headers);
    if (this.cookies.size) headers.set("cookie", this.cookieHeader());
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    this.remember(response);
    const body = await response.json().catch(() => ({}));
    return { response, body };
  }

  async csrf() {
    await this.request("/api/auth/csrf");
    return this.cookies.get("event_csrf");
  }

  async json(path, method, body) {
    const token = await this.csrf();
    return this.request(path, {
      method,
      headers: { "content-type": "application/json", "x-csrf-token": token },
      body: JSON.stringify(body),
    });
  }
}

const admin = new Client();
const attendeeA = new Client();
const attendeeB = new Client();
const attendeeC = new Client();
const runId = Date.now();
const accountPassword = "Testing123!";
const accounts = {
  a: { name: "PRD Attendee A", email: `prd.a.${runId}@example.com` },
  b: { name: "PRD Attendee B", email: `prd.b.${runId}@example.com` },
  c: { name: "PRD Attendee C", email: `prd.c.${runId}@example.com` },
};

let registrationEvent;
let attendeeARegistration;
let fullEvent;
let fullRegistration;
let attendeeBRegistration;

function isoAt(daysFromToday, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function eventPayload(title, capacity = 3, startDays = 30) {
  return {
    title,
    description: "A focused PRD acceptance fixture for event registration behavior.",
    location: "QA Hall, Nowshera",
    startDateTime: isoAt(startDays, 10),
    endDateTime: isoAt(startDays, 12),
    capacity,
    status: "DRAFT",
    category: "Testing",
    imageUrl: null,
  };
}

async function createDraft(title, capacity = 3, startDays = 30) {
  const result = await admin.json("/api/events", "POST", eventPayload(title, capacity, startDays));
  assert.equal(result.response.status, 201);
  return result.body.event;
}

async function publish(event) {
  const result = await admin.json(`/api/events/${event.id}`, "PATCH", { status: "PUBLISHED" });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.event.status, "PUBLISHED");
  return result.body.event;
}

async function registerAttendee(client, account) {
  const result = await client.json("/api/auth/register", "POST", {
    name: account.name,
    email: account.email,
    password: accountPassword,
    confirmPassword: accountPassword,
  });
  assert.equal(result.response.status, 201);
  return result.body.user;
}

async function registerFor(client, eventId) {
  return client.json(`/api/events/${eventId}/register`, "POST", {});
}

try {
  await recorder.case("PRD-01", "Register for an event", "An attendee signs in, registers for a published event with places, sees confirmation, and one place is removed.", async () => {
    const adminLogin = await admin.json("/api/auth/login", "POST", { email: "admin@example.com", password: "Admin123!" });
    assert.equal(adminLogin.response.status, 200);
    await registerAttendee(attendeeA, accounts.a);
    registrationEvent = await publish(await createDraft(`PRD registration ${runId}`, 3));
    const before = await attendeeA.request(`/api/events/${registrationEvent.id}`);
    assert.equal(before.response.status, 200);
    const registration = await registerFor(attendeeA, registrationEvent.id);
    assert.equal(registration.response.status, 201);
    assert.equal(registration.body.message, "You are registered for this event.");
    attendeeARegistration = registration.body.registration;
    const after = await attendeeA.request(`/api/events/${registrationEvent.id}`);
    assert.equal(after.response.status, 200);
    assert.equal(after.body.event.remainingSeats, before.body.event.remainingSeats - 1);
    return `Registration HTTP ${registration.response.status}; confirmation shown; remaining seats changed from ${before.body.event.remainingSeats} to ${after.body.event.remainingSeats}`;
  });

  await recorder.case("PRD-02", "Publish an event", "A draft is hidden from attendees before publishing and visible after an admin publishes it.", async () => {
    const draft = await createDraft(`PRD publication ${runId}`, 4);
    const hidden = await attendeeA.request(`/api/events/${draft.id}`);
    assert.equal(hidden.response.status, 404);
    const hiddenFromList = await attendeeA.request("/api/events");
    assert.equal(hiddenFromList.response.status, 200);
    assert.equal(hiddenFromList.body.events.some((event) => event.id === draft.id), false);
    await publish(draft);
    const visible = await attendeeA.request(`/api/events/${draft.id}`);
    assert.equal(visible.response.status, 200);
    assert.equal(visible.body.event.id, draft.id);
    return `Draft detail/list hidden before publication; attendee HTTP ${visible.response.status} after status changed to PUBLISHED`;
  });

  await recorder.case("PRD-03", "Register twice", "The same attendee cannot create a second active registration for the same event, and only one registration remains.", async () => {
    const duplicate = await registerFor(attendeeA, registrationEvent.id);
    assert.equal(duplicate.response.status, 409);
    assert.equal(duplicate.body.code, "ALREADY_REGISTERED");
    const list = await admin.request(`/api/registrations?scope=admin&eventId=${encodeURIComponent(registrationEvent.id)}&status=ACTIVE&pageSize=50`);
    assert.equal(list.response.status, 200);
    assert.equal(list.body.pagination.total, 1);
    return `Second registration HTTP ${duplicate.response.status} with ${duplicate.body.code}; active registrations for event: ${list.body.pagination.total}`;
  });

  await recorder.case("PRD-04", "Full event", "After all places are taken, an extra attendee is blocked and the event reports no places left.", async () => {
    await registerAttendee(attendeeB, accounts.b);
    fullEvent = await publish(await createDraft(`PRD full event ${runId}`, 1));
    const first = await registerFor(attendeeA, fullEvent.id);
    assert.equal(first.response.status, 201);
    fullRegistration = first.body.registration;
    const extra = await registerFor(attendeeB, fullEvent.id);
    assert.equal(extra.response.status, 409);
    assert.equal(extra.body.code, "EVENT_FULL");
    const view = await attendeeB.request(`/api/events/${fullEvent.id}`);
    assert.equal(view.response.status, 200);
    assert.equal(view.body.event.remainingSeats, 0);
    return `First registration HTTP ${first.response.status}; extra registration HTTP ${extra.response.status} with ${extra.body.code}; event shows full`;
  });

  await recorder.case("PRD-05", "Closed or past event", "Registrations for cancelled, completed, and past-date events are all blocked.", async () => {
    const cancelled = await publish(await createDraft(`PRD cancelled ${runId}`, 3));
    const cancelledUpdate = await admin.json(`/api/events/${cancelled.id}`, "PATCH", { status: "CANCELLED" });
    assert.equal(cancelledUpdate.response.status, 200);
    const completed = await publish(await createDraft(`PRD completed ${runId}`, 3));
    const completedUpdate = await admin.json(`/api/events/${completed.id}`, "PATCH", { status: "COMPLETED" });
    assert.equal(completedUpdate.response.status, 200);
    const fixtures = await admin.request("/api/events?view=admin&status=PUBLISHED");
    assert.equal(fixtures.response.status, 200);
    const past = fixtures.body.events.find((event) => event.title === "Historical Registration Fixture");
    assert.ok(past, "The seeded past-date registration fixture should exist");
    const attempts = await Promise.all([cancelled.id, completed.id, past.id].map((id) => registerFor(attendeeB, id)));
    assert.deepEqual(attempts.map((item) => [item.response.status, item.body.code]), [[409, "REGISTRATION_CLOSED"], [409, "REGISTRATION_CLOSED"], [409, "EVENT_STARTED"]]);
    return "Cancelled, completed, and past-date attempts all returned HTTP 409 with the expected closed/started reasons";
  });

  await recorder.case("PRD-06", "Cancel a registration", "Cancelling one registration on a full event frees the place and lets a different attendee register.", async () => {
    const cancelled = await attendeeA.json(`/api/registrations/${fullRegistration.id}`, "DELETE", {});
    assert.equal(cancelled.response.status, 200);
    assert.equal(cancelled.body.registration.status, "CANCELLED");
    const replacement = await registerFor(attendeeB, fullEvent.id);
    assert.equal(replacement.response.status, 201);
    assert.equal(replacement.body.registration.status, "ACTIVE");
    attendeeBRegistration = replacement.body.registration;
    const view = await attendeeB.request(`/api/events/${fullEvent.id}`);
    assert.equal(view.body.event.remainingSeats, 0);
    return `Cancellation HTTP ${cancelled.response.status}; replacement attendee registration HTTP ${replacement.response.status}; place was reused`;
  });

  await recorder.case("PRD-07", "Wrong capacity", "Zero, negative, decimal, and below-current-registration capacities are rejected with clear validation.", async () => {
    const capacityEvent = await createDraft(`PRD capacity ${runId}`, 3);
    for (const invalidCapacity of [0, -1, 2.5]) {
      const invalid = await admin.json(`/api/events/${capacityEvent.id}`, "PATCH", { capacity: invalidCapacity });
      assert.equal(invalid.response.status, 422);
      assert.ok(invalid.body.fields?.capacity, `Capacity ${invalidCapacity} should return a field error`);
    }
    await publish(capacityEvent);
    const firstRegistration = await registerFor(attendeeA, capacityEvent.id);
    const secondRegistration = await registerFor(attendeeB, capacityEvent.id);
    assert.equal(firstRegistration.response.status, 201);
    assert.equal(secondRegistration.response.status, 201);
    const belowCurrent = await admin.json(`/api/events/${capacityEvent.id}`, "PATCH", { capacity: 1 });
    assert.equal(belowCurrent.response.status, 422);
    assert.equal(belowCurrent.body.code, "CAPACITY_TOO_LOW");
    const unchanged = await admin.request(`/api/events/${capacityEvent.id}`);
    assert.equal(unchanged.body.event.capacity, 3);
    return `0, -1, and 2.5 returned HTTP 422 field errors; capacity below two active registrations returned ${belowCurrent.body.code}`;
  });

  await recorder.case("PRD-08", "Attendee tries admin actions", "An attendee cannot open admin pages or perform admin mutations, including a direct request.", async () => {
    const adminPage = await attendeeA.request("/admin/events", { redirect: "manual" });
    assert.ok([307, 308].includes(adminPage.response.status));
    assert.ok(adminPage.response.headers.get("location")?.endsWith("/dashboard"));
    const directMutation = await attendeeA.json("/api/events", "POST", eventPayload(`PRD blocked ${runId}`, 2));
    assert.equal(directMutation.response.status, 403);
    assert.equal(directMutation.body.code, "FORBIDDEN");
    return `Admin page redirected with HTTP ${adminPage.response.status}; direct event mutation blocked with HTTP ${directMutation.response.status} by the server`;
  });

  await recorder.case("PRD-09", "Someone else's registration", "An attendee cannot open or receive another attendee's registration details.", async () => {
    const own = await attendeeA.request(`/api/registrations/${attendeeARegistration.id}`);
    assert.equal(own.response.status, 200);
    const other = await attendeeA.request(`/api/registrations/${attendeeBRegistration.id}`);
    assert.equal(other.response.status, 403);
    assert.equal(other.body.code, "FORBIDDEN");
    assert.equal(other.body.registration, undefined);
    assert.equal(JSON.stringify(other.body).includes(accounts.b.email), false);
    return `Own registration HTTP ${own.response.status}; another attendee's registration HTTP ${other.response.status}; private details omitted`;
  });

  await recorder.case("PRD-10", "Attendee list and totals", "After three registrations and one cancellation, the event list shows two active attendees, search/export/copy controls are available, and dashboard totals survive refresh.", async () => {
    await registerAttendee(attendeeC, accounts.c);
    const listEvent = await publish(await createDraft(`PRD attendee list ${runId}`, 5));
    const first = await registerFor(attendeeA, listEvent.id);
    const second = await registerFor(attendeeB, listEvent.id);
    const third = await registerFor(attendeeC, listEvent.id);
    assert.equal(first.response.status, 201);
    assert.equal(second.response.status, 201);
    assert.equal(third.response.status, 201);
    const cancelled = await attendeeC.json(`/api/registrations/${third.body.registration.id}`, "DELETE", {});
    assert.equal(cancelled.response.status, 200);
    const list = await admin.request(`/api/registrations?scope=admin&eventId=${encodeURIComponent(listEvent.id)}&status=ACTIVE&pageSize=50`);
    assert.equal(list.response.status, 200);
    assert.equal(list.body.pagination.total, 2);
    assert.equal(list.body.registrations.length, 2);
    assert.deepEqual(list.body.registrations.map((item) => item.user.email).sort(), [accounts.a.email, accounts.b.email].sort());
    const source = fs.readFileSync(new URL("../src/components/registrations-page.tsx", import.meta.url), "utf8");
    assert.match(source, /Search attendee or event/);
    assert.match(source, /Copy list/);
    assert.match(source, /Download CSV/);
    const allActive = await admin.request("/api/registrations?scope=admin&status=ACTIVE&pageSize=50");
    const statsBeforeRefresh = await admin.request("/api/admin/statistics");
    const statsAfterRefresh = await admin.request("/api/admin/statistics");
    assert.equal(statsBeforeRefresh.response.status, 200);
    assert.equal(statsAfterRefresh.response.status, 200);
    assert.equal(statsBeforeRefresh.body.stats.activeRegistrations, allActive.body.pagination.total);
    assert.deepEqual(statsAfterRefresh.body.stats, statsBeforeRefresh.body.stats);
    return `Event-scoped admin list shows ${list.body.pagination.total} active attendees after one cancellation; search/copy/CSV controls present; dashboard active total ${statsBeforeRefresh.body.stats.activeRegistrations} stayed unchanged after refresh`;
  });
} finally {
  recorder.finish();
}

console.log(`PRD acceptance cases passed and recorded: ${recorder.cases.length} cases.`);
