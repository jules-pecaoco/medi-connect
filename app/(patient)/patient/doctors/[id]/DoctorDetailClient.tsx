"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Star, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  CalendarCheck,
  CheckCircle,
  FileText
} from "lucide-react";

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
}

interface Doctor {
  id: string;
  specialization: string;
  licenseNumber: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  rating: number;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface DoctorDetailClientProps {
  doctor: Doctor;
  slots: TimeSlot[];
}

export default function DoctorDetailClient({ doctor, slots }: DoctorDetailClientProps) {
  // Group slots by date string
  const slotsByDate: { [dateStr: string]: TimeSlot[] } = {};
  
  slots.forEach((slot) => {
    // Database dates are midnight UTC, let's normalize to standard format
    const d = new Date(slot.date);
    const dateStr = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });
    if (!slotsByDate[dateStr]) {
      slotsByDate[dateStr] = [];
    }
    slotsByDate[dateStr].push(slot);
  });

  const dates = Object.keys(slotsByDate);

  // Selection states
  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || "");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingFeedback, setBookingFeedback] = useState<boolean>(false);

  const selectedSlots = selectedDate ? slotsByDate[selectedDate] : [];
  const selectedSlotDetails = slots.find((s) => s.id === selectedSlotId);

  const handleBookSlotPreview = () => {
    if (!selectedSlotId) return;
    setBookingFeedback(true);
    setTimeout(() => {
      setBookingFeedback(false);
      setSelectedSlotId(null);
    }, 4500);
  };

  const initials = doctor.user.name
    ? doctor.user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Navigation */}
      <header className="mb-8">
        <Link
          href="/patient/doctors"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 border border-slate-200 dark:border-slate-800 hover:border-teal-500/20 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Doctor Profile details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md text-center">
            
            {/* Doctor Large Initials Avatar */}
            <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-teal-500/10 mb-4">
              {initials}
            </div>

            <h1 className="text-xl font-extrabold tracking-tight">Dr. {doctor.user.name}</h1>
            <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-2 uppercase tracking-wider">
              {doctor.specialization} Specialist
            </span>

            {/* Core credentials */}
            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-100 dark:border-slate-800/40 my-6 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-0.5">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {doctor.rating.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Experience</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                  {doctor.yearsOfExperience} Yrs
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Consult Fee</p>
                <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                  ${doctor.consultationFee.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Trust points */}
            <div className="space-y-3.5 text-left text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <Award className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Verified Board Certified Physician</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                <span>License Number: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{doctor.licenseNumber}</span></span>
              </div>
            </div>

          </div>

          {/* Biography Box */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/40">
              <FileText className="h-4 w-4 text-teal-600" />
              <h2 className="font-bold text-sm">Professional Biography</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {doctor.bio}
            </p>
          </div>
        </div>

        {/* Right: Availability Slot Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-md">
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 text-teal-600" />
                <h2 className="font-bold text-base">Availability & Consultation Hours</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Seeded next 4 weeks
              </span>
            </div>

            {dates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-6">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm">No Open Sessions</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Dr. {doctor.user.name} does not have any availability slots configured at the moment. Please check back later.
                </p>
              </div>
            ) : (
              <div>
                {/* Date Tabs Selection Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/40 scrollbar-thin">
                  {dates.map((date) => {
                    const isSelected = date === selectedDate;
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlotId(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/10"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-teal-500/20"
                        }`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>

                {/* Slots Grid for selected date */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Available Slots for {selectedDate}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-500"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-teal-500/20"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {slot.startTime} &ndash; {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reservation action preview box */}
                {selectedSlotId && selectedSlotDetails && (
                  <div className="mt-8 p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Selected Consultation Slot
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedDate} &bull; <span className="font-bold text-teal-600 dark:text-teal-400">{selectedSlotDetails.startTime} - {selectedSlotDetails.endTime}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleBookSlotPreview}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/10 transition cursor-pointer"
                    >
                      Book Appointment Slot
                    </button>
                  </div>
                )}

                {/* Simulation/Visual Success box for Phase 2 */}
                {bookingFeedback && (
                  <div className="mt-6 p-4 rounded-xl border border-emerald-500/10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3 animate-fade-in">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Consultation Slot Locked Visually!</p>
                      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                        Appointment booking, calendar locks, and Pusher real-time notifications are scheduled to be fully integrated in **Phase 4**. Your visual choice functions perfectly!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
