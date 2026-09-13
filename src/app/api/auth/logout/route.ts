import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import { requireCsrf, clearSessionCookie, sessionCookieName } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    const store = await cookies();
    await destroySession(store.get(sessionCookieName)?.value);
    const response = success({ message: "You are signed out." });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
