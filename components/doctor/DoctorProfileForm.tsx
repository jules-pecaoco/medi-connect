"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upsertDoctorProfile } from "@/actions/auth";
import { useToast } from "@/components/ui/toast";
import type { DoctorProfileInput } from "@/validators/auth";
import { ShieldAlert, CheckCircle, Loader2, ArrowRight, Stethoscope, ArrowLeft } from "lucide-react";

const SPECIALIZATIONS_LIST = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
  "Orthopedics",
  "Ophthalmology",
];

interface DoctorProfileFormProps {
  mode: "create" | "edit";
  userName?: string | null;
  initialData?: DoctorProfileInput;
}

export default function DoctorProfileForm({ mode, userName, initialData }: DoctorProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [specialization, setSpecialization] = useState(initialData?.specialization ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initialData?.licenseNumber ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    initialData?.yearsOfExperience !== undefined ? String(initialData.yearsOfExperience) : ""
  );
  const [consultationFee, setConsultationFee] = useState(
    initialData?.consultationFee !== undefined ? String(initialData.consultationFee) : ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEdit = mode === "edit";
  const steps = ["Specialty", "License", "Practice", "Bio"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const expNum = parseInt(yearsOfExperience, 10);
    const feeNum = parseFloat(consultationFee);

    if (isNaN(expNum) || expNum < 0) {
      setError("Please enter a valid number of years of experience");
      setIsLoading(false);
      return;
    }

    if (isNaN(feeNum) || feeNum < 0) {
      setError("Please enter a valid consultation fee");
      setIsLoading(false);
      return;
    }

    const res = await upsertDoctorProfile({
      specialization,
      licenseNumber,
      bio,
      yearsOfExperience: expNum,
      consultationFee: feeNum,
    });

    if (!res.success) {
      setError(res.error || "Could not save profile");
      setIsLoading(false);
      return;
    }

    if (isEdit) {
      toast({
        title: "Profile Updated",
        description: "Your physician profile has been saved successfully.",
        type: "success",
      });
      router.push("/doctor/dashboard?tab=profile");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/doctor/dashboard");
    }, 1500);
  };

  return (
    <div className="clinical-card p-8 md:p-10">
      {isEdit && (
        <Link
          href="/doctor/dashboard?tab=profile"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      )}

      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight text-teal-950">
            {isEdit ? "Edit Physician Profile" : "Physician Onboarding"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit ? (
              "Update your specialization, credentials, and practice details."
            ) : (
              <>
                Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{userName || "Doctor"}</span>. Configure your consulting profile to begin seeing patients.
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
          <span>Profile created successfully! Loading your workspace...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-teal-700">Credential Basics</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="specialization" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Medical Specialization
              </label>
              <select
                id="specialization"
                required
                disabled={isLoading || success}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              >
                <option value="" disabled>Select Specialization</option>
                {SPECIALIZATIONS_LIST.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
                {specialization && !SPECIALIZATIONS_LIST.includes(specialization) && (
                  <option value={specialization}>{specialization}</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="license" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Professional License Number
              </label>
              <input
                id="license"
                type="text"
                required
                disabled={isLoading || success}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. MD-987654-XYZ"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-teal-700">Practice Details</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="experience" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                required
                disabled={isLoading || success}
                min="0"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
              />
            </div>
            <div>
              <label htmlFor="fee" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Consultation Fee (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  $
                </span>
                <input
                  id="fee"
                  type="number"
                  required
                  disabled={isLoading || success}
                  min="0"
                  step="0.01"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="75.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sage-200 bg-warm-50 p-5">
          <label htmlFor="bio" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Professional Biography
          </label>
          <textarea
            id="bio"
            required
            disabled={isLoading || success}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce yourself to patients. Detail your clinical interests, educational background, certifications, and approach to digital healthcare..."
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
