import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import PatientSessionClient from "./PatientSessionClient";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientSessionPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    redirect("/login?role=PATIENT");
  }

  const { id } = await params;

  // Retrieve the appointment with profile & User details
  const appt = await db.appointment.findUnique({
    where: { id },
    include: {
      timeSlot: true,
      doctor: {
        include: {
          user: { select: { name: true } },
        },
      },
      patient: { select: { userId: true } },
    },
  });

  if (!appt) {
    notFound();
  }

  // Authorize: Only the booked patient can access this room
  if (appt.patient.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
          <div className="p-4 bg-red-500/10 text-red-650 rounded-2xl inline-block mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Access Restricted</h2>
          <p className="text-xs text-slate-450 mt-2 leading-relaxed">
            You are not authorized to join this clinical consultation. Access is strictly limited to the booked patient and their assigned physician.
          </p>
          <div className="mt-6">
            <Link
              href="/patient/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normalize appointment object for serialization
  const serializedAppt = {
    id: appt.id,
    doctorName: appt.doctor.user.name || "A clinical specialist",
    specialization: appt.doctor.specialization,
    videoRoomUrl: appt.videoRoomUrl,
    status: appt.status,
    timeSlot: {
      date: appt.timeSlot.date.toISOString(),
      startTime: appt.timeSlot.startTime,
      endTime: appt.timeSlot.endTime,
    },
  };

  return <PatientSessionClient appointment={serializedAppt} />;
}
