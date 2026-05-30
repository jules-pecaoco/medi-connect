"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { scheduleSchema } from "@/validators/auth";
import { addDays, isScheduleSlotInFuture, startOfDay } from "@/lib/date-utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Generate TimeSlot rows for a single DoctorSchedule for `weeksAhead` weeks
 * starting from today. Skips dates that already have slots for that schedule.
 */
async function generateSlotsForSchedule(
  scheduleId: string,
  doctorId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  slotDurationMinutes: number,
  weeksAhead = 4
) {
  const today = startOfDay(new Date());
  const slotsToCreate: {
    scheduleId: string;
    doctorId: string;
    date: Date;
    startTime: string;
    endTime: string;
  }[] = [];

  for (let week = 0; week < weeksAhead; week++) {
    // Find the next occurrence of dayOfWeek from today + week*7
    const base = addDays(today, week * 7);
    const diff = (dayOfWeek - base.getDay() + 7) % 7;
    const targetDate = addDays(base, diff);

    // Skip past dates
    if (targetDate < today) continue;

    // Check if slots already exist for this schedule on this date
    const existing = await db.timeSlot.count({
      where: { scheduleId, date: targetDate },
    });
    if (existing > 0) continue;

    // Build slots for this day
    const startMins = parseMinutes(startTime);
    const endMins = parseMinutes(endTime);
    let cursor = startMins;

    while (cursor + slotDurationMinutes <= endMins) {
      slotsToCreate.push({
        scheduleId,
        doctorId,
        date: targetDate,
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(cursor + slotDurationMinutes),
      });
      cursor += slotDurationMinutes;
    }
  }

  if (slotsToCreate.length > 0) {
    await db.timeSlot.createMany({ data: slotsToCreate });
  }
}

// ── Public Actions ────────────────────────────────────────────────────────────

/** Get the authenticated doctor's own schedule blocks */
export async function getMySchedule() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return { success: false as const, error: "Unauthorized" };
  }

  const profile = await db.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { success: false as const, error: "Profile not found" };

  const schedules = await db.doctorSchedule.findMany({
    where: { doctorId: profile.id, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return { success: true as const, data: schedules };
}

/** Create a new weekly schedule block and pre-generate 4 weeks of slots */
export async function createScheduleBlock(raw: unknown) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = scheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { dayOfWeek, startTime, endTime, slotDurationMinutes } = parsed.data;

  // Validate start < end
  if (parseMinutes(startTime) >= parseMinutes(endTime)) {
    return { success: false as const, error: "Start time must be before end time" };
  }

  const profile = await db.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { success: false as const, error: "Profile not found" };

  // Check for duplicate day+time overlap
  const existing = await db.doctorSchedule.findFirst({
    where: { doctorId: profile.id, dayOfWeek, isActive: true },
  });
  if (existing) {
    return {
      success: false as const,
      error: "A schedule block for this day already exists. Delete it first.",
    };
  }

  const schedule = await db.doctorSchedule.create({
    data: {
      doctorId: profile.id,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
    },
  });

  // Auto-generate 4 weeks of time slots
  await generateSlotsForSchedule(
    schedule.id,
    profile.id,
    dayOfWeek,
    startTime,
    endTime,
    slotDurationMinutes
  );

  return { success: true as const, data: schedule };
}

/** Soft-delete a schedule block (marks inactive, does not delete future slots) */
export async function deleteScheduleBlock(scheduleId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return { success: false as const, error: "Unauthorized" };
  }

  const profile = await db.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { success: false as const, error: "Profile not found" };

  // Verify ownership
  const schedule = await db.doctorSchedule.findFirst({
    where: { id: scheduleId, doctorId: profile.id },
  });
  if (!schedule) return { success: false as const, error: "Schedule not found" };

  await db.$transaction([
    db.doctorSchedule.update({
      where: { id: scheduleId },
      data: { isActive: false },
    }),
    // Cancel all future AVAILABLE slots from this schedule
    db.timeSlot.updateMany({
      where: {
        scheduleId,
        status: "AVAILABLE",
        date: { gte: startOfDay(new Date()) },
      },
      data: { status: "CANCELLED" },
    }),
  ]);

  return { success: true as const };
}

/** Get available time slots for a given doctor (next 4 weeks) */
export async function getDoctorAvailableSlots(doctorId: string) {
  const today = startOfDay(new Date());
  const fourWeeksOut = addDays(today, 28);

  const slots = await db.timeSlot.findMany({
    where: {
      doctorId,
      status: "AVAILABLE",
      date: { gte: today, lte: fourWeeksOut },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return { success: true as const, data: slots.filter((slot) => isScheduleSlotInFuture(slot.date, slot.startTime)) };
}
