import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse, success } from "@/lib/errors";
import { readJson } from "@/lib/http";
import { requireCsrf } from "@/lib/security";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  try {
    return success({ user: await requireUser() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    requireCsrf(request);
    const current = await requireUser();
    const input = profileSchema.parse(await readJson(request));
    const user = await prisma.user.update({ where: { id: current.id }, data: { name: input.name }, select: { id: true, name: true, email: true, role: true } });
    return success({ user, message: "Profile updated." });
  } catch (error) {
    return errorResponse(error);
  }
}
