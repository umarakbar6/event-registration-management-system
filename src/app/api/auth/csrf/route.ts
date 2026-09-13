import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOpaqueToken, csrfCookieName, setCsrfCookie } from "@/lib/security";

export async function GET() {
  const store = await cookies();
  const current = store.get(csrfCookieName)?.value;
  const response = NextResponse.json({ csrfToken: current ?? "" });
  if (!current) setCsrfCookie(response, createOpaqueToken());
  return response;
}
