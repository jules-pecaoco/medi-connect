"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment, rescheduleAppointment } from "@/actions/appointments";
import { getDoctorAvailableSlots } from "@/actions/schedule";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  Clock,
  FileText,
  HeartHandshake,
  History,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  Trash2,
  User,
  Video,
  X,
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

type PatientTab = "overview" | "consults" | "ai" | "doctors" | "records" | "profile";

const PATIENT_NAV: { id: PatientTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", short: "Home", icon: LayoutDashboard },
  { id: "consults", label: "Consultations", short: "Visits", icon: Calendar },
  { id: "ai", label: "Symptom AI", short: "AI", icon: Brain },
  { id: "doctors", label: "Find Doctors", short: "Doctors", icon: Stethoscope },
  { id: "records", label: "Medical Records", short: "Records", icon: FileText },
  { id: "profile", label: "My Profile", short: "Profile", icon: User },
];

const PAGE_SIZE = 5;

export default function PatientDashboardClient({
  user,
  profile,
  appointments = [],
}: PatientDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRefreshing, startRefreshTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<PatientTab>("overview");
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [pastPage, setPastPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [loadingSlotsApptId, setLoadingSlotsApptId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState<string | null>(null);
  const [isReschedulingSubmit, setIsReschedulingSubmit] = useState(false);

  const activeAppointments = useMemo(
    () => appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING"),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED"),
    [appointments]
  );
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const totalPastPages = Math.max(1, Math.ceil(pastAppointments.length / PAGE_SIZE));
  const paginatedPast = pastAppointments.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE);
  const currentTab = PATIENT_NAV.find((item) => item.id === activeTab) ?? PATIENT_NAV[0];
  const formattedDOB = new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && PATIENT_NAV.some((item) => item.id === tab)) {
      setActiveTab(tab as PatientTab);
    }
  }, [searchParams]);

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
      startRefreshTransition(() => router.refresh());
    } else {
      toast({
        title: "Cancellation Failed",
        description: result.error || "An error occurred.",
        type: "error",
      });
    }
  };

  const handleOpenReschedule = async (appt: Appointment) => {
    setLoadingSlotsApptId(appt.id);
    setReschedulingAppt(appt);
    setLoadingSlots(true);
    setSelectedNewSlotId(null);
    setAvailableSlots([]);

    const result = await getDoctorAvailableSlots(appt.doctorId);
    setLoadingSlots(false);
    setLoadingSlotsApptId(null);

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
      startRefreshTransition(() => router.refresh());
    } else {
      toast({
        title: "Reschedule Failed",
        description: result.error || "Failed to reschedule consultation.",
        type: "error",
      });
    }
  };

  const switchTab = (tab: PatientTab) => {
    setActiveTab(tab);
    setShowMoreTabs(false);
  };

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut({ callbackUrl: "/login?role=PATIENT" });
  };

  const formatDate = (date: Date | string, long = false) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: long ? "short" : undefined,
      month: "short",
      day: "numeric",
      year: long ? undefined : "numeric",
      timeZone: "UTC",
    });

  const appointmentCard = (appt: Appointment, index: number) => (
    <div
      key={appt.id}
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
      className="animate-slide-up rounded-xl border border-slate-100 bg-white p-4 transition-[transform,border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-[0_4px_16px_rgba(15,118,110,0.08)]"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">Dr. {appt.doctor.user.name}</h4>
            <span className="inline-flex items-center gap-1.5 rounded bg-teal-550/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-600">
              {appt.status === "CONFIRMED" && <span className="status-dot-confirmed h-1.5 w-1.5 rounded-full bg-teal-600" />}
              {appt.doctor.specialization}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(appt.timeSlot.date, true)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {appt.timeSlot.startTime} - {appt.timeSlot.endTime}
            </span>
          </div>
          {appt.reason && (
            <p className="text-xs text-slate-400">
              Reason: <span className="text-slate-600">{appt.reason}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {appt.videoRoomUrl && appt.status === "CONFIRMED" && (
            <Link
              href={`/patient/appointments/${appt.id}/session`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-600/10 transition hover:bg-teal-700"
            >
              <Video className="h-3.5 w-3.5" /> Join Session
            </Link>
          )}
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
            <>
              <button
                onClick={() => handleOpenReschedule(appt)}
                disabled={loadingSlotsApptId === appt.id}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-teal-500/30 hover:text-teal-600 disabled:opacity-50"
              >
                {loadingSlotsApptId === appt.id ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" /> Loading slots...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                  </>
                )}
              </button>
              <button
                onClick={() => handleCancel(appt.id)}
                disabled={cancellingId === appt.id}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-red-500/20 hover:bg-red-500/[0.02] hover:text-red-500 disabled:opacity-50"
              >
                {cancellingId === appt.id ? (
                  <>
                    <Activity className="h-3.5 w-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Cancel
                  </>
                )}
              </button>
            </>
          )}
          {appt.status === "COMPLETED" && (
            <Link href="/patient/records" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-teal-700">
              View Notes
            </Link>
          )}
          {(appt.status === "CANCELLED" || appt.status === "COMPLETED") && (
            <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", appt.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500")}>
              {appt.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const profileContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">My Profile</h2>
        <Link
          href="/patient/profile/edit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-600/10 transition hover:bg-teal-700"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit Profile
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-md">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold">Health Profile</h2>
          </div>
          <div className="space-y-4 text-sm">
            {[
              ["Date of Birth", formattedDOB],
              ["Gender", profile.gender],
              ["Phone Number", profile.phoneNumber],
              ["Blood Type", profile.bloodType || "Not specified"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-slate-400">{label}</span>
                <span className={cn("font-semibold text-slate-700", label === "Blood Type" && "text-teal-600")}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-200/60 bg-teal-500/5 p-6 shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-teal-700">Emergency Contact</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-slate-800">{profile.emergencyContactName}</p>
            <p className="text-slate-500">{profile.emergencyContactPhone}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
              Verified Emergency Contact
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold">Medical History & Allergies</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          {profile.medicalHistory?.trim() || "No medical history or allergies recorded."}
        </p>
      </div>
    </div>
  );

  const recordsContent = (
    <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
          <FileText className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold">Medical Records</h2>
      </div>
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-xs text-slate-500">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div>
          <p className="font-semibold text-slate-700">Consultation Notes & Prescriptions</p>
          <p className="mt-1">Your prescription slips, clinical diagnostic notes, and visit summaries are saved securely to your file.</p>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
        <span className="font-medium text-slate-450">Completed Consultations</span>
        <span className="font-extrabold text-teal-650">{completedCount}</span>
      </div>
      <Link href="/patient/records" className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-teal-650/15 transition hover:bg-teal-700">
        <FileText className="h-4 w-4" /> View Medical History
      </Link>
    </div>
  );

  const renderPastPagination = () =>
    totalPastPages > 1 && (
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-400">
          Showing {(pastPage - 1) * PAGE_SIZE + 1}-{Math.min(pastPage * PAGE_SIZE, pastAppointments.length)} of {pastAppointments.length}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setPastPage((p) => Math.max(1, p - 1))} disabled={pastPage === 1} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">
            Previous
          </button>
          <button onClick={() => setPastPage((p) => Math.min(totalPastPages, p + 1))} disabled={pastPage === totalPastPages} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    );

  const renderTabContent = () => {
    if (activeTab === "overview") {
      const upcoming = activeAppointments.slice(0, 3);
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Upcoming", activeAppointments.length],
              ["Completed", completedCount],
              ["Blood Type", profile.bloodType || "N/A"],
            ].map(([label, value]) => (
              <div key={label} className="glass-card rounded-2xl border border-slate-200/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Upcoming Consultations</h2>
              {activeAppointments.length > 3 && <button onClick={() => switchTab("consults")} className="text-xs font-bold text-teal-700">View all</button>}
            </div>
            {upcoming.length ? <div className="space-y-4">{upcoming.map(appointmentCard)}</div> : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <History className="mx-auto mb-3 h-7 w-7 text-slate-350" />
                <h4 className="text-sm font-semibold">No appointments booked</h4>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">Schedule your first telehealth video call with a verified clinician.</p>
                <button onClick={() => switchTab("doctors")} className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white">Find a doctor</button>
              </div>
            )}
          </section>
          <div className="grid gap-6 sm:grid-cols-2">
            <ActionCard icon={Brain} label="AI Assisted" title="Analyze symptoms" copy="Describe symptoms and discover matching clinical specialties instantly." href="/patient/symptoms" cta="Analyze Symptoms" />
            <ActionCard icon={Stethoscope} label="Booking" title="Find a doctor" copy="Search specialists by department, reviews, bio, and availability." href="/patient/doctors" cta="Find Doctors" />
          </div>
        </div>
      );
    }

    if (activeTab === "consults") {
      return (
        <div className="space-y-6 animate-fade-in">
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold">Active appointments</h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700">{activeAppointments.length}</span>
            </div>
            {activeAppointments.length ? <div className="space-y-4">{activeAppointments.map(appointmentCard)}</div> : <EmptyState title="No active appointments" copy="Booked and confirmed appointments will appear here." icon={Calendar} />}
          </section>
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Past & cancelled</h3>
            {pastAppointments.length ? <div className="space-y-3">{paginatedPast.map(appointmentCard)}</div> : <EmptyState title="No past consultations" copy="Completed and cancelled visits will be listed here." icon={History} />}
            {renderPastPagination()}
          </section>
        </div>
      );
    }

    if (activeTab === "ai") {
      return <ActionPanel icon={Brain} title="AI Symptom Triage" copy="Describe what you are feeling in plain language. MediConnect suggests matching specialties so you can find the right care path faster." href="/patient/symptoms" cta="Analyze Symptoms" />;
    }

    if (activeTab === "doctors") {
      return <ActionPanel icon={Stethoscope} title="Find & Schedule Doctor" copy="Browse verified physicians, compare specialties, and book available consultation slots without leaving your patient workspace." href="/patient/doctors" cta="Find Doctors" />;
    }

    if (activeTab === "records") return <div className="animate-fade-in">{recordsContent}</div>;
    return profileContent;
  };

  return (
    <div className="min-h-screen bg-warm-100 animate-fade-in">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-sage-200 bg-white/80 md:flex">
          <div className="flex items-center gap-3 border-b border-sage-200 px-6 py-5">
            <div className="rounded-2xl bg-teal-700 p-2.5 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl text-teal-950">MediConnect</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {PATIENT_NAV.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {index === 4 && <p className="px-4 pb-2 pt-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p>}
                  <button
                    onClick={() => switchTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-l-xl px-4 py-2.5 text-sm text-teal-700 transition-colors",
                      activeTab === item.id ? "border-r-2 border-teal-600 bg-teal-100/70 font-medium text-teal-800" : "hover:bg-teal-100/40"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
          <div className="border-t border-sage-200 p-4">
            <button onClick={handleSignOut} disabled={isSigningOut} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-500/20 hover:text-red-500 disabled:opacity-50">
              {isSigningOut ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" /> Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" /> Sign Out
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="relative flex-1 pb-24 md:pb-0">
          <header className="border-b border-sage-200 bg-warm-100/90 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl text-teal-950">{currentTab.label}</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back, <span className="font-semibold text-slate-700">{user.name}</span></p>
          </header>
          <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {renderTabContent()}
            {isRefreshing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-xl border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
                  <Activity className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileTabBar
        nav={PATIENT_NAV}
        activeTab={activeTab}
        showMoreTabs={showMoreTabs}
        setShowMoreTabs={setShowMoreTabs}
        switchTab={switchTab}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <button onClick={() => setReschedulingAppt(null)} className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Reschedule Consultation</h3>
                <p className="mt-0.5 text-xs text-slate-400">Select a new available time slot with Dr. {reschedulingAppt.doctor.user.name}</p>
              </div>
            </div>
            <div className="mb-6 max-h-60 overflow-y-auto pr-1">
              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-xs text-slate-400">
                  <Activity className="h-5 w-5 animate-spin text-teal-600" />
                  Loading doctor availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <EmptyState title="No Available Slots Found" copy={`Dr. ${reschedulingAppt.doctor.user.name} has no open slots configured in the next 4 weeks.`} icon={AlertCircle} />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = slot.id === selectedNewSlotId;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedNewSlotId(slot.id)}
                        className={cn("flex h-20 flex-col justify-between rounded-xl border p-3 text-left text-[11px] font-bold transition hover:border-teal-500/30", isSelected ? "border-teal-500 bg-teal-500/10 text-teal-600" : "border-slate-200 bg-white text-slate-700")}
                      >
                        <span className="text-[9px] text-slate-400">{formatDate(slot.date, true)}</span>
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
              <button type="button" onClick={() => setReschedulingAppt(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50" disabled={isReschedulingSubmit}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmReschedule} disabled={!selectedNewSlotId || isReschedulingSubmit} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isReschedulingSubmit ? <><Activity className="h-3.5 w-3.5 animate-spin" /> Updating Slot...</> : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, copy, icon: Icon }: { title: string; copy: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
      <Icon className="mx-auto mb-3 h-6 w-6 text-slate-350" />
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">{copy}</p>
    </div>
  );
}

function ActionCard({ icon: Icon, label, title, copy, href, cta }: { icon: React.ElementType; label: string; title: string; copy: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-teal-500/10 bg-white p-6 transition duration-300 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-teal-500/10 p-3 text-teal-600">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600">{label}</span>
      </div>
      <h3 className="mb-1.5 text-base font-bold text-slate-800">{title}</h3>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">{copy}</p>
      <Link href={href} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-600/15 transition hover:bg-teal-700">
        {cta} <Icon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function ActionPanel({ icon: Icon, title, copy, href, cta }: { icon: React.ElementType; title: string; copy: string; href: string; cta: string }) {
  return (
    <div className="glass-card max-w-2xl rounded-2xl border border-slate-200/60 p-8 animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-600">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl text-teal-950">{title}</h2>
      </div>
      <p className="mb-6 text-sm leading-7 text-slate-600">{copy}</p>
      <Link href={href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/15 transition hover:bg-teal-700">
        <Icon className="h-4 w-4" /> {cta}
      </Link>
    </div>
  );
}

function MobileTabBar({
  nav,
  activeTab,
  showMoreTabs,
  setShowMoreTabs,
  switchTab,
  onSignOut,
  isSigningOut,
}: {
  nav: typeof PATIENT_NAV;
  activeTab: PatientTab;
  showMoreTabs: boolean;
  setShowMoreTabs: React.Dispatch<React.SetStateAction<boolean>>;
  switchTab: (tab: PatientTab) => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const primary = nav.slice(0, 4);
  const more = nav.slice(4);

  const selectMoreTab = (tab: PatientTab) => {
    switchTab(tab);
    setShowMoreTabs(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sage-200 bg-white md:hidden">
      {showMoreTabs && (
        <div className="absolute bottom-full right-2 mb-2 w-52 rounded-2xl border border-sage-200 bg-white p-2 shadow-clinical">
          {more.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMoreTab(item.id)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-teal-700 hover:bg-teal-50"
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
          <div className="my-1 border-t border-sage-200" />
          <button
            type="button"
            onClick={() => {
              setShowMoreTabs(false);
              onSignOut();
            }}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            {isSigningOut ? (
              <>
                <Activity className="h-4 w-4 animate-spin" /> Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Sign Out
              </>
            )}
          </button>
        </div>
      )}
      <div className="grid grid-cols-5">
        {primary.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => switchTab(item.id)} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold text-slate-500 active:scale-110", activeTab === item.id && "text-teal-700")}>
              <Icon className="h-5 w-5" /> {item.short}
            </button>
          );
        })}
        <button onClick={() => setShowMoreTabs((value) => !value)} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold text-slate-500 active:scale-110", more.some((item) => item.id === activeTab) && "text-teal-700")}>
          <MoreHorizontal className="h-5 w-5" /> More
        </button>
      </div>
    </div>
  );
}
