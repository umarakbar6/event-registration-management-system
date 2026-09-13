import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { ForbiddenError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") throw new ForbiddenError("Only administrators can access this area.");
    const url = new URL(request.url);
    url.searchParams.set("view", "admin");
    const forwarded = new NextRequest(url, request);
    const { GET: eventsGet } = await import("@/app/api/events/route");
    const response = await eventsGet(forwarded);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
