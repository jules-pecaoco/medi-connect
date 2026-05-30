"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { Activity, CheckCircle, HeartPulse, Loader2, ShieldAlert } from "lucide-react";

function RegisterForm() {
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
      const signInResult = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        role,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md clinical-card p-8 md:p-10 animate-fade-in">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 rounded-2xl bg-teal-700 p-3 text-white shadow-clinical">
          <Activity className="h-6 w-6" />
        </div>
        <span className="font-display text-3xl text-teal-950">Create Account</span>
        <p className="mt-1.5 text-sm text-slate-500">Join the MediConnect telehealth platform</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>Registration successful! Opening your workspace...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Select Your Role</label>
          <div className="grid grid-cols-2 gap-3">
            {(["PATIENT", "DOCTOR"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-xl border py-3 text-sm font-semibold transition duration-200 ${
                  role === option ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500 hover:bg-warm-100"
                }`}
              >
                {option === "PATIENT" ? "I am a Patient" : "I am a Doctor"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name</label>
          <input id="name" type="text" required disabled={isLoading || success} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. John Doe or Jane Smith" className="input-glow w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition placeholder:text-slate-400" />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-500">Email Address</label>
          <input id="email" type="email" required disabled={isLoading || success} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-glow w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition placeholder:text-slate-400" />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-500">Password</label>
          <input id="password" type="password" required disabled={isLoading || success} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-glow w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition placeholder:text-slate-400" />
        </div>

        <button type="submit" disabled={isLoading || success} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-clinical transition hover:bg-teal-800 active:bg-teal-900 disabled:bg-slate-300">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href={`/login?role=${role}`} className="font-semibold text-teal-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <div className="grid min-h-screen bg-warm-100 lg:grid-cols-2">
      <section className="medical-illustration relative hidden flex-col justify-end overflow-hidden p-12 lg:flex">
        <div className="relative z-10 max-w-md">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-clinical">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h2 className="font-display text-5xl leading-tight text-teal-950">Start with care that knows your context.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">Create a patient or physician workspace built around appointments, records, and secure video visits.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="clinical-card flex w-full max-w-md flex-col items-center justify-center p-8 py-20 text-slate-400"><Loader2 className="mb-3 h-8 w-8 animate-spin text-teal-700" /><span>Loading registration...</span></div>}>
          <RegisterForm />
        </Suspense>
      </section>
    </div>
  );
}
