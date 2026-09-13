import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, success } from "@/lib/errors";
import { readJson } from "@/lib/http";
import { requireCsrf } from "@/lib/security";
import { serializeEvent } from "@/lib/serializers";
import { eventPatchSchema, eventSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const event = await prisma.event.findUnique({ where: { id }, include: { registrations: user ? { where: { userId: user.id }, select: { status: true } } : false } });
    if (!event) throw new AppError("EVENT_NOT_FOUND", "That event could not be found.", 404);
    const canView = user?.role === "ADMIN" || (event.status === "PUBLISHED" && event.startDateTime > new Date());
    if (!canView) throw new AppError("EVENT_NOT_FOUND", "That event could not be found.", 404);
    return success({ event: serializeEvent(event, Array.isArray(event.registrations) ? event.registrations[0]?.status : null) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    requireCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new AppError("EVENT_NOT_FOUND", "That event could not be found.", 404);
    const patch = eventPatchSchema.parse(await readJson(request));
    const merged = eventSchema.parse({
      title: patch.title ?? existing.title,
      description: patch.description ?? existing.description,
      location: patch.location ?? existing.location,
      startDateTime: patch.startDateTime ?? existing.startDateTime,
      endDateTime: patch.endDateTime ?? existing.endDateTime,
      capacity: patch.capacity ?? existing.capacity,
      status: patch.status ?? existing.status,
      category: patch.category === undefined ? existing.category : patch.category,
      imageUrl: patch.imageUrl === undefined ? existing.imageUrl : patch.imageUrl,
    });
    if (merged.capacity < existing.seatsTaken) throw new AppError("CAPACITY_TOO_LOW", `Capacity cannot be lower than the ${existing.seatsTaken} active registrations.`, 422);
    if (merged.status === "PUBLISHED" && merged.startDateTime <= new Date()) throw new AppError("INVALID_STATUS", "A published event must start in the future.", 422);
    const event = await prisma.event.update({ where: { id }, data: { ...merged, category: merged.category || null, imageUrl: merged.imageUrl || null } });
    return success({ event: serializeEvent(event), message: "Event updated." });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    requireCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    const event = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { registrations: true } } } });
    if (!event) throw new AppError("EVENT_NOT_FOUND", "That event could not be found.", 404);
    if (event.status !== "DRAFT" || event._count.registrations > 0) throw new AppError("SAFE_DELETE_REQUIRED", "Only an unused draft can be deleted. Cancel the event to keep its history.", 409);
    await prisma.event.delete({ where: { id } });
    return success({ message: "Draft event deleted." });
  } catch (error) {
    return errorResponse(error);
  }
}
