import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { errorResponse, success, AppError } from "@/lib/errors";
import { readJson } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { requireCsrf, setSessionCookie } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    const input = loginSchema.parse(await readJson(request));
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, select: { id: true, name: true, email: true, role: true, passwordHash: true } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new AppError("INVALID_CREDENTIALS", "Email or password is not correct.", 401);
    const response = success({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, message: "Welcome back." });
    setSessionCookie(response, await createSession(user.id));
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
