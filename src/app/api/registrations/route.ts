import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import { queryValue, positiveInt } from "@/lib/http";
import { serializeRegistration } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const page = positiveInt(queryValue(request, "page"), 1);
    const pageSize = Math.min(50, positiveInt(queryValue(request, "pageSize"), 20));
    const status = queryValue(request, "status");
    const where = user.role === "ADMIN" && queryValue(request, "scope") === "admin" ? (status ? { status } : {}) : { userId: user.id, ...(status ? { status } : {}) };
    const [registrations, total] = await prisma.$transaction([
      prisma.registration.findMany({ where, include: { event: true, user: { select: { id: true, name: true, email: true } } }, orderBy: { registeredAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.registration.count({ where }),
    ]);
    const feedbackEventIds = user.role === "ATTENDEE" && registrations.length
      ? new Set((await prisma.feedback.findMany({ where: { userId: user.id, eventId: { in: registrations.map((registration) => registration.eventId) } }, select: { eventId: true } })).map((feedback) => feedback.eventId))
      : new Set<string>();
    return success({ registrations: registrations.map((registration) => serializeRegistration(registration, feedbackEventIds.has(registration.eventId))), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return errorResponse(error);
  }
}
