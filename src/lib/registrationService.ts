import type { Prisma } from "@prisma/client";
import { AppError } from "./errors";
import { assertRegistrationAllowed } from "./registrationRules";

type Transaction = Prisma.TransactionClient;

export async function registerForEvent(transaction: Transaction, userId: string, eventId: string) {
  const now = new Date();
  const event = await transaction.event.findUnique({ where: { id: eventId } });
  const existing = await transaction.registration.findUnique({ where: { userId_eventId: { userId, eventId } } });
  assertRegistrationAllowed({ eventExists: Boolean(event), eventStatus: event?.status ?? "", startsAt: event?.startDateTime ?? now, capacity: event?.capacity ?? 0, seatsTaken: event?.seatsTaken ?? 0, alreadyActive: existing?.status === "ACTIVE", now });

  const reservation = await transaction.event.updateMany({
    where: { id: eventId, status: "PUBLISHED", startDateTime: { gt: now }, seatsTaken: { lt: event!.capacity } },
    data: { seatsTaken: { increment: 1 } },
  });
  if (reservation.count !== 1) throw new AppError("EVENT_FULL", "This event is full.", 409);

  if (existing) {
    return transaction.registration.update({ where: { id: existing.id }, data: { status: "ACTIVE", registeredAt: now, cancelledAt: null }, include: { event: true } });
  }
  return transaction.registration.create({ data: { userId, eventId, status: "ACTIVE", registeredAt: now }, include: { event: true } });
}

export async function cancelRegistration(transaction: Transaction, registrationId: string, userId: string, isAdmin = false) {
  const registration = await transaction.registration.findUnique({ where: { id: registrationId }, include: { event: true } });
  if (!registration) throw new AppError("REGISTRATION_NOT_FOUND", "Registration not found.", 404);
  if (!isAdmin && registration.userId !== userId) throw new AppError("FORBIDDEN", "You can only manage your own registrations.", 403);
  if (registration.status !== "ACTIVE") throw new AppError("REGISTRATION_CLOSED", "This registration is already closed.", 409);

  await transaction.event.updateMany({ where: { id: registration.eventId, seatsTaken: { gt: 0 } }, data: { seatsTaken: { decrement: 1 } } });
  return transaction.registration.update({ where: { id: registrationId }, data: { status: "CANCELLED", cancelledAt: new Date() }, include: { event: true } });
}
