export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function combineDateAndTime(date: Date | string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

export function combineScheduleDateAndTime(date: Date | string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(date);

  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    hours,
    minutes,
    0,
    0
  );
}

export function isScheduleSlotInFuture(date: Date | string, startTime: string, now = new Date()): boolean {
  return combineScheduleDateAndTime(date, startTime).getTime() > now.getTime();
}
