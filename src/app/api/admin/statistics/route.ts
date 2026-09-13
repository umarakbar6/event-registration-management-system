import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import type { DashboardStats, ReportData } from "@/lib/types";

export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const [totalEvents, publishedEvents, draftEvents, cancelledEvents, completedEvents, totalRegistrations, activeRegistrations, totalAttendees, upcomingEvents, eventRows, registrationRows] = await prisma.$transaction([
      prisma.event.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { status: "DRAFT" } }),
      prisma.event.count({ where: { status: "CANCELLED" } }),
      prisma.event.count({ where: { status: "COMPLETED" } }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "ATTENDEE" } }),
      prisma.event.count({ where: { status: "PUBLISHED", startDateTime: { gt: now } } }),
      prisma.event.findMany({ orderBy: { startDateTime: "asc" }, include: { _count: { select: { registrations: true } } } }),
      prisma.registration.findMany({ select: { status: true, registeredAt: true, eventId: true } }),
    ]);

    const stats: DashboardStats = { totalEvents, publishedEvents, draftEvents, cancelledEvents, completedEvents, totalRegistrations, activeRegistrations, totalAttendees, upcomingEvents, nearingCapacity: eventRows.filter((event) => event.capacity > 0 && event.seatsTaken / event.capacity >= 0.8 && event.status === "PUBLISHED").length };
    const registrationsByEvent = eventRows.map((event) => {
      const related = registrationRows.filter((registration) => registration.eventId === event.id);
      const cancelled = related.filter((registration) => registration.status === "CANCELLED").length;
      return { eventId: event.id, title: event.title, active: event.seatsTaken, cancelled, capacity: event.capacity, utilization: event.capacity ? Math.round((event.seatsTaken / event.capacity) * 100) : 0 };
    }).sort((a, b) => b.active - a.active);
    const months = new Map<string, number>();
    for (const registration of registrationRows) {
      const key = registration.registeredAt.toLocaleString("en", { month: "short", year: "numeric" });
      months.set(key, (months.get(key) ?? 0) + 1);
    }
    const statusCounts = new Map<string, number>();
    for (const registration of registrationRows) statusCounts.set(registration.status, (statusCounts.get(registration.status) ?? 0) + 1);
    const report: ReportData = { registrationsByEvent, registrationsByMonth: [...months.entries()].map(([month, count]) => ({ month, count })), statusBreakdown: [...statusCounts.entries()].map(([status, count]) => ({ status, count })) };
    return success({ stats, report });
  } catch (error) {
    return errorResponse(error);
  }
}
