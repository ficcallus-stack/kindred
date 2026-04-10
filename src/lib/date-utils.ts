import { isWithinInterval, startOfWeek, endOfWeek } from "date-fns";

/**
 * Checks if a given ISO date string is within the current ISO week (Mon-Sun).
 */
export function isWithinCurrentWeek(dateStr?: string): boolean {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  // startOfWeek with { weekStartsOn: 1 } for Monday
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  
  return isWithinInterval(date, { start, end });
}
