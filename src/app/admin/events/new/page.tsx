import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { EventForm } from "@/components/event-form";

export default async function NewEventPage() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "ADMIN") redirect("/dashboard"); return <EventForm mode="create" />; }
