import { getCurrentUser } from "@/lib/auth";
import { success } from "@/lib/errors";

export async function GET() {
  return success({ user: await getCurrentUser() });
}
