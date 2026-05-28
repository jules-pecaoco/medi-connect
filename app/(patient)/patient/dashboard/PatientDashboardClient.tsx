"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { 
  Activity, 
  LogOut, 
  User, 
  Calendar, 
  Brain, 
  History, 
  FileText, 
  ShieldAlert, 
  HeartHandshake,
  Clock,
  ExternalLink
} from "lucide-react";

interface PatientDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  profile: {
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    bloodType: string | null;
    emergencyContactName: string;
    emergencyContactPhone: string;
    medicalHistory: string | null;
  };
}

export default function PatientDashboardClient({ user, profile }: PatientDashboardClientProps) {
  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-600/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Patient Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login?role=PATIENT" })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-500/20 dark:hover:border-red-500/20 rounded-xl transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Health Profile & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Patient Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <User className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base">Health Profile</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formattedDOB}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400">Gender</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.gender}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400">Blood Type</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">{profile.bloodType || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md bg-teal-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base text-teal-700 dark:text-teal-300">Emergency Contact</h2>
            </div>
            
            <div className="text-sm space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.emergencyContactName}</p>
              <p className="text-slate-500 dark:text-slate-400">{profile.emergencyContactPhone}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 text-xs px-2.5 py-1 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                Verified Emergency Contact
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Features */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions / Services Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Claude AI Triage Matching */}
            <div className="group p-6 rounded-2xl border border-teal-500/10 bg-white dark:bg-slate-900/50 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition duration-300">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  Phase 3 MVP
                </span>
              </div>
              <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                AI Symptom Triage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Describe your current symptoms in plain text and get an instant specialist referral using Gemini AI.
              </p>
              <Link
                href="/patient/symptoms"
                className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-bold transition cursor-pointer"
              >
                Analyze Symptoms <Brain className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Doctor Scheduling */}
            <div className="group p-6 rounded-2xl border border-teal-500/10 bg-white dark:bg-slate-900/50 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition duration-300">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Phase 2 MVP
                </span>
              </div>
              <h3 className="font-bold text-base mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                Find & Schedule Doctor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Search specialists by department, read ratings and consulting bio details, and book consultation sessions.
              </p>
              <Link
                href="/patient/doctors"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold transition cursor-pointer"
              >
                Find Doctors <Calendar className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

          {/* Appointments & consultation History */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base">Your Consultations</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">0 active appointments</span>
            </div>

            {/* Empty state banner */}
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-6">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
                <History className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm">No Appointments Booked</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                You do not have any pending appointments or past consultations recorded. Use the scheduling tools to book your first video call.
              </p>
            </div>
          </div>

          {/* Medical Records History placeholder */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base">Medical Records</h2>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Consultation Notes & Prescriptions</p>
                <p className="mt-1">
                  Once consultations are completed (Phase 5/6), your prescriptions, clinical notes, and summary history will automatically compile and lock here for your retrieval.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
