import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import DoctorProfileForm from "@/components/doctor/DoctorProfileForm";

export default async function DoctorProfileEditPage() {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] py-12 px-4 md:px-8 relative overflow-hidden">
      <div className="glow-bg top-[-100px] left-[-100px] opacity-20" />
      <div className="max-w-2xl mx-auto z-10 relative">
        <DoctorProfileForm
          mode="edit"
          initialData={{
            specialization: profile.specialization,
            licenseNumber: profile.licenseNumber,
            bio: profile.bio,
            yearsOfExperience: profile.yearsOfExperience,
            consultationFee: profile.consultationFee,
          }}
        />
      </div>
    </div>
  );
}
