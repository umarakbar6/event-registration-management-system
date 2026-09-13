import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import { readJson } from "@/lib/http";
import { registerSchema } from "@/lib/validation";
import { requireCsrf, setSessionCookie } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    const input = registerSchema.parse(await readJson(request));
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists.", code: "EMAIL_EXISTS" }, { status: 409 });
    const user = await prisma.user.create({ data: { name: input.name, email, passwordHash: await hashPassword(input.password), role: "ATTENDEE" }, select: { id: true, name: true, email: true, role: true } });
    const response = success({ user: { ...user, role: user.role }, message: "Your account is ready." }, 201);
    setSessionCookie(response, await createSession(user.id));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return NextResponse.json({ error: "An account with this email already exists.", code: "EMAIL_EXISTS" }, { status: 409 });
    return errorResponse(error);
  }
}
