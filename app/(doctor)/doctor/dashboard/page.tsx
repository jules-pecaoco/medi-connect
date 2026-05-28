import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import DoctorDashboardClient from "./DoctorDashboardClient";

export default async function DoctorDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?role=DOCTOR");
  }

  if (session.user.role !== "DOCTOR") {
    redirect("/patient/dashboard");
  }

  const profile = await db.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/doctor/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />

      <div className="z-10 relative">
        <DoctorDashboardClient user={session.user} profile={profile} />
      </div>
    </div>
  );
}
