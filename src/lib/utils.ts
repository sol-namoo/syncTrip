import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTripDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}
