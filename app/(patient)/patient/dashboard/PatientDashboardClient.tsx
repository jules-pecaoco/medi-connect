"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment, rescheduleAppointment } from "@/actions/appointments";
import { getDoctorAvailableSlots } from "@/actions/schedule";
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
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  Video,
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
  doctorId: string;
  doctor: {
    specialization: string;
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

interface PatientDashboardClientProps {
  user: {
    id?: string | null;
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
  appointments?: Appointment[];
}

export default function PatientDashboardClient({ 
  user, 
  profile, 
  appointments = [] 
}: PatientDashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // Reschedule states
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState<string | null>(null);
  const [isReschedulingSubmit, setIsReschedulingSubmit] = useState(false);

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(id);
    const result = await cancelAppointment(id);
    setCancellingId(null);

    if (result.success) {
      toast({
        title: "Appointment Cancelled",
        description: "Your consultation has been cancelled, and the slot is now open.",
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

  const handleOpenReschedule = async (appt: Appointment) => {
    setReschedulingAppt(appt);
    setLoadingSlots(true);
    setSelectedNewSlotId(null);
    setAvailableSlots([]);

    const result = await getDoctorAvailableSlots(appt.doctorId);
    setLoadingSlots(false);

    if (result.success && result.data) {
      setAvailableSlots(result.data as TimeSlot[]);
    } else {
      toast({
        title: "Unable to load schedule",
        description: "Failed to load doctor's available slots.",
        type: "error",
      });
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingAppt || !selectedNewSlotId) return;

    setIsReschedulingSubmit(true);
    const result = await rescheduleAppointment(reschedulingAppt.id, selectedNewSlotId);
    setIsReschedulingSubmit(false);

    if (result.success) {
      toast({
        title: "Appointment Rescheduled",
        description: `Successfully moved consultation with Dr. ${reschedulingAppt.doctor.user.name}.`,
        type: "success",
      });
      setReschedulingAppt(null);
      router.refresh();
    } else {
      toast({
        title: "Reschedule Failed",
        description: result.error || "Failed to reschedule consultation.",
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
            
            {/* AI Triage Matching */}
            <div className="group p-6 rounded-2xl border border-teal-500/10 bg-white dark:bg-slate-900/50 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition duration-300">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  AI Assisted
                </span>
              </div>
              <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                AI Symptom Triage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Describe your symptoms in plain text and discover matching clinical specializations instantly with AI.
              </p>
              <Link
                href="/patient/symptoms"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-teal-600/15"
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
                  Booking
                </span>
              </div>
              <h3 className="font-bold text-base mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                Find & Schedule Doctor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Search specialists by department, read ratings and bios, and book consultation sessions.
              </p>
              <Link
                href="/patient/doctors"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-emerald-600/15"
              >
                Find Doctors <Calendar className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

          {/* Appointments & Consultation Queue */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <History className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base">Your Consultations</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {activeAppointments.length} active appointment{activeAppointments.length !== 1 && "s"}
              </span>
            </div>

            {activeAppointments.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-6">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
                  <History className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm">No Appointments Booked</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  You do not have any active appointments. Use the directory to schedule your first telehealth video call.
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
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/40 hover:border-teal-500/20 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            Dr. {appt.doctor.user.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-550/10 text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                            {appt.doctor.specialization}
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
                          <p className="text-xs text-slate-400 mt-1">
                            Reason: <span className="text-slate-600 dark:text-slate-300">{appt.reason}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {appt.videoRoomUrl && appt.status === "CONFIRMED" && (
                          <Link
                            href={`/patient/appointments/${appt.id}/session`}
                            className="inline-flex items-center justify-center gap-1.5 p-2 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm shadow-teal-600/10"
                          >
                            <Video className="h-3.5 w-3.5" /> Join Session
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenReschedule(appt)}
                          className="inline-flex items-center justify-center gap-1.5 p-2 px-3 border border-slate-200 dark:border-slate-800 hover:border-teal-500/30 dark:hover:border-teal-550/30 text-xs font-semibold rounded-lg hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancellingId === appt.id}
                          className="inline-flex items-center justify-center gap-1.5 p-2 px-3 border border-slate-200 dark:border-slate-800 hover:border-red-500/20 text-xs font-semibold rounded-lg hover:text-red-500 hover:bg-red-500/[0.02] transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Consultations */}
          {pastAppointments.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Past & Cancelled Consultations</h3>
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
                        <p className="font-semibold">Dr. {appt.doctor.user.name}</p>
                        <p className="text-slate-450 text-[10px]">{dateStr} &bull; {appt.timeSlot.startTime}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {appt.status === "COMPLETED" && (
                          <Link 
                            href="/patient/records"
                            className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold transition mr-1 cursor-pointer"
                          >
                            View Notes
                          </Link>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          appt.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Medical Records History Section */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-base">Medical Records</h2>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3 mb-4">
              <ShieldAlert className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Consultation Notes & Prescriptions</p>
                <p className="mt-1">
                  Your prescription slips, clinical diagnostic notes, and visit summaries are saved securely to your file.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 rounded-xl mb-4 text-xs">
              <span className="text-slate-450 font-medium">Completed Consultations</span>
              <span className="font-extrabold text-teal-650 dark:text-teal-400">
                {appointments.filter(a => a.status === "COMPLETED").length}
              </span>
            </div>

            <Link
              href="/patient/records"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-650/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="h-4 w-4" /> View Medical History
            </Link>
          </div>

        </div>

      </div>

      {/* Reschedule Calendar Dialog Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setReschedulingAppt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                  Reschedule Consultation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a new available time slot with Dr. {reschedulingAppt.doctor.user.name}
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto mb-6 pr-1 scrollbar-thin">
              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-10 text-xs text-slate-400 gap-2">
                  <Activity className="h-5 w-5 animate-spin text-teal-600" />
                  Loading doctor availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-350">No Available Slots Found</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Dr. {reschedulingAppt.doctor.user.name} has no open slots configured in the next 4 weeks.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = slot.id === selectedNewSlotId;
                    const dateFormatted = new Date(slot.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    });
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedNewSlotId(slot.id)}
                        className={`p-3 rounded-xl border text-[11px] font-bold transition text-left flex flex-col justify-between h-20 hover:border-teal-500/30 cursor-pointer ${
                          isSelected
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-slate-400 text-[9px]">{dateFormatted}</span>
                        <span className="mt-1 flex items-center gap-1 font-extrabold">
                          <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReschedulingAppt(null)}
                className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                disabled={isReschedulingSubmit}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={!selectedNewSlotId || isReschedulingSubmit}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReschedulingSubmit ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    Updating Slot...
                  </>
                ) : (
                  <>
                    Confirm Reschedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
