import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoreUrl(companySlug: string | undefined, path: string) {
  if (!companySlug) return path;
  
  // Custom domains and subdomains typically contain a dot.
  // If so, the middleware has routed them without the slug prefix in the physical domain.
  if (companySlug.includes('.')) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  return `/${companySlug}${path.startsWith('/') ? path : `/${path}`}`;
}
