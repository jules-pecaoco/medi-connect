import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import PatientProfileForm from "@/components/patient/PatientProfileForm";

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function PatientProfileEditPage() {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] py-12 px-4 md:px-8 relative overflow-hidden">
      <div className="glow-bg top-[-100px] left-[-100px] opacity-20" />
      <div className="max-w-2xl mx-auto z-10 relative">
        <PatientProfileForm
          mode="edit"
          initialData={{
            dateOfBirth: formatDateForInput(profile.dateOfBirth),
            gender: profile.gender,
            phoneNumber: profile.phoneNumber,
            bloodType: profile.bloodType,
            emergencyContactName: profile.emergencyContactName,
            emergencyContactPhone: profile.emergencyContactPhone,
            medicalHistory: profile.medicalHistory,
          }}
        />
      </div>
    </div>
  );
}
