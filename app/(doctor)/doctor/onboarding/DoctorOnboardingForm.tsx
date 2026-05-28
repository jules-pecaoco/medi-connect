"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertDoctorProfile } from "@/actions/auth";
import { Activity, ShieldAlert, CheckCircle, Loader2, ArrowRight, Stethoscope } from "lucide-react";

interface DoctorOnboardingFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DoctorOnboardingForm({ user }: DoctorOnboardingFormProps) {
  const router = useRouter();

  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/doctor/dashboard");
      }, 1500);
    }
  };

  const specializationsList = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Psychiatry",
    "Orthopedics",
    "Gphthalmology",
  ];

  return (
    <div className="glass-card rounded-2xl p-8 md:p-10 border border-slate-200/60 dark:border-slate-800/80 shadow-xl shadow-teal-600/5">
      {/* Header banner */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Physician Onboarding</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name || "Doctor"}</span>. Configure your consulting profile to begin seeing patients.
          </p>
        </div>
      </div>

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
        {/* Core details */}
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
              {specializationsList.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
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

        {/* Bio */}
        <div>
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
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-600/10 hover:shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Publishing Profile...
            </>
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
