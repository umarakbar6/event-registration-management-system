import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { EventRecord } from "@/lib/types";
import { StatusBadge } from "./ui";

export function EventCard({ event }: { event: EventRecord }) {
  const full = event.remainingSeats === 0;
  return <Link href={`/events/${event.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-44 overflow-hidden bg-slate-100"><img src={event.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80"} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute left-4 top-4"><StatusBadge status={event.status} /></div><div className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-ink shadow">{full ? "Event full" : `${event.remainingSeats} seats left`}</div></div><div className="p-5"><p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-ocean">{event.category || "Gatherly event"}</p><h3 className="line-clamp-2 text-lg font-black tracking-tight text-ink group-hover:text-ocean">{event.title}</h3><div className="mt-4 space-y-2 text-sm text-slate-500"><p className="flex items-center gap-2"><CalendarDays size={15} className="text-ocean" />{format(new Date(event.startDateTime), "EEE, MMM d · h:mm a")}</p><p className="flex items-center gap-2"><MapPin size={15} className="text-ocean" />{event.location}</p><p className="flex items-center gap-2"><Users size={15} className="text-ocean" />{event.seatsTaken} registered of {event.capacity}</p></div></div></Link>;
}
