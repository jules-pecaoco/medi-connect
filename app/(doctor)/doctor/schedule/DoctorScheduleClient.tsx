"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  CalendarDays,
  CalendarCheck2
} from "lucide-react";
import { createScheduleBlock, deleteScheduleBlock } from "@/actions/schedule";

interface ScheduleBlock {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

interface DoctorScheduleClientProps {
  initialSchedules: ScheduleBlock[];
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function DoctorScheduleClient({ initialSchedules }: DoctorScheduleClientProps) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleBlock[]>(initialSchedules);
  const [isPending, startTransition] = useTransition();
  
  // Form State
  const [dayOfWeek, setDayOfWeek] = useState<string>("1"); // Monday by default
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [slotDuration, setSlotDuration] = useState<string>("30");

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      dayOfWeek: parseInt(dayOfWeek, 10),
      startTime,
      endTime,
      slotDurationMinutes: parseInt(slotDuration, 10),
    };

    startTransition(async () => {
      const res = await createScheduleBlock(payload);

      if (res.success) {
        setSuccess("Schedule block created successfully! 4 weeks of slots have been seeded.");
        
        // Add new block to the UI state
        setSchedules((prev) => {
          const updated = [...prev, res.data];
          // Sort by dayOfWeek, then startTime
          return updated.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTime.localeCompare(b.startTime);
          });
        });

        // Reset form to defaults
        setDayOfWeek("1");
        setStartTime("09:00");
        setEndTime("17:00");
        setSlotDuration("30");
      } else {
        setError(res.error || "Failed to create schedule block.");
      }
    });
  };

  const handleDeleteBlock = (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule block? This will soft-delete future available slots generated from it.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deleteScheduleBlock(id);

      if (res.success) {
        setSuccess("Schedule block deleted successfully. Future available slots were cancelled.");
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(res.error || "Failed to delete schedule block.");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/85 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/dashboard"
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-600/20">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Schedule & Availability Management</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Set up recurring hours and auto-generate patient slots.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form & List Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Block Column */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/40">
              <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h2 className="font-bold text-base">Add Weekly Availability</h2>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow"
                  disabled={isPending}
                >
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow"
                    required
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow"
                  disabled={isPending}
                >
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Configuring & Seeding..." : "Generate Time Slots"}
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <CalendarCheck2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h2 className="font-bold text-base">Active Consulting Blocks</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {schedules.length} blocks configured
              </span>
            </div>

            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-6">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
                  <Clock className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm">No Availability Configured</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Configure your weekly schedule block in the left panel. Creating a block automatically pre-generates appointment slots for the next 4 weeks.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {schedules.map((block) => (
                  <div 
                    key={block.id}
                    className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 shadow-sm relative group hover:border-teal-500/20 dark:hover:border-teal-500/20 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                          {DAYS_OF_WEEK[block.dayOfWeek]}
                        </span>
                        <div className="flex items-center gap-1.5 mt-3 text-slate-700 dark:text-slate-300">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-base font-bold">
                            {block.startTime} &ndash; {block.endTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Slot Interval: <span className="font-semibold text-slate-500 dark:text-slate-300">{block.slotDurationMinutes} mins</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        disabled={isPending}
                        className="p-2 border border-slate-100 dark:border-slate-800 hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
                        title="Delete schedule block"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
