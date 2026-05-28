"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { Activity, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "DOCTOR" ? "DOCTOR" : "PATIENT";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await registerUser({ name, email, password, role });

    if (!res.success) {
      setError(res.error || "Registration failed");
      setIsLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/login?role=${role}&registered=true`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080d16] px-4 py-12 relative overflow-hidden">
      {/* Glow effect */}
      <div className="glow-bg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20 mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Create Account
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Join MediConnect telehealth platform
          </p>
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
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector switches */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("PATIENT")}
                className={`py-3 rounded-xl border text-sm font-semibold transition duration-200 cursor-pointer ${
                  role === "PATIENT"
                    ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                }`}
              >
                I am a Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("DOCTOR")}
                className={`py-3 rounded-xl border text-sm font-semibold transition duration-200 cursor-pointer ${
                  role === "DOCTOR"
                    ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                }`}
              >
                I am a Doctor
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={isLoading || success}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Doe or Jane Smith"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isLoading || success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={isLoading || success}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-sm input-glow transition placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-600/10 hover:shadow-teal-700/20 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href={`/login?role=${role}`}
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
