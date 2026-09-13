import { AppError } from "./errors";

export type RegistrationRuleInput = {
  eventExists: boolean;
  eventStatus: string;
  startsAt: Date;
  capacity: number;
  seatsTaken: number;
  alreadyActive: boolean;
  now?: Date;
};

export function assertRegistrationAllowed(input: RegistrationRuleInput) {
  const now = input.now ?? new Date();
  if (!input.eventExists) throw new AppError("EVENT_NOT_FOUND", "That event could not be found.", 404);
  if (input.eventStatus !== "PUBLISHED") throw new AppError("REGISTRATION_CLOSED", "This event is not open for registration.", 409);
  if (input.startsAt <= now) throw new AppError("EVENT_STARTED", "Registration is closed because this event has started or passed.", 409);
  if (input.alreadyActive) throw new AppError("ALREADY_REGISTERED", "You are already registered for this event.", 409);
  if (input.seatsTaken >= input.capacity) throw new AppError("EVENT_FULL", "This event is full.", 409);
}

export function remainingSeats(capacity: number, seatsTaken: number) {
  return Math.max(0, capacity - seatsTaken);
}
