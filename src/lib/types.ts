export type Role = "ATTENDEE" | "ADMIN";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type RegistrationStatus = "ACTIVE" | "CANCELLED" | "ATTENDED" | "NO_SHOW";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  seatsTaken: number;
  remainingSeats: number;
  status: EventStatus;
  category: string | null;
  imageUrl: string | null;
  registrationStatus?: RegistrationStatus | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RegistrationRecord = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  cancelledAt: string | null;
  feedbackSubmitted?: boolean;
  event: Pick<EventRecord, "id" | "title" | "location" | "startDateTime" | "endDateTime" | "status" | "capacity" | "seatsTaken" | "remainingSeats" | "imageUrl">;
  user?: Pick<SessionUser, "id" | "name" | "email">;
};

export type DashboardStats = {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  activeRegistrations: number;
  totalAttendees: number;
  upcomingEvents: number;
  nearingCapacity: number;
};

export type ReportData = {
  registrationsByEvent: Array<{ eventId: string; title: string; active: number; cancelled: number; capacity: number; utilization: number }>;
  registrationsByMonth: Array<{ month: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
};
