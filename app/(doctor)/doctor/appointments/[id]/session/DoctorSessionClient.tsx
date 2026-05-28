"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { completeAppointment } from "@/actions/appointments";
import { combineScheduleDateAndTime } from "@/lib/date-utils";
import { 
  ChevronLeft, 
  Clock, 
  AlertCircle, 
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
  HeartHandshake,
  Activity,
  ClipboardList,
  X
} from "lucide-react";

interface DoctorSessionClientProps {
  appointment: {
    id: string;
    videoRoomUrl: string | null;
    status: string;
    reason: string;
    symptoms: string;
    notes: string;
    prescription: string;
    timeSlot: {
      date: string;
      startTime: string;
      endTime: string;
    };
    patient: {
      name: string;
      email: string;
      age: number;
      gender: string;
      bloodType: string;
      phoneNumber: string;
      medicalHistory: string;
      emergencyContactName: string;
      emergencyContactPhone: string;
      pastAppointments?: {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        doctorName: string;
        reason: string;
        notes: string;
        prescription: string;
      }[];
    };
  };
}

interface PastAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorName: string;
  reason: string;
  notes: string;
  prescription: string;
}

export default function DoctorSessionClient({ appointment }: DoctorSessionClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [now, setNow] = useState<Date | null>(null);
  
  // Editor States
  const [notes, setNotes] = useState(appointment.notes);
  const [prescription, setPrescription] = useState(appointment.prescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "chart">("notes");
  const [selectedPastAppt, setSelectedPastAppt] = useState<PastAppointment | null>(null);

  // Sync clock client-side
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

  const earlyJoinBoundary = new Date(slotStart.getTime() - 10 * 60 * 1000);
  const joinCloseBoundary = new Date(slotEnd.getTime() + 60 * 60 * 1000);

  const handleComplete = async () => {
    if (!notes.trim()) {
      toast({
        title: "Clinical Notes Required",
        description: "Please enter consultation details before completing the appointment.",
        type: "error",
      });
      return;
    }

    if (!confirm("Are you sure you want to finalize this consultation? This will record prescriptions and patient charts permanently.")) return;

    setIsSubmitting(true);
    const result = await completeAppointment(appointment.id, notes, prescription);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Consultation Completed",
        description: "Notes and prescriptions have been permanently recorded and patient has been notified.",
        type: "success",
      });
      router.push("/doctor/dashboard");
      router.refresh();
    } else {
      toast({
        title: "Failed to Save Chart",
        description: result.error || "An error occurred while finalizing.",
        type: "error",
      });
    }
  };

  if (!now) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 gap-2">
        <div className="h-5 w-5 animate-spin border-2 border-teal-600 border-t-transparent rounded-full" />
        Syncing clinician consultation deck...
      </div>
    );
  }

  const isEarly = now < earlyJoinBoundary;
  const isLate = now > joinCloseBoundary;
  const isWithinWindow = now >= earlyJoinBoundary && now <= joinCloseBoundary;

  const diffMs = earlyJoinBoundary.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60)) / (1000 * 60));
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
            href="/doctor/dashboard"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Physician Consultation Desk
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Active Patient: <span className="font-semibold text-teal-600 dark:text-teal-400">{appointment.patient.name}</span> &bull; Age: {appointment.patient.age} &bull; Gender: {appointment.patient.gender}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-teal-500/10 bg-teal-500/5 text-teal-600 dark:text-teal-400">
          <Clock className="h-3.5 w-3.5" />
          {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden">
        {isEarly && (
          /* Pre-session wait room */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl w-full rounded-3xl p-8 text-center shadow-xl relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />
              
              <div className="p-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full inline-block mb-4">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight">Consultation Wait Room</h2>
              <p className="text-xs text-slate-450 mt-1 max-w-md mx-auto leading-relaxed">
                Consultation room registered successfully. The telehealth video channel becomes active exactly <strong>10 minutes before</strong> your scheduled time slot.
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

              {/* Details Summary Card */}
              <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded-2xl text-left text-xs max-w-md mx-auto space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">{dateFormatted}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Compass className="h-4 w-4 shrink-0" />
                  <span>Join Window opens at <span className="font-semibold text-slate-700 dark:text-slate-350">{earlyJoinBoundary.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span></span>
                </div>
              </div>

              <Link
                href="/doctor/dashboard"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {isLate && (
          /* Post-session expiration window */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-8 text-center shadow-xl animate-scale-in">
              <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full inline-block mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h2 className="text-lg font-extrabold tracking-tight">Room Link Expired</h2>
              <p className="text-xs text-slate-450 mt-2 leading-relaxed">
                This physician video room has expired and closed. Consultations are automatically finalized 1 hour after the slot officially finishes to ensure schedule compliance.
              </p>

              <div className="mt-8">
                <Link
                  href="/doctor/dashboard"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-teal-650 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                >
                  Return to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {isWithinWindow && (
          /* Live side-by-side workspace */
          <div className="flex-1 flex flex-col md:flex-row h-full min-h-0">
            {/* Left Screen: Video stream Iframe (65% width) */}
            <div className="flex-1 md:flex-[1.8] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-950 p-4 relative min-h-[350px]">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col bg-slate-900">
                {appointment.videoRoomUrl ? (
                  <iframe
                    src={appointment.videoRoomUrl}
                    allow="camera; microphone; fullscreen; speaker; display-capture"
                    className="w-full flex-1 border-0"
                    title="Clinician Video Consultation Channel"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2 animate-bounce" />
                    <h4 className="font-extrabold text-sm text-white">Iframe Stream Registration Failed</h4>
                    <p className="text-xs max-w-sm mt-1">
                      No Daily.co video URL was found registered to this slot. Try refreshing or contact clinical operations.
                    </p>
                  </div>
                )}
                
                {/* Embedded status strip */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                    HIPAA Secure Iframe stream
                  </div>
                  <div>
                    Active Session &bull; Assigned: {appointment.patient.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Screen: Clinical notepad & notes tab (35% width) */}
            <div className="w-full md:w-96 lg:w-[450px] shrink-0 bg-white dark:bg-slate-900 flex flex-col h-full min-h-0 border-l border-slate-200 dark:border-slate-800">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-850 p-2 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-white dark:bg-slate-800 shadow-sm text-teal-600 dark:text-teal-400 border border-slate-200/50 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Clinical Notes
                </button>
                <button
                  onClick={() => setActiveTab("chart")}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "chart"
                      ? "bg-white dark:bg-slate-800 shadow-sm text-teal-600 dark:text-teal-400 border border-slate-200/50 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                  }`}
                >
                  <User className="h-3.5 w-3.5" /> Patient Chart
                </button>
              </div>

              {/* Scrollable Tab Content Frame */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
                
                {activeTab === "notes" ? (
                  /* Clinical Note Editors */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 mb-1.5 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" /> Triage Reason & Symptoms
                      </label>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs space-y-1.5">
                        <p><span className="font-semibold text-slate-400">Declared Reason:</span> {appointment.reason}</p>
                        <p><span className="font-semibold text-slate-400">AI triage symptoms:</span> <span className="italic text-slate-600 dark:text-slate-300">{appointment.symptoms}</span></p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                        Consultation Notes <span className="text-[10px] text-red-500 lowercase font-medium">(required to finalize)</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type medical diagnosis, key patient complaints, assessment observations, and follow-up plans..."
                        className="w-full h-36 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/20 rounded-xl text-xs outline-none transition resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-450">
                        Prescription (Optional)
                      </label>
                      <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="E.g. Amoxicillin 500mg - 3 times daily for 7 days&#10;Paracetamol 500mg - every 6 hours as needed for pain..."
                        className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/20 rounded-xl text-xs outline-none transition resize-none font-mono leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  /* Patient Clinical Chart Data Card */
                  <div className="space-y-5">
                    {/* Patient info badge grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="block text-[9px] uppercase text-slate-450 font-bold">Blood Group</span>
                        <span className="font-extrabold text-teal-650 dark:text-teal-400 mt-0.5 block">{appointment.patient.bloodType}</span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="block text-[9px] uppercase text-slate-455 font-bold">Phone Contact</span>
                        <span className="font-extrabold text-slate-750 dark:text-slate-350 mt-0.5 block">{appointment.patient.phoneNumber}</span>
                      </div>
                    </div>

                    {/* Patient Medical History Card */}
                    <div className="space-y-1.5">
                      <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-455">Onboarding Medical History</span>
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {appointment.patient.medicalHistory}
                      </div>
                    </div>

                    {/* Past Consultation Timeline inside Session Chart */}
                    <div className="space-y-2">
                      <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-455">Previous Consultations ({appointment.patient.pastAppointments?.length || 0})</span>
                      {(!appointment.patient.pastAppointments || appointment.patient.pastAppointments.length === 0) ? (
                        <div className="p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] text-slate-400">
                          No previous completed consults on file.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {appointment.patient.pastAppointments.map((appt) => {
                            const dateStr = new Date(appt.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC"
                            });
                            return (
                              <div 
                                key={appt.id}
                                onClick={() => setSelectedPastAppt(appt)}
                                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 hover:border-teal-500/20 hover:bg-white dark:hover:bg-slate-900 cursor-pointer transition text-[11px]"
                              >
                                <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                                  <span>Dr. {appt.doctorName}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{dateStr}</span>
                                </div>
                                <p className="text-[10px] text-slate-450 truncate mt-0.5">Complaint: {appt.reason}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Patient Emergency Contacts */}
                    <div className="p-4 bg-teal-500/[0.03] border border-teal-500/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-350 font-bold text-xs">
                        <HeartHandshake className="h-4 w-4" /> Emergency Contact
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{appointment.patient.emergencyContactName}</p>
                      <p className="text-[11px] text-slate-400">{appointment.patient.emergencyContactPhone}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Sticky bottom Action deck */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSubmitting || !notes.trim()}
                  className="w-full py-3.5 bg-teal-650 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" /> Finalizing Consultation Chart...
                    </>
                  ) : (
                    <>
                      Complete & Log Consultation
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Historical Record Detail Modal */}
      {selectedPastAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Historical Consultation Details
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Dr. {selectedPastAppt.doctorName} &bull; {new Date(selectedPastAppt.date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setSelectedPastAppt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Chief Complaint / Reason</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  {selectedPastAppt.reason}
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Clinical Notes & Diagnosis</span>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl leading-relaxed whitespace-pre-wrap text-slate-650 dark:text-slate-300">
                  {selectedPastAppt.notes}
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prescribed Rx</span>
                {selectedPastAppt.prescription ? (
                  <div className="p-3.5 bg-teal-500/[0.02] border border-dashed border-teal-500/20 rounded-xl font-mono leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {selectedPastAppt.prescription}
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-center text-[10px]">
                    No prescription logged for this encounter.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex shrink-0">
              <button
                onClick={() => setSelectedPastAppt(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
