import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";
import DoctorSessionClient from "./DoctorSessionClient";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorSessionPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    redirect("/login?role=DOCTOR");
  }

  const { id } = await params;

  // Retrieve appointment with complete patient profile details for physician summary review
  const appt = await db.appointment.findUnique({
    where: { id },
    include: {
      timeSlot: true,
      patient: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      doctor: { select: { userId: true } },
    },
  });

  if (!appt) {
    notFound();
  }

  // Authorize: Only the assigned physician can access this consultation workspace
  if (appt.doctor.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
          <div className="p-4 bg-red-500/10 text-red-600 rounded-2xl inline-block mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You are not designated as the consulting physician for this telehealth appointment. Access is logged and restricted.
          </p>
          <div className="mt-6">
            <Link
              href="/doctor/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-compile patient age
  const dob = new Date(appt.patient.dateOfBirth);
  const diffMs = Date.now() - dob.getTime();
  const age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));

  // Normalize appointment object for clean client serialization
  const serializedAppt = {
    id: appt.id,
    videoRoomUrl: appt.videoRoomUrl,
    status: appt.status,
    reason: appt.reason || "General Medical consultation",
    symptoms: appt.symptoms || "None declared",
    notes: appt.notes || "",
    prescription: appt.prescription || "",
    timeSlot: {
      date: appt.timeSlot.date.toISOString(),
      startTime: appt.timeSlot.startTime,
      endTime: appt.timeSlot.endTime,
    },
    patient: {
      name: appt.patient.user.name || "Anonymous Patient",
      email: appt.patient.user.email || "No email",
      age,
      gender: appt.patient.gender,
      bloodType: appt.patient.bloodType || "Not stated",
      phoneNumber: appt.patient.phoneNumber,
      medicalHistory: appt.patient.medicalHistory || "None declared",
      emergencyContactName: appt.patient.emergencyContactName,
      emergencyContactPhone: appt.patient.emergencyContactPhone,
    },
  };

  return <DoctorSessionClient appointment={serializedAppt} />;
}
