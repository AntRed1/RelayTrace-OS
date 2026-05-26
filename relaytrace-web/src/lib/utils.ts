import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date,
  opts?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("es-DO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function safeFormat(
  date: string | null | undefined,
  fmt: string,
): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return format(d, fmt);
}
