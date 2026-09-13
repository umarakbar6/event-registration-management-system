"use client";

import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getEvents } from "@/lib/api";
import type { EventRecord } from "@/lib/types";
import { Button, EmptyState, Input, PageLoader, Select } from "./ui";
import { EventCard } from "./event-card";

export function EventsExplorer() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("soonest");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  async function load() { setBusy(true); setError(""); try { const query = new URLSearchParams(); if (search) query.set("search", search); if (availability !== "all") query.set("availability", availability); query.set("sort", sort); const data = await getEvents(`?${query.toString()}`); setEvents(data.events); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load events."); } finally { setBusy(false); } }
  useEffect(() => { const timer = window.setTimeout(load, 220); return () => window.clearTimeout(timer); }, [search, availability, sort]);
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-ocean"><Sparkles size={14} /> Find your next room</p><h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">Upcoming events</h1><p className="mt-4 text-base leading-7 text-slate-600">Explore useful conversations, practical workshops, and community moments worth showing up for.</p></div><div className="mt-9 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft"><div className="grid gap-3 md:grid-cols-[1fr_190px_190px]"><div className="relative"><Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or location" aria-label="Search events" /></div><Select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter availability"><option value="all">All availability</option><option value="available">Available seats</option></Select><Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort events"><option value="soonest">Soonest first</option><option value="popular">Most registered</option><option value="capacity">Largest capacity</option></Select></div><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400"><SlidersHorizontal size={14} /> Showing published events that have not started yet</div></div>{busy ? <PageLoader /> : error ? <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : events.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="mt-8"><EmptyState title="No upcoming events found" text="Try a different search or check back soon for the next gathering." /></div>}</div>;
}
