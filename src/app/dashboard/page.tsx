import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AttendeeDashboard } from "@/components/attendee-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  return <AttendeeDashboard user={user} />;
}
