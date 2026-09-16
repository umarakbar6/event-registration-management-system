import assert from "node:assert/strict";
import { TestRecorder } from "./test-recorder.mjs";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const recorder = new TestRecorder({
  suite: "Gatherly API end to end acceptance",
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

const attendee = new Client();
const admin = new Client();
const uniqueEmail = `qa.${Date.now()}@example.com`;
let events;
let target;
let fullTarget;
let attendeeRegistration;
let created;
let completedRegistration;

try {
  await recorder.case("E2E-01", "Public event discovery", "GET /api/events returns at least two published events", async () => {
    events = await attendee.request("/api/events");
    assert.equal(events.response.status, 200);
    assert.ok(events.body.events.length >= 2);
    return `HTTP ${events.response.status}; ${events.body.events.length} events returned`;
  });

  await recorder.case("E2E-02", "Attendee account registration", "A new attendee can create an account", async () => {
    const registration = await attendee.json("/api/auth/register", "POST", {
      name: "Quality Check",
      email: uniqueEmail,
      password: "Testing123!",
      confirmPassword: "Testing123!",
    });
    assert.equal(registration.response.status, 201);
    return `HTTP ${registration.response.status}; account created for a unique QA address`;
  });

  await recorder.case("E2E-03", "Attendee profile update", "Authenticated attendee can update their own profile", async () => {
    const profile = await attendee.json("/api/profile", "PATCH", { name: "Quality Check Updated" });
    assert.equal(profile.response.status, 200);
    assert.equal(profile.body.user.name, "Quality Check Updated");
    return `HTTP ${profile.response.status}; profile name updated`;
  });

  await recorder.case("E2E-04", "Attendee cannot create events", "Server rejects attendee event creation with HTTP 403", async () => {
    const response = await attendee.json("/api/events", "POST", {
      title: "Blocked event",
      description: "This request must be rejected by the server role check.",
      location: "Online",
      startDateTime: "2030-01-01T10:00:00.000Z",
      endDateTime: "2030-01-01T11:00:00.000Z",
      capacity: 10,
      status: "DRAFT",
    });
    assert.equal(response.response.status, 403);
    return `HTTP ${response.response.status}; attendee role was denied`;
  });

  await recorder.case("E2E-05", "Full event rejection", "Registration for a full event returns EVENT_FULL", async () => {
    target = events.body.events.find((event) => event.remainingSeats > 0);
    fullTarget = events.body.events.find((event) => event.remainingSeats === 0);
    assert.ok(target);
    assert.ok(fullTarget);
    const response = await attendee.json(`/api/events/${fullTarget.id}/register`, "POST", {});
    assert.equal(response.response.status, 409);
    assert.equal(response.body.code, "EVENT_FULL");
    return `HTTP ${response.response.status}; code ${response.body.code}`;
  });

  await recorder.case("E2E-06", "Valid event registration", "Attendee can register for an eligible event", async () => {
    const response = await attendee.json(`/api/events/${target.id}/register`, "POST", {});
    assert.equal(response.response.status, 201);
    attendeeRegistration = response.body.registration;
    return `HTTP ${response.response.status}; registration ${attendeeRegistration.id} created`;
  });

  await recorder.case("E2E-07", "Duplicate registration rejection", "Second active registration returns ALREADY_REGISTERED", async () => {
    const response = await attendee.json(`/api/events/${target.id}/register`, "POST", {});
    assert.equal(response.response.status, 409);
    assert.equal(response.body.code, "ALREADY_REGISTERED");
    return `HTTP ${response.response.status}; code ${response.body.code}`;
  });

  await recorder.case("E2E-08", "Attendee registration history", "Attendee can read their own active registration", async () => {
    const response = await attendee.request("/api/registrations");
    assert.equal(response.response.status, 200);
    assert.ok(response.body.registrations.some((item) => item.event.id === target.id && item.status === "ACTIVE"));
    return `HTTP ${response.response.status}; personal registration is visible`;
  });

  await recorder.case("E2E-09", "Cancellation releases a seat", "Attendee cancellation succeeds and capacity is released", async () => {
    const cancelled = await attendee.json(`/api/registrations/${attendeeRegistration.id}`, "DELETE", {});
    assert.equal(cancelled.response.status, 200);
    assert.equal(cancelled.body.registration.status, "CANCELLED");
    const refreshedEvent = await attendee.request(`/api/events/${target.id}`);
    assert.equal(refreshedEvent.response.status, 200);
    assert.equal(refreshedEvent.body.event.remainingSeats, target.remainingSeats);
    return `HTTP ${cancelled.response.status}; status CANCELLED; seat count returned to ${target.remainingSeats}`;
  });

  await recorder.case("E2E-10", "Admin login and live statistics", "Admin can sign in and read real statistics", async () => {
    const login = await admin.json("/api/auth/login", "POST", { email: "admin@nowshera-events.pk", password: "NowsheraAdmin123!" });
    assert.equal(login.response.status, 200);
    const stats = await admin.request("/api/admin/statistics");
    assert.equal(stats.response.status, 200);
    assert.ok(typeof stats.body.stats.totalEvents === "number");
    return `Login HTTP ${login.response.status}; statistics HTTP ${stats.response.status}`;
  });

  await recorder.case("E2E-11", "Invalid registration status rejection", "Invalid admin status is rejected by Zod with HTTP 422", async () => {
    const response = await admin.json(`/api/registrations/${attendeeRegistration.id}`, "PATCH", { status: "INVALID" });
    assert.equal(response.response.status, 422);
    assert.ok(response.body.fields.status);
    return `HTTP ${response.response.status}; status field validation error returned`;
  });

  await recorder.case("E2E-12", "Admin registration status transitions", "Admin can reactivate a registration and mark it no show", async () => {
    const reactivated = await admin.json(`/api/registrations/${attendeeRegistration.id}`, "PATCH", { status: "ACTIVE" });
    assert.equal(reactivated.response.status, 200);
    assert.equal(reactivated.body.registration.status, "ACTIVE");
    const markedNoShow = await admin.json(`/api/registrations/${attendeeRegistration.id}`, "PATCH", { status: "NO_SHOW" });
    assert.equal(markedNoShow.response.status, 200);
    assert.equal(markedNoShow.body.registration.status, "NO_SHOW");
    return `Reactivation HTTP ${reactivated.response.status}; no show HTTP ${markedNoShow.response.status}`;
  });

  await recorder.case("E2E-13", "Admin draft event creation", "Admin can create a draft event", async () => {
    created = await admin.json("/api/events", "POST", {
      title: `QA Event ${Date.now()}`,
      description: "A real event created by the end to end test suite.",
      location: "Online",
      startDateTime: "2030-01-01T10:00:00.000Z",
      endDateTime: "2030-01-01T11:00:00.000Z",
      capacity: 2,
      status: "DRAFT",
    });
    assert.equal(created.response.status, 201);
    return `HTTP ${created.response.status}; draft event ${created.body.event.id} created`;
  });

  await recorder.case("E2E-14", "Draft event publication", "Admin can publish the newly created event", async () => {
    const response = await admin.json(`/api/events/${created.body.event.id}`, "PATCH", { status: "PUBLISHED" });
    assert.equal(response.response.status, 200);
    assert.equal(response.body.event.status, "PUBLISHED");
    return `HTTP ${response.response.status}; event status PUBLISHED`;
  });

  await recorder.case("E2E-15", "Completed event feedback eligibility", "Attended attendee can submit one feedback record after completion", async () => {
    const feedbackRegistration = await attendee.json(`/api/events/${created.body.event.id}/register`, "POST", {});
    assert.equal(feedbackRegistration.response.status, 201);
    const completed = await admin.json(`/api/events/${created.body.event.id}`, "PATCH", {
      status: "COMPLETED",
      startDateTime: "2020-01-01T10:00:00.000Z",
      endDateTime: "2020-01-01T11:00:00.000Z",
    });
    assert.equal(completed.response.status, 200);
    const completedRegistrations = await attendee.request("/api/registrations");
    completedRegistration = completedRegistrations.body.registrations.find((item) => item.event.id === created.body.event.id);
    assert.ok(completedRegistration);
    const markedAttended = await admin.json(`/api/registrations/${completedRegistration.id}`, "PATCH", { status: "ATTENDED" });
    assert.equal(markedAttended.response.status, 200);
    const feedback = await attendee.json("/api/feedback", "POST", {
      eventId: created.body.event.id,
      rating: 5,
      comment: "The completed test event was useful.",
    });
    assert.equal(feedback.response.status, 201);
    return `Registration HTTP ${feedbackRegistration.response.status}; completion HTTP ${completed.response.status}; feedback HTTP ${feedback.response.status}`;
  });

  await recorder.case("E2E-16", "Duplicate feedback rejection", "Second feedback submission returns FEEDBACK_ALREADY_SUBMITTED", async () => {
    const response = await attendee.json("/api/feedback", "POST", {
      eventId: created.body.event.id,
      rating: 4,
      comment: "This duplicate should be rejected.",
    });
    assert.equal(response.response.status, 409);
    assert.equal(response.body.code, "FEEDBACK_ALREADY_SUBMITTED");
    return `HTTP ${response.response.status}; code ${response.body.code}`;
  });

  await recorder.case("E2E-17", "Safe deletion protection", "Event with registration history cannot be deleted", async () => {
    const response = await admin.json(`/api/events/${created.body.event.id}`, "DELETE", {});
    assert.equal(response.response.status, 409);
    return `HTTP ${response.response.status}; deletion safely blocked`;
  });
} finally {
  recorder.finish();
}

console.log(`End to end API checks passed and recorded: ${recorder.cases.length} cases.`);
