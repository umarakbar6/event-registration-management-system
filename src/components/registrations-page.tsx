"use client";

import Link from "next/link";
import { CalendarDays, ClipboardCopy, Download, MapPin, MessageSquare, Ticket, UserCheck, UserX, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { cancelRegistration, getRegistrations, submitFeedback, updateRegistration } from "@/lib/api";
import type { RegistrationRecord } from "@/lib/types";
import { Button, Card, EmptyState, PageLoader, StatusBadge } from "./ui";
import { toast } from "sonner";

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

type FeedbackDraft = { rating: string; comment: string };

export function RegistrationsPage({ admin = false }: { admin?: boolean }) {
  const [items, setItems] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, FeedbackDraft>>({});

  async function load() {
    setLoading(true);
    try {
      const query = admin ? `?scope=admin${filter !== "ALL" ? `&status=${filter}` : ""}` : `${filter !== "ALL" ? `?status=${filter}` : ""}`;
      const response = await getRegistrations(query);
      setItems(response.registrations);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [filter, admin]);

  async function cancel(id: string) {
    if (!window.confirm("Cancel this registration?")) return;
    setBusy(id);
    try {
      await cancelRegistration(id);
      toast.success("Registration cancelled.");
      setItems((current) => current.map((item) => item.id === id ? { ...item, status: "CANCELLED", cancelledAt: new Date().toISOString() } : item));
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not cancel registration.");
    } finally {
      setBusy("");
    }
  }

  async function changeStatus(id: string, status: string) {
    setBusy(`${id}:${status}`);
    try {
      const response = await updateRegistration(id, status);
      setItems((current) => current.map((item) => item.id === id ? response.registration : item));
      toast.success("Registration updated.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not update registration.");
    } finally {
      setBusy("");
    }
  }

  function draftFor(item: RegistrationRecord): FeedbackDraft {
    return feedbackDrafts[item.id] ?? { rating: "5", comment: "" };
  }

  function updateFeedbackDraft(item: RegistrationRecord, patch: Partial<FeedbackDraft>) {
    setFeedbackDrafts((current) => ({ ...current, [item.id]: { ...draftFor(item), ...patch } }));
  }

  async function sendFeedback(item: RegistrationRecord) {
    const draft = draftFor(item);
    if (draft.comment.trim().length < 5) {
      toast.error("Please write at least 5 characters of feedback.");
      return;
    }
    setBusy(`feedback:${item.id}`);
    try {
      await submitFeedback(item.event.id, Number(draft.rating), draft.comment.trim());
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, feedbackSubmitted: true } : entry));
      toast.success("Thank you for your feedback.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not submit feedback.");
    } finally {
      setBusy("");
    }
  }

  const filtered = items.filter((item) => !search || item.event.title.toLowerCase().includes(search.toLowerCase()) || item.user?.name.toLowerCase().includes(search.toLowerCase()) || item.user?.email.toLowerCase().includes(search.toLowerCase()));
  const attendeeList = filtered.map((item) => `${item.user?.name ?? "Attendee"}\t${item.user?.email ?? ""}\t${item.event.title}\t${item.event.location}\t${format(new Date(item.event.startDateTime), "MMM d, yyyy h:mm a")}\t${item.status}`).join("\n");
  const csv = ["Attendee,Email,Event,Location,Event date,Registration date,Status", ...filtered.map((item) => [item.user?.name ?? "Attendee", item.user?.email ?? "", item.event.title, item.event.location, format(new Date(item.event.startDateTime), "MMM d, yyyy h:mm a"), format(new Date(item.registeredAt), "MMM d, yyyy h:mm a"), item.status].map(csvCell).join(","))].join("\n");

  async function copyList() {
    try {
      await navigator.clipboard.writeText(attendeeList);
      toast.success("Attendee list copied.");
    } catch {
      toast.error("Could not copy the attendee list.");
    }
  }

  function downloadCsv() {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gatherly-attendee-list.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Attendee list downloaded.");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-ocean">{admin ? "Operations" : "Your tickets"}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">{admin ? "All registrations" : "My registrations"}</h1>
          <p className="mt-2 text-sm text-slate-500">{admin ? "Monitor every attendee seat and registration status." : "Keep track of the events you plan to attend."}</p>
        </div>
        {admin ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyList} disabled={!filtered.length}><ClipboardCopy size={16} /> Copy list</Button>
            <Button variant="secondary" onClick={downloadCsv} disabled={!filtered.length}><Download size={16} /> Download CSV</Button>
          </div>
        ) : <Link href="/events" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white">Find another event <Ticket size={16} /></Link>}
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={admin ? "Search attendee or event" : "Search your events"} className="min-h-11 flex-1 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-ocean" />
          <div className="flex gap-2 overflow-x-auto">
            {["ALL", "ACTIVE", "CANCELLED", "ATTENDED", "NO_SHOW"].map((value) => <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${filter === value ? "bg-ink text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{value === "ALL" ? "All" : value === "NO_SHOW" ? "No show" : value[0] + value.slice(1).toLowerCase()}</button>)}
          </div>
        </div>

        {loading ? <PageLoader /> : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-400"><tr><th className="px-5 py-4">Event</th>{admin ? <th className="px-5 py-4">Attendee</th> : null}<th className="px-5 py-4">When</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const feedbackEligible = !admin && item.status === "ATTENDED" && new Date(item.event.endDateTime) <= new Date();
                  return <tr key={item.id} className="text-sm">
                    <td className="px-5 py-4"><div className="flex items-start gap-3"><div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img src={item.event.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=160&q=80"} alt="" className="h-full w-full object-cover" /></div><div><Link href={`/events/${item.event.id}`} className="font-bold text-ink hover:text-ocean">{item.event.title}</Link><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin size={12} />{item.event.location}</p>{feedbackEligible ? item.feedbackSubmitted ? <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700"><MessageSquare size={13} /> Feedback submitted</p> : <div className="mt-3 max-w-sm rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="text-xs font-black uppercase tracking-[0.1em] text-ocean">Share your feedback</p><div className="mt-2 grid gap-2 sm:grid-cols-[100px_1fr]"><select aria-label={`Rating for ${item.event.title}`} value={draftFor(item).rating} onChange={(event) => updateFeedbackDraft(item, { rating: event.target.value })} className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><textarea aria-label={`Feedback for ${item.event.title}`} value={draftFor(item).comment} onChange={(event) => updateFeedbackDraft(item, { comment: event.target.value })} placeholder="What was useful?" rows={2} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-ocean" /></div><Button variant="secondary" className="mt-2 min-h-9 px-3 text-xs" disabled={busy === `feedback:${item.id}`} onClick={() => void sendFeedback(item)}>{busy === `feedback:${item.id}` ? "Sending" : "Send feedback"}</Button></div> : null}</div></div></td>
                    {admin ? <td className="px-5 py-4"><p className="font-semibold text-ink">{item.user?.name}</p><p className="text-xs text-slate-400">{item.user?.email}</p></td> : null}
                    <td className="px-5 py-4"><p className="font-semibold text-ink">{format(new Date(item.event.startDateTime), "MMM d, yyyy")}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={12} /> Registered {format(new Date(item.registeredAt), "MMM d")}</p></td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4 text-right"><div className="flex flex-wrap justify-end gap-2">
                      {admin ? item.status === "ACTIVE" ? <><Button variant="quiet" className="text-emerald-700" disabled={busy.length > 0} onClick={() => void changeStatus(item.id, "ATTENDED")}><UserCheck size={15} /> Attended</Button><Button variant="quiet" className="text-rose-600" disabled={busy.length > 0} onClick={() => void changeStatus(item.id, "NO_SHOW")}><UserX size={15} /> No show</Button></> : <Button variant="outline" className="min-h-9 px-3 text-xs" disabled={busy.length > 0} onClick={() => void changeStatus(item.id, "ACTIVE")}>Set active</Button> : item.status === "ACTIVE" ? <Button variant="quiet" className="text-rose-600" disabled={busy === item.id} onClick={() => void cancel(item.id)}><XCircle size={15} />{busy === item.id ? "Cancelling" : "Cancel"}</Button> : <span className="text-xs text-slate-400">No action</span>}
                    </div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="p-5"><EmptyState title={admin ? "No registrations match your filters" : "You have no registrations yet"} text={admin ? "Try a different search or status filter." : "Browse upcoming events and save your first seat."} action={!admin ? <Link href="/events" className="font-bold text-ocean">Browse events</Link> : undefined} /></div>}
      </Card>
    </div>
  );
}
