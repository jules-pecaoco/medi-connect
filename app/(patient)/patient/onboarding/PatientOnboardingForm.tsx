"use client";

import PatientProfileForm from "@/components/patient/PatientProfileForm";

interface PatientOnboardingFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function PatientOnboardingForm({ user }: PatientOnboardingFormProps) {
  return <PatientProfileForm mode="create" userName={user.name} />;
}
