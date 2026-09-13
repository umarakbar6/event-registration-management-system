"use client";

import { useEffect, useState } from "react";
import { getUser, updateProfile } from "@/lib/api";
import type { SessionUser } from "@/lib/types";
import { Button, Card, Input, Label, PageLoader } from "./ui";
import { toast } from "sonner";

export function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getUser().then(({ user: current }) => { setUser(current); setName(current?.name ?? ""); }).finally(() => setLoading(false)); }, []);
  async function save(event: React.FormEvent) { event.preventDefault(); setBusy(true); try { const response = await updateProfile(name); setUser(response.user); toast.success(response.message); } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not update your profile."); } finally { setBusy(false); } }
  if (loading) return <PageLoader />;
  if (!user) return null;
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.15em] text-ocean">Account</p><h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Your profile</h1><p className="mt-2 text-sm text-slate-500">Keep your details current for event communications.</p><Card className="mt-8 max-w-xl p-6 sm:p-8"><form onSubmit={save} className="space-y-5"><div><Label htmlFor="profileName">Full name</Label><Input id="profileName" value={name} onChange={(event) => setName(event.target.value)} /></div><div><Label htmlFor="profileEmail" hint="Email cannot be changed here">Email address</Label><Input id="profileEmail" value={user.email} disabled /></div><div className="flex items-center justify-between border-t border-slate-100 pt-5"><div><p className="text-sm font-bold text-ink">Account role</p><p className="mt-1 text-sm text-slate-500">{user.role === "ADMIN" ? "Administrator" : "Attendee"}</p></div><Button type="submit" disabled={busy || name.trim() === user.name}>{busy ? "Saving" : "Save changes"}</Button></div></form></Card></div>;
}
