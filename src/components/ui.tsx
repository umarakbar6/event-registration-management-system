import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({ className, variant = "primary", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" | "outline" }) {
  const variants = { primary: "bg-ink text-white hover:bg-[#243a57]", secondary: "bg-ocean text-white hover:bg-[#155bd2]", quiet: "bg-transparent text-slate-600 hover:bg-slate-100", danger: "bg-rose-600 text-white hover:bg-rose-700", outline: "border border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50" };
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props}>{children}</button>;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-ocean focus:ring-4 focus:ring-blue-100", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-ocean focus:ring-4 focus:ring-blue-100", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink outline-none transition focus:border-ocean focus:ring-4 focus:ring-blue-100", className)} {...props}>{children}</select>;
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{children}{hint ? <span className="ml-2 font-normal text-slate-400">{hint}</span> : null}</label>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-soft", className)}>{children}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const style: Record<string, string> = { PUBLISHED: "bg-emerald-50 text-emerald-700", DRAFT: "bg-amber-50 text-amber-700", CANCELLED: "bg-rose-50 text-rose-700", COMPLETED: "bg-slate-100 text-slate-600", ACTIVE: "bg-emerald-50 text-emerald-700", ATTENDED: "bg-blue-50 text-blue-700", NO_SHOW: "bg-rose-50 text-rose-700" };
  const label: Record<string, string> = { PUBLISHED: "Published", DRAFT: "Draft", CANCELLED: "Cancelled", COMPLETED: "Completed", ACTIVE: "Active", ATTENDED: "Attended", NO_SHOW: "No show" };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", style[status] ?? "bg-slate-100 text-slate-600")}>{label[status] ?? status}</span>;
}

export function PageLoader() {
  return <div className="flex min-h-[360px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-ocean" aria-label="Loading" /></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-ocean">✦</div><h3 className="text-lg font-bold text-ink">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{text}</p>{action ? <div className="mt-6">{action}</div> : null}</div>;
}

export function ErrorMessage({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{message}</div>;
}
