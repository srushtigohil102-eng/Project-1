/**
 * Safely parses a date string (ISO or YYYY-MM-DD) into a Date object.
 * Returns null for invalid input.
 */
function parseDateStr(dateStr: string): Date | null {
  if (!dateStr) return null;

  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month - 1, day);
}

/**
 * Calculates the number of working days between two dates (inclusive).
 * Weekends (Saturday and Sunday) are excluded.
 * Returns at least 1 working day, even if the dates fall on a weekend or are identical.
 *
 * Handles both ISO strings ("2026-06-15T00:00:00.000Z") and plain date strings ("2026-06-15").
 */
export function calculateLeaveDays(fromDate: string, toDate: string): number {
  const start = parseDateStr(fromDate);
  const end = parseDateStr(toDate);

  if (!start || !end) return 1;
  if (start > end) return 1;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count > 0 ? count : 1;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO timestamp) into "DD MMM YYYY" format (e.g. "15 Jun 2026").
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

  const date = parseDateStr(dateStr);
  if (!date) return dateStr;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Converts any date string (ISO or YYYY-MM-DD) into "YYYY-MM-DD" format for use in date inputs.
 */
export function formatDateForInput(dateStr: string): string {
  if (!dateStr) return '';

  const date = parseDateStr(dateStr);
  if (!date) return dateStr;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a Date into a relative time string (e.g. "5 minutes ago", "2 days ago").
 * Falls back to formatDate for anything older than 7 days.
 *
 * @param date The Date object to format
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return formatDate(date.toISOString());
}
