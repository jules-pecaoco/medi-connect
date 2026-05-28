import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getPatientAppointments } from "@/actions/appointments";
import PatientDashboardClient from "./PatientDashboardClient";

export default async function PatientDashboard() {
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

  const apptsRes = await getPatientAppointments();
  const appointments = apptsRes.success ? apptsRes.data : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />

      <div className="z-10 relative">
        <PatientDashboardClient user={session.user} profile={profile} appointments={appointments as any} />
      </div>
    </div>
  );
}
