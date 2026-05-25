import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...opts,
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('es-DO', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(date))
}