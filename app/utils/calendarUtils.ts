// Calendar constants
export const CALENDAR_START_HOUR = 9;
export const CALENDAR_END_HOUR = 21;
export const TOTAL_HOURS = CALENDAR_END_HOUR - CALENDAR_START_HOUR;

// Appointment type (matches existing data model)
export interface Appointment {
  id: number;
  _id?: string; // MongoDB ID for editing
  clientName: string;
  staffName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "cancelled" | "in_progress" | "completed";
  phone: string;
  notes?: string;
}

// Week calculation functions

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0 becomes -6 to go back to Monday)
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0); // Reset time to start of day
  return monday;
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });
}

export function navigateWeek(currentWeekStart: Date, offset: number): Date {
  const newDate = new Date(currentWeekStart);
  newDate.setDate(currentWeekStart.getDate() + (offset * 7));
  return newDate;
}

// Time parsing and formatting

export function parseTime(timeStr: string): { hour: number; minutes: number } {
  const [time, period] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minutes = parseInt(minuteStr);

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minutes };
}

export function formatTime(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

export function formatTimeShort(hour: number): string {
  if (hour === 0) return '12a';
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return '12p';
  return `${hour - 12}p`;
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Appointment positioning (15-minute precision)

export function calculateAppointmentPosition(
  timeStr: string,
  duration: number,
  cellHeight: number
): { top: number; height: number } {
  const { hour, minutes } = parseTime(timeStr);

  // Calculate hours from calendar start (9 AM = 0)
  const hoursFromStart = hour - CALENDAR_START_HOUR;

  // Calculate fractional position within the hour (0-1)
  const minuteFraction = minutes / 60;

  // Total offset from top in hours (as decimal)
  const totalHoursOffset = hoursFromStart + minuteFraction;

  // Convert to pixels
  const top = totalHoursOffset * cellHeight;

  // Calculate height based on duration
  const durationInHours = duration / 60;
  const height = durationInHours * cellHeight;

  return { top, height };
}

// Filter appointments by date

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

export function isAppointmentOnDate(appointment: Appointment, date: Date): boolean {
  const apptDate = parseDate(appointment.date);
  return apptDate.toDateString() === date.toDateString();
}

export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeToString(hour: number, minutes: number = 0): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${displayHour}:${minuteStr} ${period}`;
}
