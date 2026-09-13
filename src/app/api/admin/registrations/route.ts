import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { GET as registrationsGet } from "@/app/api/registrations/route";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    url.searchParams.set("scope", "admin");
    return registrationsGet(new NextRequest(url, request));
  } catch (error) {
    return errorResponse(error);
  }
}
