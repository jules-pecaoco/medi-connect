import { auth } from "@/auth";
import Link from "next/link";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import { Shield, Activity, Users, Video, Brain, Calendar } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const { id, role } = session.user;
    if (role === "DOCTOR") {
      const profile = await db.doctorProfile.findUnique({
        where: { userId: id },
      });
      if (profile) {
        redirect("/doctor/dashboard");
      } else {
        redirect("/doctor/onboarding");
      }
    } else {
      const profile = await db.patientProfile.findUnique({
        where: { userId: id },
      });
      if (profile) {
        redirect("/patient/dashboard");
      } else {
        redirect("/patient/onboarding");
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 px-4 md:px-8">
      {/* Decorative Glow Blobs */}
      <div className="glow-bg top-[-100px] left-[-100px]" />
      <div className="glow-bg bottom-[-100px] right-[-100px]" style={{ animationDelay: "-4s" }} />

      {/* Header */}
      <header className="w-full max-w-7xl flex items-center justify-between py-6 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20">
            <Activity className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            MediConnect
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition shadow-md shadow-teal-600/10 hover:shadow-teal-700/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-5xl flex flex-col items-center text-center my-auto py-12 z-10 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Shield className="h-3.5 w-3.5" /> MediConnect WC Builder Round MVP
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Premium Telehealth,{" "}
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Powered by Gemini
          </span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
          Connect instantly with specialized medical practitioners, consult safely over HD video sessions, and manage your health records in a clean, state-of-the-art telehealth environment.
        </p>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
          {/* Patient Card */}
          <Link
            href="/register?role=PATIENT"
            className="group flex flex-col items-start p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300 text-left"
          >
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition duration-300">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mt-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
              I am a Patient
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Describe symptoms to Gemini discover certified specialists, and consult securely via live video.
            </p>
          </Link>

          {/* Doctor Card */}
          <Link
            href="/register?role=DOCTOR"
            className="group flex flex-col items-start p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300 text-left"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition duration-300">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              I am a Doctor
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Set your digital consulting schedules, meet patients remotely in real-time, and manage consultation prescriptions.
            </p>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl py-6 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex flex-col items-center">
            <span className="text-teal-600 font-bold text-lg flex items-center gap-1.5">
              <Brain className="h-5 w-5" /> AI Triage
            </span>
            <span className="text-xs text-slate-400 mt-1">Smart Specialization Matches</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-teal-600 font-bold text-lg flex items-center gap-1.5">
              <Video className="h-5 w-5" /> Daily Video
            </span>
            <span className="text-xs text-slate-400 mt-1">HD Consultation Rooms</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-teal-600 font-bold text-lg flex items-center gap-1.5">
              <Shield className="h-5 w-5" /> GDPR & HIPAA
            </span>
            <span className="text-xs text-slate-400 mt-1">Secure & Compliant DB</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-teal-600 font-bold text-lg flex items-center gap-1.5">
              <Activity className="h-5 w-5" /> Real-time
            </span>
            <span className="text-xs text-slate-400 mt-1">Pusher Notifications</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-800/40 z-10">
        &copy; {new Date().getFullYear()} MediConnect. All rights reserved. Built for WC Launchpad.
      </footer>
    </div>
  );
}
