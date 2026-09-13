import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <AdminDashboard />; }
