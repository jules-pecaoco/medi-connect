import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import PatientRecordsClient from "./PatientRecordsClient";

export default async function PatientRecordsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?role=PATIENT");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/doctor/dashboard");
  }

  const profile = await db.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/patient/onboarding");
  }

  // Fetch completed appointments chronologically (most recent first)
  const completedAppointments = await db.appointment.findMany({
    where: {
      patientId: profile.id,
      status: "COMPLETED",
    },
    include: {
      timeSlot: true,
      doctor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      { timeSlot: { date: "desc" } },
      { timeSlot: { startTime: "desc" } },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />

      <div className="z-10 relative">
        <PatientRecordsClient 
          user={session.user} 
          profile={profile} 
          appointments={completedAppointments as any} 
        />
      </div>
    </div>
  );
}
