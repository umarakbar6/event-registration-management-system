type RegistrationWebhookPayload = {
  registrationId: string;
  attendee: { id: string; name: string; email: string };
  event: { id: string; title: string; location: string; startDateTime: string };
  registeredAt: string;
};

export async function emitRegistrationWebhook(payload: RegistrationWebhookPayload) {
  const url = process.env.N8N_REGISTRATION_WEBHOOK_URL;
  if (!url) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "x-gatherly-secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ type: "registration.created", source: "gatherly", payload }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Registration webhook delivery failed", error);
  } finally {
    clearTimeout(timer);
  }
}
