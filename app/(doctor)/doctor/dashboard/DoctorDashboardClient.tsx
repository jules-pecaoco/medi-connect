"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment } from "@/actions/appointments";
import { 
  Activity, 
  LogOut, 
  Stethoscope, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  Award,
  Video,
  FileCheck,
  Trash2,
  AlertCircle
} from "lucide-react";

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patient: {
    user: {
      name: string | null;
      email: string | null;
    };
  };
  timeSlot: TimeSlot;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  reason: string | null;
  symptoms: string | null;
  videoRoomUrl?: string | null;
}

interface DoctorDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  profile: {
    specialization: string;
    licenseNumber: string;
    bio: string;
    yearsOfExperience: number;
    consultationFee: number;
    rating: number;
    availabilityStatus: boolean;
  };
  appointments?: Appointment[];
}

export default function DoctorDashboardClient({ 
  user, 
  profile, 
  appointments = [] 
}: DoctorDashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this consultation? This will notify the patient and release the slot.")) return;

    setCancellingId(id);
    const result = await cancelAppointment(id);
    setCancellingId(null);

    if (result.success) {
      toast({
        title: "Consultation Cancelled",
        description: "The patient has been notified and the slot is open.",
        type: "success",
      });
      router.refresh();
    } else {
      toast({
        title: "Cancellation Failed",
        description: result.error || "An error occurred.",
        type: "error",
      });
    }
  };

  const activeAppointments = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING");
  const pastAppointments = appointments.filter(a => a.status === "COMPLETED" || a.status === "CANCELLED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-600/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Physician Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome back, <span className="font-semibold text-teal-600 dark:text-teal-400">{user.name}</span> &bull; <span className="text-slate-400 font-normal">{profile.specialization} Specialist</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login?role=DOCTOR" })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-500/20 dark:hover:border-red-500/20 rounded-xl transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Cards */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-md flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Experience</p>
            <p className="text-xl font-bold mt-0.5">{profile.yearsOfExperience} Years</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-md flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consulting Rate</p>
            <p className="text-xl font-bold mt-0.5">${profile.consultationFee.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-md flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Star className="h-5 w-5 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Physician Rating</p>
            <p className="text-xl font-bold mt-0.5">{profile.rating.toFixed(1)} / 5.0</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 shadow-md flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Availability Status</p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </p>
          </div>
        </div>
      </div>

      {/* Primary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Doctor Biography & Credentials */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/40">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base">Physician Biography</h2>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {profile.bio}
            </p>
            
            <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-slate-400">
              <p>License ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{profile.licenseNumber}</span></p>
            </div>
          </div>
        </div>

        {/* Right Column: Appointment Schedule list & Consulting Tools */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scheduling slots controller */}
          <div className="p-6 rounded-2xl border border-teal-500/10 bg-white dark:bg-slate-900/50 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                Phase 2 Scheduling
              </span>
            </div>
            <h3 className="font-bold text-base mb-1">Schedule & Slot Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Configure your weekly consulting days, establish time slots, and define breaks for automatic booking coordination.
            </p>
            <Link
              href="/doctor/schedule"
              className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-bold transition cursor-pointer"
            >
              Manage Slots <Clock className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Upcoming Consultations Queue */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base">Upcoming Consultation Queue</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {activeAppointments.length} patient{activeAppointments.length !== 1 && "s"} queued
              </span>
            </div>

            {activeAppointments.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-6">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
                  <Video className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm">No Pending Sessions</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  You do not have any patient consultations booked for today. Bookings will automatically populate here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAppointments.map((appt) => {
                  const dateStr = new Date(appt.timeSlot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <div 
                      key={appt.id} 
                      className="p-4 rounded-xl border border-slate-105 bg-white dark:bg-slate-900/40 hover:border-teal-500/20 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {appt.patient.user.name || "Anonymous Patient"}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-2 py-0.5 bg-teal-550/10 rounded">
                            CONFIRMED
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {appt.timeSlot.startTime} - {appt.timeSlot.endTime}
                          </span>
                        </div>
                        {appt.reason && (
                          <p className="text-xs text-slate-650 dark:text-slate-300 mt-1">
                            Reason: <span className="font-semibold">{appt.reason}</span>
                          </p>
                        )}
                        {appt.symptoms && (
                          <p className="text-xs text-slate-400">
                            Symptoms: <span className="italic">{appt.symptoms}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {appt.videoRoomUrl && appt.status === "CONFIRMED" && (
                          <Link
                            href={`/doctor/appointments/${appt.id}/session`}
                            className="inline-flex items-center justify-center gap-1.5 p-2 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm shadow-teal-600/10"
                          >
                            <Video className="h-3.5 w-3.5" /> Join Room
                          </Link>
                        )}
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancellingId === appt.id}
                          className="inline-flex items-center justify-center gap-1.5 p-2 px-3 border border-slate-200 dark:border-slate-800 hover:border-red-500/20 text-xs font-semibold rounded-lg hover:text-red-500 hover:bg-red-500/[0.02] transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Cancel Consultation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past & Cancelled Consultation Log */}
          {pastAppointments.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Past & Cancelled Log</h3>
              <div className="space-y-3">
                {pastAppointments.map((appt) => {
                  const dateStr = new Date(appt.timeSlot.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <div key={appt.id} className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40">
                      <div>
                        <p className="font-semibold">{appt.patient.user.name}</p>
                        <p className="text-slate-450 text-[10px]">{dateStr} &bull; {appt.timeSlot.startTime}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Prescriptions helper card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <FileCheck className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base">Consultation Notes & Prescriptions</h2>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
              <Activity className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Clinical Consultation Summaries</p>
                <p className="mt-1">
                  Once consultations are launched (Phase 5/6), you will have complete real-time notepad interfaces here to issue official prescriptions, diagnose symptoms, and lock medical reports securely to patient files.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
