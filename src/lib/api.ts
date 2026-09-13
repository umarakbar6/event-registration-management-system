import type { DashboardStats, EventRecord, RegistrationRecord, ReportData, SessionUser } from "./types";

let csrfPromise: Promise<string> | null = null;

export async function getCsrfToken() {
  if (!csrfPromise) {
    csrfPromise = fetch("/api/auth/csrf", { credentials: "include" }).then(async (response) => {
      const body = await response.json() as { csrfToken?: string };
      const cookie = document.cookie.split("; ").find((item) => item.startsWith("event_csrf="));
      return body.csrfToken || cookie?.split("=")[1] || "";
    }).finally(() => { csrfPromise = null; });
  }
  return csrfPromise;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (method !== "GET" && method !== "HEAD") headers.set("x-csrf-token", await getCsrfToken());
  const response = await fetch(url, { ...options, headers, credentials: "include" });
  const body = await response.json().catch(() => ({})) as T & { error?: string; message?: string };
  if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}

export const getUser = () => apiRequest<{ user: SessionUser | null }>("/api/me");
export const getEvents = (query = "") => apiRequest<{ events: EventRecord[] }>(`/api/events${query}`);
export const getEvent = (id: string) => apiRequest<{ event: EventRecord }>(`/api/events/${id}`);
export const createEvent = (payload: unknown) => apiRequest<{ event: EventRecord; message: string }>("/api/events", { method: "POST", body: JSON.stringify(payload) });
export const updateEvent = (id: string, payload: unknown) => apiRequest<{ event: EventRecord; message: string }>(`/api/events/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteEvent = (id: string) => apiRequest<{ message: string }>(`/api/events/${id}`, { method: "DELETE" });
export const registerForEvent = (id: string) => apiRequest<{ registration: RegistrationRecord; message: string }>(`/api/events/${id}/register`, { method: "POST", body: "{}" });
export const getRegistrations = (query = "") => apiRequest<{ registrations: RegistrationRecord[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>(`/api/registrations${query}`);
export const cancelRegistration = (id: string) => apiRequest<{ registration: RegistrationRecord; message: string }>(`/api/registrations/${id}`, { method: "DELETE" });
export const updateRegistration = (id: string, status: string) => apiRequest<{ registration: RegistrationRecord; message: string }>(`/api/registrations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const getStatistics = () => apiRequest<{ stats: DashboardStats; report: ReportData }>("/api/admin/statistics");
export const updateProfile = (name: string) => apiRequest<{ user: SessionUser; message: string }>("/api/profile", { method: "PATCH", body: JSON.stringify({ name }) });
export const logout = () => apiRequest<{ message: string }>("/api/auth/logout", { method: "POST", body: "{}" });
