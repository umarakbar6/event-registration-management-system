import type { LucideIcon } from "lucide-react";
import { Card } from "./ui";

export function StatCard({ label, value, helper, icon: Icon, tone = "blue" }: { label: string; value: string | number; helper: string; icon: LucideIcon; tone?: "blue" | "mint" | "coral" | "ink" }) {
  const tones = { blue: "bg-blue-50 text-ocean", mint: "bg-emerald-50 text-emerald-700", coral: "bg-orange-50 text-orange-700", ink: "bg-slate-100 text-ink" };
  return <Card className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black tracking-tight text-ink">{value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></div></div><p className="mt-4 text-xs font-semibold text-slate-400">{helper}</p></Card>;
}
