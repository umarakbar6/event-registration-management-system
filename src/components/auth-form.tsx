"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button, Input, Label, ErrorMessage } from "./ui";
import { toast } from "sonner";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function change(key: keyof typeof form, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const response = await apiRequest<{ user: { role: string }; message: string }>(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      toast.success(response.message);
      router.push(response.user.role === "ADMIN" ? "/admin" : "/dashboard"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); } finally { setBusy(false); }
  }
  return <div className="min-h-[calc(100vh-4rem)] bg-mist px-4 py-12"><div className="mx-auto max-w-md"><div className="mb-8 text-center"><Link href="/" className="text-sm font-black text-ocean">Gatherly</Link><h1 className="mt-5 text-3xl font-black tracking-tight text-ink">{isRegister ? "Make room for good things" : "Welcome back"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{isRegister ? "Create your attendee account and start finding your next event." : "Sign in to view your events and registrations."}</p></div><div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft sm:p-8"><form onSubmit={submit} className="space-y-5">{error ? <ErrorMessage message={error} /> : null}{isRegister ? <div><Label htmlFor="name">Full name</Label><Input id="name" value={form.name} onChange={(event) => change("name", event.target.value)} autoComplete="name" placeholder="Your full name" required /></div> : null}<div><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={form.email} onChange={(event) => change("email", event.target.value)} autoComplete="email" placeholder="you@example.com" required /></div><div><Label htmlFor="password" hint={isRegister ? "8 characters, with a number and uppercase letter" : undefined}>Password</Label><Input id="password" type="password" value={form.password} onChange={(event) => change("password", event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Enter your password" required /></div>{isRegister ? <div><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(event) => change("confirmPassword", event.target.value)} autoComplete="new-password" placeholder="Repeat your password" required /></div> : null}<Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait" : isRegister ? "Create account" : "Log in"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">{isRegister ? "Already have an account?" : "New to Gatherly?"} <Link className="font-bold text-ocean hover:underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></p></div></div></div>;
}
