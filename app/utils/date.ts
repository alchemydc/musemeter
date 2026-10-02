export const buildLocalEventDate = (localDate: string, localTime?: string): Date => {
  // Validate basic YYYY-MM-DD format
  if (!localDate || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return new Date(NaN);
  }

  const parts = localDate.split('-').map((p: string) => parseInt(p, 10));
  const year = parts[0];
  const month = (parts[1] || 1) - 1; // monthIndex
  const day = parts[2] || 1;

  let hour = 0;
  let minute = 0;
  if (localTime) {
    const timeParts = localTime.split(':').map((p: string) => parseInt(p, 10));
    hour = timeParts[0] || 0;
    minute = timeParts[1] || 0;
  }

  // Construct using Date(year, monthIndex, day, hour, minute) which creates a date in the local timezone
  return new Date(year, month, day, hour, minute);
};

export const formatDisplayDate = (date: Date): string => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDisplayTime = (date: Date): string => {
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const pad = (n: number) => String(n).padStart(2, '0');
const dateStamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const dateTimeStamp = (d: Date) => `${dateStamp(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

// Google Calendar `dates` value in floating (zone-less) local time; pair with `ctz` for the venue's timezone.
// Without a start time the event becomes an all-day entry.
export const formatCalendarDates = (localDate: string, localTime?: string, durationHours = 3): string => {
  const start = buildLocalEventDate(localDate, localTime);
  if (Number.isNaN(start.getTime())) return '';

  if (!localTime) {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    return `${dateStamp(start)}/${dateStamp(next)}`;
  }

  const end = new Date(start);
  end.setHours(end.getHours() + durationHours);
  return `${dateTimeStamp(start)}/${dateTimeStamp(end)}`;
};

export interface DayHeading {
  relative: 'Today' | 'Tomorrow' | null;
  weekday: string;
  day: string;
  month: string;
  year: string | null;
}

// Parts for a listing's day heading. Year is only included when it differs from `today`'s.
export const getDayHeading = (localDate: string, today: Date = new Date()): DayHeading | null => {
  const date = buildLocalEventDate(localDate);
  if (Number.isNaN(date.getTime())) return null;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Round rather than floor so a DST shift between the two dates doesn't skew the count
  const daysAway = Math.round((date.getTime() - startOfToday.getTime()) / 86_400_000);

  return {
    relative: daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : null,
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    year: date.getFullYear() !== today.getFullYear() ? String(date.getFullYear()) : null,
  };
};

// Groups consecutive items sharing a start date; the API already returns events sorted by date.
export const groupByLocalDate = <T extends { dates: { start: { localDate: string } } }>(items: T[]) => {
  const groups: { localDate: string; items: T[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.localDate === item.dates.start.localDate) {
      last.items.push(item);
    } else {
      groups.push({ localDate: item.dates.start.localDate, items: [item] });
    }
  }
  return groups;
};
