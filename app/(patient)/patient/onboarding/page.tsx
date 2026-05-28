import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import PatientOnboardingForm from "./PatientOnboardingForm";

export default async function PatientOnboarding() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?role=PATIENT");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/doctor/dashboard");
  }

  // Double check if profile already exists to prevent duplicate onboarding access
  const profile = await db.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) {
    redirect("/patient/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="glow-bg top-[-100px] left-[-100px] opacity-20" />
      
      <div className="max-w-2xl mx-auto z-10 relative">
        <PatientOnboardingForm user={session.user} />
      </div>
    </div>
  );
}
