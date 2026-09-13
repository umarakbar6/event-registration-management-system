import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError, errorResponse, success } from "@/lib/errors";
import { requireCsrf } from "@/lib/security";
import { serializeRegistration } from "@/lib/serializers";
import { cancelRegistration } from "@/lib/registrationService";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  try {
    requireCsrf(request);
    const user = await requireUser();
    const { id } = await context.params;
    const registration = await prisma.$transaction((transaction) => cancelRegistration(transaction, id, user.id, user.role === "ADMIN"), { isolationLevel: "Serializable" });
    return success({ registration: serializeRegistration(registration), message: "Registration cancelled." });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    requireCsrf(request);
    const user = await requireUser();
    if (user.role !== "ADMIN") throw new AppError("FORBIDDEN", "Only administrators can manage other registrations.", 403);
    const { id } = await context.params;
    const body = await request.json() as { status?: string };
    if (!["ACTIVE", "CANCELLED", "ATTENDED", "NO_SHOW"].includes(body.status ?? "")) throw new AppError("INVALID_STATUS", "That registration status is not valid.", 422);
    const current = await prisma.registration.findUnique({ where: { id }, include: { event: true } });
    if (!current) throw new AppError("REGISTRATION_NOT_FOUND", "Registration not found.", 404);
    const nextStatus = body.status!;
    const wasActive = current.status === "ACTIVE";
    const willBeActive = nextStatus === "ACTIVE";
    const registration = await prisma.$transaction(async (transaction) => {
      if (wasActive && !willBeActive) await transaction.event.updateMany({ where: { id: current.eventId, seatsTaken: { gt: 0 } }, data: { seatsTaken: { decrement: 1 } } });
      if (!wasActive && willBeActive) {
        const reserved = await transaction.event.updateMany({ where: { id: current.eventId, seatsTaken: { lt: current.event.capacity }, status: "PUBLISHED", startDateTime: { gt: new Date() } }, data: { seatsTaken: { increment: 1 } } });
        if (reserved.count !== 1) return null;
      }
      return transaction.registration.update({ where: { id }, data: { status: nextStatus, cancelledAt: nextStatus === "CANCELLED" ? new Date() : null }, include: { event: true, user: { select: { id: true, name: true, email: true } } } });
    }, { isolationLevel: "Serializable" });
    if (!registration) throw new AppError("EVENT_FULL", "There is no available seat for this registration.", 409);
    return success({ registration: serializeRegistration(registration), message: "Registration updated." });
  } catch (error) {
    return errorResponse(error);
  }
}
