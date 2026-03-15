import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoreUrl(companySlug: string | undefined, path: string) {
  if (!companySlug) return path;

  // Use environment variable for root domain detection if available, otherwise fallback to generic check
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ""

  // In Next.js client-side, window.location.host is available
  const currentHost = typeof window !== 'undefined' ? window.location.host : ""

  // Case 1: Accessed via local development without a specific domain mapping (e.g., localhost:3000/slug/...)
  // Case 2: Accessed via the root domain directly (e.g., flairecosystem.com/slug/...)
  // In these cases, we need the slug prefix.
  const isRootDomain = !currentHost || currentHost === rootDomain || currentHost.startsWith('localhost') && !currentHost.includes('.')

  if (isRootDomain) {
    return `/${companySlug}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // Case 3: Accessed via subdomain or custom domain (e.g., store.com/path or store.flair.com/path)
  // The middleware already rewrote this internally, so we don't need the slug in the URL.
  return path.startsWith('/') ? path : `/${path}`;
}
