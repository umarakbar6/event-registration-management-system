import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminEventsPage } from "@/components/admin-events-page";

export default async function AdminEventsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <AdminEventsPage />; }
