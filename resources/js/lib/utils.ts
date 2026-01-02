import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSameUrl(cpath: string, url: any) {
  return cpath === url || (typeof url === 'string' && url !== '/' && cpath?.startsWith(url));
}

export function resolveUrl(url: any) {
  return url as string;
}
