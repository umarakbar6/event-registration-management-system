import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { createOpaqueToken, hashToken, sessionCookieName } from "./security";
import type { Role, SessionUser } from "./types";

const publicUserSelect = { id: true, name: true, email: true, role: true } as const;

export async function createSession(userId: string) {
  const token = createOpaqueToken();
  await prisma.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) } });
  return token;
}

export async function destroySession(token?: string) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: { select: publicUserSelect } } });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await destroySession(token);
    return null;
  }
  return { ...session.user, role: session.user.role as Role };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ForbiddenError("Only administrators can access this area.");
  return user;
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
