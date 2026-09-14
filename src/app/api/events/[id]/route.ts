import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import { requireCsrf } from "@/lib/security";
import { serializeRegistration } from "@/lib/serializers";
import { registerForEvent } from "@/lib/registrationService";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    requireCsrf(request);
    const user = await requireUser();
    const { id } = await context.params;
    const registration = await prisma.$transaction((transaction) => registerForEvent(transaction, user.id, id), { isolationLevel: "Serializable" });
    return success({ registration: serializeRegistration(registration), message: "You are registered for this event." }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
