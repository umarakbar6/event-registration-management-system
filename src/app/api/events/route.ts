import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, success } from "@/lib/errors";
import { queryValue } from "@/lib/http";
import { requireCsrf } from "@/lib/security";
import { serializeEvent } from "@/lib/serializers";
import { eventSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const search = queryValue(request, "search");
    const location = queryValue(request, "location");
    const availability = queryValue(request, "availability");
    const status = queryValue(request, "status");
    const sort = queryValue(request, "sort") || "soonest";
    const now = new Date();
    const isAdminView = user?.role === "ADMIN" && queryValue(request, "view") === "admin";
    const where = {
      ...(isAdminView ? (status ? { status } : {}) : { status: "PUBLISHED", startDateTime: { gt: now } }),
      ...(search ? { OR: [{ title: { contains: search } }, { location: { contains: search } }] } : {}),
      ...(location ? { location: { contains: location } } : {}),
      ...(availability === "available" ? { seatsTaken: { lt: 1_000_000 } } : {}),
    };
    const orderBy = sort === "popular" ? { seatsTaken: "desc" as const } : sort === "capacity" ? { capacity: "desc" as const } : { startDateTime: "asc" as const };
    const events = await prisma.event.findMany({ where, orderBy, include: { registrations: user ? { where: { userId: user.id }, select: { status: true } } : false } });
    const filtered = availability === "available" ? events.filter((event) => event.seatsTaken < event.capacity) : events;
    return success({ events: filtered.map((event) => serializeEvent(event, Array.isArray(event.registrations) ? event.registrations[0]?.status : null)) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    const admin = await requireAdmin();
    const input = eventSchema.parse(await request.json());
    if (input.status === "PUBLISHED" && input.startDateTime <= new Date()) throw new AppError("INVALID_STATUS", "A published event must start in the future.", 422);
    const event = await prisma.event.create({ data: { ...input, category: input.category || null, imageUrl: input.imageUrl || null, createdById: admin.id, seatsTaken: 0 } });
    return success({ event: serializeEvent(event), message: "Event created." }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
