import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ReportsPage } from "@/components/reports-page";

export default async function AdminReportsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <ReportsPage />; }
