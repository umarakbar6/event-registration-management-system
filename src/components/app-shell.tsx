"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChartNoAxesCombined, Compass, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Ticket, X } from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/types";
import { logout } from "@/lib/api";
import { Button, cn } from "./ui";
import { toast } from "sonner";

export function AppShell({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const links = user ? (isAdmin ? [{ href: "/admin", label: "Overview", icon: LayoutDashboard }, { href: "/admin/events", label: "Events", icon: CalendarDays }, { href: "/admin/registrations", label: "Registrations", icon: Ticket }, { href: "/admin/reports", label: "Reports", icon: ChartNoAxesCombined }] : [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/dashboard/registrations", label: "My registrations", icon: Ticket }, { href: "/dashboard/profile", label: "Profile", icon: Settings }]) : [];
  async function signOut() {
    try { await logout(); toast.success("You are signed out."); router.push("/"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not sign out."); }
  }
  return <div className="min-h-screen bg-mist text-ink">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white"><Compass size={18} /></span><span className="text-base font-black tracking-tight">Gatherly</span></Link>
        <nav className="hidden items-center gap-6 md:flex"><Link className="text-sm font-semibold text-slate-600 hover:text-ink" href="/events">Browse events</Link>{user ? <span className="text-sm text-slate-400">{user.name}</span> : <><Link className="text-sm font-semibold text-slate-600 hover:text-ink" href="/login">Log in</Link><Link href="/register" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-[#243a57]">Create account</Link></>}</nav>
        <button className="rounded-lg p-2 text-slate-600 md:hidden" aria-label="Open navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
    {user ? <aside className="hidden md:fixed md:inset-y-16 md:flex md:w-60 md:flex-col md:border-r md:border-slate-200 md:bg-white"><div className="flex-1 p-4"><p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Workspace</p>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition", pathname === href || (href !== "/admin" && href !== "/dashboard" && pathname.startsWith(href)) ? "bg-blue-50 text-ocean" : "text-slate-600 hover:bg-slate-50 hover:text-ink")}><Icon size={18} />{label}</Link>)}</div><div className="border-t border-slate-100 p-4"><div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{user.name}</p><p className="truncate text-xs text-slate-400">{isAdmin ? "Administrator" : user.email}</p></div></div><Button variant="quiet" className="w-full justify-start" onClick={signOut}><LogOut size={16} />Sign out</Button></div></aside> : null}
    {open ? <div className="fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden"><Link className="mb-2 block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700" href="/events" onClick={() => setOpen(false)}>Browse events</Link>{user ? <>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700"><Icon size={17} />{label}</Link>)}<button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600"><LogOut size={17} />Sign out</button></> : <><Link className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700" href="/login" onClick={() => setOpen(false)}>Log in</Link><Link className="block rounded-xl bg-ink px-3 py-3 text-center text-sm font-bold text-white" href="/register" onClick={() => setOpen(false)}>Create account</Link></>}</div> : null}
    <main className={user ? "md:pl-60" : ""}>{children}</main>
  </div>;
}
