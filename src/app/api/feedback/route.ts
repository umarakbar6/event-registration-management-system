import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError, errorResponse, success } from "@/lib/errors";
import { readJson } from "@/lib/http";
import { requireCsrf } from "@/lib/security";
import { feedbackSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    const user = await requireUser();
    const input = feedbackSchema.parse(await readJson(request));
    const registration = await prisma.registration.findUnique({ where: { userId_eventId: { userId: user.id, eventId: input.eventId } }, include: { event: true } });
    if (!registration || registration.status !== "ATTENDED" || registration.event.endDateTime > new Date()) throw new AppError("FEEDBACK_NOT_AVAILABLE", "Feedback is available after you attend a completed event.", 409);
    const existing = await prisma.feedback.findUnique({ where: { userId_eventId: { userId: user.id, eventId: input.eventId } }, select: { id: true } });
    if (existing) throw new AppError("FEEDBACK_ALREADY_SUBMITTED", "Feedback has already been submitted for this event.", 409);
    const feedback = await prisma.feedback.create({ data: { userId: user.id, eventId: input.eventId, rating: input.rating, comment: input.comment } });
    return success({ feedback, message: "Thank you for your feedback." }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
