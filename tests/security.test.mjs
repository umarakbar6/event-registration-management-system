import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { demoSeedSettings } from "../prisma/seed-settings.mjs";
const settings = () => ({ ALLOW_DEMO_SEED: "true", NODE_ENV: "development", DATABASE_URL: "file:./test.db", SEED_ADMIN_PASSWORD: randomBytes(18).toString("base64url"), SEED_ATTENDEE_PASSWORD: randomBytes(18).toString("base64url") });
test("demo seeding refuses production and remote databases", () => {
  assert.throws(() => demoSeedSettings({}), /requires/);
  assert.throws(() => demoSeedSettings({ ...settings(), NODE_ENV: "production" }), /forbidden/);
  assert.throws(() => demoSeedSettings({ ...settings(), DATABASE_URL: "postgresql://user:example@database.example/app" }), /local database/);
});
test("demo seeding requires distinct private credentials before data access", () => {
  const env = settings();
  assert.equal(demoSeedSettings(env).adminPassword, env.SEED_ADMIN_PASSWORD);
  assert.throws(() => demoSeedSettings({ ...env, SEED_ADMIN_PASSWORD: "" }), /private seed passwords/);
  assert.throws(() => demoSeedSettings({ ...env, SEED_ATTENDEE_PASSWORD: env.SEED_ADMIN_PASSWORD }), /different/);
});
