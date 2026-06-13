/**
 * Calculates the number of working days between two dates (inclusive).
 * Weekends (Saturday and Sunday) are excluded.
 * Returns at least 1 working day, even if the dates fall on a weekend or are identical.
 * 
 * @param fromDate Start date string (YYYY-MM-DD)
 * @param toDate End date string (YYYY-MM-DD)
 */
export function calculateLeaveDays(fromDate: string, toDate: string): number {
  if (!fromDate || !toDate) return 1;

  const [year1, month1, day1] = fromDate.split('-').map(Number);
  const start = new Date(year1, month1 - 1, day1);

  const [year2, month2, day2] = toDate.split('-').map(Number);
  const end = new Date(year2, month2 - 1, day2);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 1;
  }

  if (start > end) {
    return 1;
  }

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count > 0 ? count : 1;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO timestamp) into "DD MMM YYYY" format (e.g. "15 Jun 2026").
 * 
 * @param dateStr Date string to format
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

  let date: Date;
  if (dateStr.includes('T')) {
    date = new Date(dateStr);
  } else {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      date = new Date(dateStr);
    } else {
      date = new Date(year, month - 1, day);
    }
  }

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNum = date.getDate();
  const monthStr = months[date.getMonth()];
  const yearNum = date.getFullYear();

  return `${dayNum} ${monthStr} ${yearNum}`;
}
