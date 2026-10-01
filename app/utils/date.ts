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
