"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  Printer,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  Pill,
  ClipboardList,
  HeartHandshake,
  Download,
  Loader2,
} from "lucide-react";
import {
  buildPrescriptionSlipData,
  downloadPrescriptionPdf,
  openPrescriptionPrintWindow,
} from "@/lib/prescription-slip";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  updatedAt: Date | string;
  doctor: {
    specialization: string;
    licenseNumber: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  timeSlot: TimeSlot;
  status: string;
  reason: string | null;
  symptoms: string | null;
  notes: string | null;
  prescription: string | null;
}

interface PatientRecordsClientProps {
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
  appointments?: Appointment[];
}

export default function PatientRecordsClient({
  user,
  profile,
  appointments = [],
}: PatientRecordsClientProps) {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const getSlipData = (appt: Appointment) =>
    buildPrescriptionSlipData(
      {
        appointmentId: appt.id,
        updatedAt: appt.updatedAt,
        prescription: appt.prescription,
        timeSlotDate: appt.timeSlot.date,
        doctor: appt.doctor,
      },
      {
        name: user.name,
        dob: formattedDOB,
        gender: profile.gender,
      }
    );

  const handlePrintPrescription = (appt: Appointment) => {
    openPrescriptionPrintWindow(getSlipData(appt));
  };

  const handleDownloadPdf = async (appt: Appointment) => {
    setDownloadingId(appt.id);
    try {
      downloadPrescriptionPdf(getSlipData(appt));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Header Navigation */}
      <header className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <Link
          href="/patient/dashboard"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600 rounded-xl text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Clinical Medical Records</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access your prescription slips, consultation summaries, and medical history
            </p>
          </div>
        </div>
      </header>

      {/* Main Records Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/40">
              <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                <User className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-sm">General Health Summary</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400 font-medium">Blood Group</span>
                <span className="font-semibold text-teal-650 dark:text-teal-400">{profile.bloodType || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400 font-medium">Biological DOB</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formattedDOB}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400 font-medium">Gender</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.gender}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-400 font-medium">Phone Support</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.phoneNumber}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Clinical History Chart</span>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl text-[11px] leading-relaxed text-slate-650 dark:text-slate-350 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {profile.medicalHistory || "No previous history reported."}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md bg-teal-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-sm text-teal-700 dark:text-teal-350">Emergency Contact</h2>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.emergencyContactName}</p>
              <p className="text-slate-450">{profile.emergencyContactPhone}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline list of Completed Consultations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <h2 className="font-bold text-sm">Consultation Logs ({appointments.length})</h2>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-6">
                <Activity className="h-8 w-8 text-slate-350 mb-3 animate-pulse" />
                <h4 className="font-bold text-xs">No Completed Sessions</h4>
                <p className="text-[11px] text-slate-450 max-w-sm mt-1 leading-relaxed">
                  Your medical summary history compiles here automatically once doctors finalize consultations and issue clinical prescriptions.
                </p>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-sage-200">
                {appointments.map((appt, index) => {
                  const dateStr = new Date(appt.timeSlot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <div
                      key={appt.id}
                      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
                      className="relative ml-8 p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/40 transition-[transform,border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-[0_4px_16px_rgba(15,118,110,0.08)] flex flex-col gap-3 animate-slide-up"
                    >
                      <span className="absolute -left-10 top-5 h-4 w-4 rounded-full border-4 border-warm-50 bg-teal-700 shadow-sm" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              Dr. {appt.doctor.user.name}
                            </h4>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                              {appt.doctor.specialization}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {appt.timeSlot.startTime} - {appt.timeSlot.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="inline-flex items-center justify-center gap-1.5 p-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-600 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Details
                          </button>
                          {appt.prescription && (
                            <>
                              <button
                                onClick={() => handlePrintPrescription(appt)}
                                className="inline-flex items-center justify-center gap-1.5 p-2 px-3 border border-teal-500/20 hover:bg-teal-500/10 hover:text-teal-600 text-xs font-bold rounded-lg transition text-teal-500 cursor-pointer"
                              >
                                <Printer className="h-3.5 w-3.5" /> Print Rx
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(appt)}
                                disabled={downloadingId === appt.id}
                                className="inline-flex items-center justify-center gap-1.5 p-2 px-3 border border-teal-500/20 hover:bg-teal-500/10 hover:text-teal-600 text-xs font-bold rounded-lg transition text-teal-500 cursor-pointer disabled:opacity-50"
                              >
                                {downloadingId === appt.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                                Download PDF
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <p><span className="text-slate-400">Reason for visit:</span> <span className="font-semibold">{appt.reason}</span></p>
                        {appt.symptoms && (
                          <p><span className="text-slate-400">Reported Symptoms:</span> <span className="italic">{appt.symptoms}</span></p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-scale-in data-[state=open]:animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    Consultation Record Detail
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    Dr. {selectedAppt.doctor.user.name} &bull; {new Date(selectedAppt.timeSlot.date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 scrollbar-thin">
              {/* Encounter summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Chief Complaint</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-1">{selectedAppt.reason}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Patient Symptoms</span>
                  <span className="italic text-slate-700 dark:text-slate-350 block mt-1">{selectedAppt.symptoms || "None declared"}</span>
                </div>
              </div>

              {/* Consultation Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" /> Clinical Diagnosis & Notes
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs leading-relaxed whitespace-pre-wrap text-slate-650 dark:text-slate-300">
                  {selectedAppt.notes || "No clinical diagnostic notes logged for this session."}
                </div>
              </div>

              {/* Prescriptions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" /> Prescribed Rx Details
                  </h4>
                  {selectedAppt.prescription && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePrintPrescription(selectedAppt)}
                        className="text-xs font-bold text-teal-650 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(selectedAppt)}
                        disabled={downloadingId === selectedAppt.id}
                        className="text-xs font-bold text-teal-650 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {downloadingId === selectedAppt.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                {selectedAppt.prescription ? (
                  <div className="rx-container font-mono p-4 bg-teal-500/[0.02] border border-dashed border-teal-500/20 rounded-xl text-xs leading-relaxed whitespace-pre-wrap text-slate-750 dark:text-slate-300">
                    {selectedAppt.prescription}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 text-center">
                    No medications were prescribed during this consultation.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedAppt(null)}
                className="flex-1 py-3 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
