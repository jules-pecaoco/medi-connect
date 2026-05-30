"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { triggerNotification } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createDailyRoom } from "@/lib/daily";
import { combineScheduleDateAndTime, isScheduleSlotInFuture } from "@/lib/date-utils";

const createBookingSchema = z.object({
  slotId: z.string().min(1, "Time slot is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(300, "Reason must be under 300 characters"),
  symptoms: z.string().optional().nullable(),
});

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** Create an appointment with atomic slot locking and Pusher real-time trigger */
export async function createAppointment(raw: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return { success: false as const, error: "Unauthorized. Patients only." };
    }

    const parsed = createBookingSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0].message };
    }

    const { slotId, reason, symptoms } = parsed.data;

    // Get the patient profile
    const patient = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true } } },
    });
    if (!patient) {
      return { success: false as const, error: "Patient profile not found. Complete onboarding first." };
    }

    // Perform atomic slot lock and appointment creation in Prisma Transaction
    const appointment = await db.$transaction(async (tx) => {
      // 1. Fetch slot with locking check
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
        include: { doctor: { include: { user: { select: { name: true, id: true } } } } },
      });

      if (!slot) {
        throw new Error("The selected time slot does not exist.");
      }

      if (slot.status !== "AVAILABLE") {
        throw new Error("This time slot has already been booked by another patient.");
      }

      if (!isScheduleSlotInFuture(slot.date, slot.startTime)) {
        throw new Error("This time slot has already passed. Please choose a future appointment time.");
      }

      // 2. Mark slot as BOOKED
      await tx.timeSlot.update({
        where: { id: slotId },
        data: { status: "BOOKED" },
      });

      // 3. Create the appointment
      const appt = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: slot.doctorId,
          timeSlotId: slotId,
          status: "CONFIRMED",
          reason,
          symptoms,
        },
        include: {
          doctor: { include: { user: { select: { id: true, name: true } } } },
          patient: { include: { user: { select: { id: true, name: true } } } },
          timeSlot: true,
        },
      });

      return appt;
    });

    // 4. Create Daily.co room and update appointment (outside prisma transaction to prevent block locks)
    let videoRoomUrl: string | null = null;
    try {
      const slotEnd = combineScheduleDateAndTime(appointment.timeSlot.date, appointment.timeSlot.endTime);
      const expTimestamp = Math.floor((slotEnd.getTime() + 2 * 60 * 60 * 1000) / 1000); // 2 hours buffer
      
      videoRoomUrl = await createDailyRoom(appointment.id, expTimestamp);
      if (videoRoomUrl) {
        await db.appointment.update({
          where: { id: appointment.id },
          data: { videoRoomUrl },
        });
        appointment.videoRoomUrl = videoRoomUrl;
      }
    } catch (e) {
      console.error("Daily.co room creation failed during booking:", e);
    }

    const patientName = patient.user.name || "A patient";
    const doctorName = appointment.doctor.user.name || "A doctor";
    const doctorUserId = appointment.doctor.user.id;
    const dateFormatted = new Date(appointment.timeSlot.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    const timeFormatted = `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`;

    // Trigger Pusher notifications asynchronously
    await Promise.all([
      triggerNotification(`doctor-${doctorUserId}`, "appointment.booked", {
        title: "New Appointment Booked",
        message: `${patientName} has booked a consultation on ${dateFormatted} at ${timeFormatted}.`,
      }),
      triggerNotification(`patient-${session.user.id}`, "appointment.booked", {
        title: "Consultation Confirmed",
        message: `Your appointment with Dr. ${doctorName} on ${dateFormatted} at ${timeFormatted} is confirmed.`,
      }),
    ]);

    revalidatePath("/patient/dashboard");
    revalidatePath(`/patient/doctors/${appointment.doctorId}`);

    return { success: true as const, data: appointment };
  } catch (error: unknown) {
    console.error("createAppointment error:", error);
    return { success: false as const, error: getErrorMessage(error, "Failed to book appointment") };
  }
}

/** Cancel an appointment, release slot to AVAILABLE, and trigger Pusher alerts */
export async function cancelAppointment(appointmentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }

    const appt = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        timeSlot: true,
        doctor: { include: { user: { select: { id: true, name: true } } } },
        patient: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!appt) {
      return { success: false as const, error: "Appointment not found" };
    }

    // Verify ownership
    const isPatientOwner = appt.patient.userId === session.user.id;
    const isDoctorOwner = appt.doctor.userId === session.user.id;

    if (!isPatientOwner && !isDoctorOwner) {
      return { success: false as const, error: "Forbidden" };
    }

    // Atomic release transaction
    await db.$transaction([
      db.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" },
      }),
      db.timeSlot.update({
        where: { id: appt.timeSlotId },
        data: { status: "AVAILABLE" }, // release slot
      }),
    ]);

    const cancellerName = isPatientOwner
      ? appt.patient.user.name || "The patient"
      : `Dr. ${appt.doctor.user.name || "The doctor"}`;

    const dateFormatted = new Date(appt.timeSlot.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    // Notify doctor & patient
    await Promise.all([
      triggerNotification(`doctor-${appt.doctor.userId}`, "appointment.cancelled", {
        title: "Appointment Cancelled",
        message: `${cancellerName} cancelled the session scheduled for ${dateFormatted} at ${appt.timeSlot.startTime}.`,
      }),
      triggerNotification(`patient-${appt.patient.userId}`, "appointment.cancelled", {
        title: "Appointment Cancelled",
        message: `Your consultation with Dr. ${appt.doctor.user.name} on ${dateFormatted} at ${appt.timeSlot.startTime} was cancelled.`,
      }),
    ]);

    revalidatePath("/patient/dashboard");
    revalidatePath("/doctor/dashboard");

    return { success: true as const };
  } catch (error: unknown) {
    console.error("cancelAppointment error:", error);
    return { success: false as const, error: getErrorMessage(error, "Failed to cancel appointment") };
  }
}

