import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves an image path to a full URL.
 * - Absolute URLs (http/https) are returned as-is (e.g. seeded Unsplash photos, Google avatars)
 * - Relative paths (/storage/...) are prefixed with NEXT_PUBLIC_STORAGE_URL
 */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/$/, '')
  return `${base}/${path}`
}
