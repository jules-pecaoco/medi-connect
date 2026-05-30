"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upsertPatientProfile } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";
import type { PatientProfileInput } from "@/validators/auth";
import { ShieldAlert, CheckCircle, Loader2, ArrowRight, ClipboardList, ArrowLeft } from "lucide-react";

interface PatientProfileFormProps {
  mode: "create" | "edit";
  userName?: string | null;
  initialData?: PatientProfileInput;
}

export default function PatientProfileForm({ mode, userName, initialData }: PatientProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth ?? "");
  const [gender, setGender] = useState(initialData?.gender ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber ?? "");
  const [bloodType, setBloodType] = useState(initialData?.bloodType ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialData?.emergencyContactPhone ?? "");
  const [medicalHistory, setMedicalHistory] = useState(initialData?.medicalHistory ?? "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEdit = mode === "edit";
  const steps = ["Identity", "Contact", "Safety", "History"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await upsertPatientProfile({
      dateOfBirth,
      gender,
      phoneNumber,
      bloodType: bloodType || undefined,
      emergencyContactName,
      emergencyContactPhone,
      medicalHistory: medicalHistory || undefined,
    });

    if (!res.success) {
      setError(res.error || "Could not save profile");
      setIsLoading(false);
      return;
    }

    if (isEdit) {
      toast({
        title: "Profile Updated",
        description: "Your health profile has been saved successfully.",
        type: "success",
      });
      router.push("/patient/dashboard?tab=profile");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/patient/dashboard");
    }, 1500);
  };

  return (
    <div className="clinical-card p-8 md:p-10">
      {isEdit && (
        <Link
          href="/patient/dashboard?tab=profile"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      )}

      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight text-teal-950">
            {isEdit ? "Edit Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit ? (
              "Update your health information and emergency contacts."
            ) : (
              <>
                Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{userName || "Patient"}</span>. Tell us a bit more to connect you with care.
              </>
            )}
          </p>
        </div>
      </div>

      {!isEdit && (
        <div className="mb-8">
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-sage-100">
            <div className="h-full w-full rounded-full bg-teal-700" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-teal-800">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white">{index + 1}</span>
                <span className="hidden sm:inline">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>Profile created successfully! Heading to your dashboard...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-teal-700">Identity</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="dob" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                required
                disabled={isLoading || success}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Gender
              </label>
              <select
                id="gender"
                required
                disabled={isLoading || success}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="PreferNotToSay">Prefer not to say</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-teal-700">Contact</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                disabled={isLoading || success}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
            <div>
              <label htmlFor="bloodType" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Blood Type (Optional)
              </label>
              <select
                id="bloodType"
                disabled={isLoading || success}
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              >
                <option value="">I don&apos;t know</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-2xl border border-teal-500/10 bg-teal-500/5 dark:bg-teal-950/10 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Emergency Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eName" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Contact Name
              </label>
              <input
                id="eName"
                type="text"
                required
                disabled={isLoading || success}
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Next of Kin or Partner"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
            <div>
              <label htmlFor="ePhone" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Contact Phone
              </label>
              <input
                id="ePhone"
                type="tel"
                required
                disabled={isLoading || success}
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <label htmlFor="history" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Previous Medical History / Allergies (Optional)
          </label>
          <textarea
            id="history"
            disabled={isLoading || success}
            rows={3}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="Please detail any long-term illnesses, surgeries, or known drug allergies (e.g. Penicillin sensitivity)..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition resize-none"
          />
        </section>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-600/10 hover:shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            <>
              Save and Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
