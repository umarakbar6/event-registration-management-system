import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegistrationsPage } from "@/components/registrations-page";

export default async function AdminRegistrationsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <RegistrationsPage admin />; }