/** Reschedule appointment to a new slot under a single atomic transaction */
export async function rescheduleAppointment(appointmentId: string, newSlotId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return { success: false as const, error: "Unauthorized. Patients only." };
    }

    const appt = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        timeSlot: true,
        patient: { include: { user: { select: { id: true, name: true } } } },
        doctor: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!appt) {
      return { success: false as const, error: "Appointment not found" };
    }

    if (appt.patient.userId !== session.user.id) {
      return { success: false as const, error: "Forbidden" };
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Fetch new slot
      const newSlot = await tx.timeSlot.findUnique({
        where: { id: newSlotId },
      });

      if (!newSlot) {
        throw new Error("New slot not found.");
      }

      if (newSlot.doctorId !== appt.doctorId) {
        throw new Error("Cannot reschedule to a different doctor's slot.");
      }

      if (newSlot.status !== "AVAILABLE") {
        throw new Error("The selected slot is already booked.");
      }

      if (!isScheduleSlotInFuture(newSlot.date, newSlot.startTime)) {
        throw new Error("This time slot has already passed. Please choose a future appointment time.");
      }

      // 2. Set old slot to AVAILABLE
      await tx.timeSlot.update({
        where: { id: appt.timeSlotId },
        data: { status: "AVAILABLE" },
      });

      // 3. Set new slot to BOOKED
      await tx.timeSlot.update({
        where: { id: newSlotId },
        data: { status: "BOOKED" },
      });

      // 4. Update appointment with new slot id
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { timeSlotId: newSlotId },
        include: { timeSlot: true },
      });

      return updated;
    });

    const patientName = appt.patient.user.name || "A patient";
    const dateFormatted = new Date(result.timeSlot.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    // Notify doctor & patient
    await Promise.all([
      triggerNotification(`doctor-${appt.doctor.userId}`, "appointment.updated", {
        title: "Appointment Rescheduled",
        message: `${patientName} rescheduled their consultation to ${dateFormatted} at ${result.timeSlot.startTime}.`,
      }),
      triggerNotification(`patient-${appt.patient.userId}`, "appointment.updated", {
        title: "Rescheduled Confirmed",
        message: `Your consultation with Dr. ${appt.doctor.user.name} has been moved to ${dateFormatted} at ${result.timeSlot.startTime}.`,
      }),
    ]);

    revalidatePath("/patient/dashboard");

    return { success: true as const, data: result };
  } catch (error: unknown) {
    console.error("rescheduleAppointment error:", error);
    return { success: false as const, error: getErrorMessage(error, "Failed to reschedule") };
  }
}

/** Get patient's appointments */
export async function getPatientAppointments() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return { success: false as const, error: "Unauthorized" };
    }

    const patient = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!patient) return { success: true as const, data: [] };

    const appointments = await db.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        timeSlot: true,
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [
        { timeSlot: { date: "asc" } },
        { timeSlot: { startTime: "asc" } },
      ],
    });

    return { success: true as const, data: appointments };
  } catch (error) {
    console.error("getPatientAppointments error:", error);
    return { success: false as const, error: "Failed to fetch appointments" };
  }
}

/** Get doctor's appointments */
export async function getDoctorAppointments() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return { success: false as const, error: "Unauthorized" };
    }

    const doctor = await db.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor) return { success: true as const, data: [] };

    const appointments = await db.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        timeSlot: true,
        patient: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [
        { timeSlot: { date: "asc" } },
        { timeSlot: { startTime: "asc" } },
      ],
    });

    return { success: true as const, data: appointments };
  } catch (error) {
    console.error("getDoctorAppointments error:", error);
    return { success: false as const, error: "Failed to fetch appointments" };
  }
}

/** Complete an appointment, record notes & prescriptions, and notify the patient */
export async function completeAppointment(appointmentId: string, notes: string, prescription: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return { success: false as const, error: "Unauthorized. Doctors only." };
    }

    const appt = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { select: { userId: true, user: { select: { name: true } } } },
        patient: { select: { userId: true } },
      },
    });

    if (!appt) {
      return { success: false as const, error: "Appointment not found." };
    }

    if (appt.doctor.userId !== session.user.id) {
      return { success: false as const, error: "Forbidden. You are not the assigned doctor for this session." };
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        notes,
        prescription,
        status: "COMPLETED",
      },
    });

    // Notify the patient that their medical record has been updated
    await triggerNotification(`patient-${appt.patient.userId}`, "appointment.completed", {
      title: "Medical Record Available",
      message: `Dr. ${appt.doctor.user.name} has completed your session and logged notes & prescriptions.`,
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/records");
    revalidatePath("/doctor/dashboard");

    return { success: true as const, data: updated };
  } catch (error: unknown) {
    console.error("completeAppointment error:", error);
    return { success: false as const, error: getErrorMessage(error, "Failed to complete consultation.") };
  }
}
