"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { combineScheduleDateAndTime } from "@/lib/date-utils";
import { 
  ChevronLeft, 
  Clock, 
  AlertCircle, 
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface PatientSessionClientProps {
  appointment: {
    id: string;
    doctorName: string;
    specialization: string;
    videoRoomUrl: string | null;
    status: string;
    timeSlot: {
      date: string;
      startTime: string;
      endTime: string;
    };
  };
}

export default function PatientSessionClient({ appointment }: PatientSessionClientProps) {
  const [now, setNow] = useState<Date | null>(null);

  // Initialize clock client-side to prevent hydration mismatches
  useEffect(() => {
    const syncClock = () => setNow(new Date());
    const timeout = window.setTimeout(syncClock, 0);
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const slotStart = combineScheduleDateAndTime(
    appointment.timeSlot.date,
    appointment.timeSlot.startTime
  );
  const slotEnd = combineScheduleDateAndTime(
    appointment.timeSlot.date,
    appointment.timeSlot.endTime
  );

  // The 10 minutes early join window start
  const earlyJoinBoundary = new Date(slotStart.getTime() - 10 * 60 * 1000);
  // Session stays joinable up to 1 hour after the slot officially ends
  const joinCloseBoundary = new Date(slotEnd.getTime() + 60 * 60 * 1000);

  if (!now) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 gap-2">
        <div className="h-5 w-5 animate-spin border-2 border-teal-600 border-t-transparent rounded-full" />
        Syncing consultation room timeline...
      </div>
    );
  }

  const isEarly = now < earlyJoinBoundary;
  const isLate = now > joinCloseBoundary;
  const isWithinWindow = now >= earlyJoinBoundary && now <= joinCloseBoundary;

  // Calculate countdown difference
  const diffMs = earlyJoinBoundary.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const dateFormatted = new Date(appointment.timeSlot.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header Panel */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/patient/dashboard"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Telehealth Consultation
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Assigned Physician: <span className="font-semibold text-slate-600 dark:text-slate-350">Dr. {appointment.doctorName}</span> ({appointment.specialization})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-teal-500/10 bg-teal-500/5 text-teal-600 dark:text-teal-400">
          <Clock className="h-3.5 w-3.5" />
          {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-0 relative overflow-hidden">
        
        {isEarly && (
          /* Pre-session wait room */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl w-full rounded-3xl p-8 text-center shadow-xl relative overflow-hidden animate-scale-in">
            {/* Visual background gradient overlay */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />
            
            <div className="p-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full inline-block mb-4">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>

            <h2 className="text-xl font-extrabold tracking-tight">Clinical Wait Room</h2>
            <p className="text-xs text-slate-450 mt-1 max-w-md mx-auto leading-relaxed">
              Your video room is generated. To ensure clinicians maintain active schedules, you are allowed to enter the room exactly <strong>10 minutes before</strong> your slot.
            </p>

            {/* Immersive Countdown Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto my-8">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="block text-2xl font-extrabold text-teal-600 dark:text-teal-450">{diffDays}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Days</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="block text-2xl font-extrabold text-teal-600 dark:text-teal-450">{diffHrs}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hours</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="block text-2xl font-extrabold text-teal-600 dark:text-teal-450">{diffMins}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mins</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="block text-2xl font-extrabold text-teal-600 dark:text-teal-450">{diffSecs}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Secs</span>
              </div>
            </div>

            {/* Appointment Detail Summary Cards */}
            <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded-2xl text-left text-xs max-w-md mx-auto space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{dateFormatted}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Compass className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Join Window opens at <span className="font-semibold text-slate-700 dark:text-slate-350">{earlyJoinBoundary.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span></span>
              </div>
            </div>

            <Link
              href="/patient/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        )}

        {isLate && (
          /* Post-session expiration window */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-8 text-center shadow-xl animate-scale-in">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full inline-block mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>

            <h2 className="text-lg font-extrabold tracking-tight">Session Link Expired</h2>
            <p className="text-xs text-slate-450 mt-2 leading-relaxed">
              This consultation room has expired and closed. Video sessions automatically shut down 1 hour after the slot finishes to maintain platform compliance.
            </p>

            <div className="mt-8">
              <Link
                href="/patient/dashboard"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-teal-650 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
              >
                Return to Workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {isWithinWindow && (
          /* Live embedded video Consultation room */
          <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-fade-in relative min-h-[500px]">
            {appointment.videoRoomUrl ? (
              <iframe
                src={appointment.videoRoomUrl}
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="w-full flex-1 border-0"
                title="MediConnect Consultation Stream"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Daily.co URL Missing</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  The telehealth endpoint could not be registered correctly for this appointment slot. Contact clinical support.
                </p>
              </div>
            )}

            {/* Bottom info banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 px-6 flex items-center justify-between text-[11px] text-slate-450">
              <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
                <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0" />
                Secure HIPAA Encrypted Telehealth call
              </div>
              <div>
                Slot End time: <span className="font-semibold">{appointment.timeSlot.endTime}</span>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}
