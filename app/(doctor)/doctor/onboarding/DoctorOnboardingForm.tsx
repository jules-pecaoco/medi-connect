"use client";

import DoctorProfileForm from "@/components/doctor/DoctorProfileForm";

interface DoctorOnboardingFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DoctorOnboardingForm({ user }: DoctorOnboardingFormProps) {
  return <DoctorProfileForm mode="create" userName={user.name} />;
}
