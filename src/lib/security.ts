import { createHmac, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

export const sessionCookieName = "event_session";
export const csrfCookieName = "event_csrf";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production.");
  return secret || "local development secret";
}

export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export function setCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(csrfCookieName, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function requireCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(csrfCookieName)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken || cookieToken.length < 20 || cookieToken !== headerToken) {
    throw new AppError("CSRF_FAILED", "Your session protection token is missing or expired. Refresh the page and try again.", 403);
  }
}
