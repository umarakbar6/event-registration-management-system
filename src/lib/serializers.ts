import { remainingSeats } from "./registrationRules";
import type { EventRecord, RegistrationRecord } from "./types";

export function serializeEvent(event: { id: string; title: string; description: string; location: string; startDateTime: Date; endDateTime: Date; capacity: number; seatsTaken: number; status: string; category: string | null; imageUrl: string | null; createdAt?: Date; updatedAt?: Date }, registrationStatus?: string | null): EventRecord {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime.toISOString(),
    capacity: event.capacity,
    seatsTaken: event.seatsTaken,
    remainingSeats: remainingSeats(event.capacity, event.seatsTaken),
    status: event.status as EventRecord["status"],
    category: event.category,
    imageUrl: event.imageUrl,
    registrationStatus: (registrationStatus as EventRecord["registrationStatus"]) ?? null,
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}

export function serializeRegistration(registration: { id: string; status: string; registeredAt: Date; cancelledAt: Date | null; event: Parameters<typeof serializeEvent>[0]; user?: { id: string; name: string; email: string } | null }): RegistrationRecord {
  return {
    id: registration.id,
    status: registration.status as RegistrationRecord["status"],
    registeredAt: registration.registeredAt.toISOString(),
    cancelledAt: registration.cancelledAt?.toISOString() ?? null,
    event: serializeEvent(registration.event),
    user: registration.user ? { id: registration.user.id, name: registration.user.name, email: registration.user.email } : undefined,
  };
}
