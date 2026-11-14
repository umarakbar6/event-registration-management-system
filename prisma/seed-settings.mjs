export function demoSeedSettings(env = process.env) {
  if (env.ALLOW_DEMO_SEED !== "true" || env.NODE_ENV === "production") throw new Error("Demo seeding requires ALLOW_DEMO_SEED=true and is forbidden in production.");
  const database = env.DATABASE_URL || "";
  let local = database.startsWith("file:");
  if (!local) { try { local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(database).hostname); } catch { local = false; } }
  if (!local) throw new Error("Demo seeding is limited to an explicitly configured local database.");
  const adminPassword = env.SEED_ADMIN_PASSWORD || "", attendeePassword = env.SEED_ATTENDEE_PASSWORD || "";
  for (const password of [adminPassword, attendeePassword]) if (password.length < 12 || new TextEncoder().encode(password).length > 72) throw new Error("Set private seed passwords of 12 to 72 bytes.");
  if (adminPassword === attendeePassword) throw new Error("Use different private administrator and attendee passwords.");
  return { adminPassword, attendeePassword };
}
