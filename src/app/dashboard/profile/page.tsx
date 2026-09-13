import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfilePage } from "@/components/profile-page";

export default async function ProfileRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <ProfilePage />; }
