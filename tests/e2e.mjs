import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

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
    return this.request(path, { method, headers: { "content-type": "application/json", "x-csrf-token": token }, body: JSON.stringify(body) });
  }
}

const attendee = new Client();
const admin = new Client();
const uniqueEmail = `qa.${Date.now()}@example.com`;

const events = await attendee.request("/api/events");
assert.equal(events.response.status, 200);
assert.ok(events.body.events.length >= 2);

const registration = await attendee.json("/api/auth/register", "POST", { name: "Quality Check", email: uniqueEmail, password: "Testing123!", confirmPassword: "Testing123!" });
assert.equal(registration.response.status, 201);

const attendeeCannotCreate = await attendee.json("/api/events", "POST", { title: "Blocked event", description: "This request must be rejected by the server role check.", location: "Online", startDateTime: "2030-01-01T10:00:00.000Z", endDateTime: "2030-01-01T11:00:00.000Z", capacity: 10, status: "DRAFT" });
assert.equal(attendeeCannotCreate.response.status, 403);

const target = events.body.events.find((event) => event.remainingSeats > 0);
assert.ok(target);
const fullTarget = events.body.events.find((event) => event.remainingSeats === 0);
assert.ok(fullTarget);
const fullRegistration = await attendee.json(`/api/events/${fullTarget.id}/register`, "POST", {});
assert.equal(fullRegistration.response.status, 409);
assert.equal(fullRegistration.body.code, "EVENT_FULL");
const firstRegistration = await attendee.json(`/api/events/${target.id}/register`, "POST", {});
assert.equal(firstRegistration.response.status, 201);
const duplicate = await attendee.json(`/api/events/${target.id}/register`, "POST", {});
assert.equal(duplicate.response.status, 409);
assert.equal(duplicate.body.code, "ALREADY_REGISTERED");

const registrations = await attendee.request("/api/registrations");
assert.equal(registrations.response.status, 200);
assert.ok(registrations.body.registrations.some((item) => item.event.id === target.id && item.status === "ACTIVE"));
const attendeeRegistration = registrations.body.registrations.find((item) => item.event.id === target.id && item.status === "ACTIVE");
const cancelled = await attendee.json(`/api/registrations/${attendeeRegistration.id}`, "DELETE", {});
assert.equal(cancelled.response.status, 200);
assert.equal(cancelled.body.registration.status, "CANCELLED");

const adminLogin = await admin.json("/api/auth/login", "POST", { email: "admin@example.com", password: "Admin123!" });
assert.equal(adminLogin.response.status, 200);
const stats = await admin.request("/api/admin/statistics");
assert.equal(stats.response.status, 200);
assert.ok(typeof stats.body.stats.totalEvents === "number");
const created = await admin.json("/api/events", "POST", { title: `QA Event ${Date.now()}`, description: "A real event created by the end to end test suite.", location: "Online", startDateTime: "2030-01-01T10:00:00.000Z", endDateTime: "2030-01-01T11:00:00.000Z", capacity: 2, status: "DRAFT" });
assert.equal(created.response.status, 201);
const published = await admin.json(`/api/events/${created.body.event.id}`, "PATCH", { status: "PUBLISHED" });
assert.equal(published.response.status, 200);
const deleted = await admin.json(`/api/events/${created.body.event.id}`, "DELETE", {});
assert.equal(deleted.response.status, 409);
const reverted = await admin.json(`/api/events/${created.body.event.id}`, "PATCH", { status: "DRAFT" });
assert.equal(reverted.response.status, 200);
const removed = await admin.json(`/api/events/${created.body.event.id}`, "DELETE", {});
assert.equal(removed.response.status, 200);

console.log("End to end API checks passed.");
