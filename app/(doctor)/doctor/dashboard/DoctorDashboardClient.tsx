"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment } from "@/actions/appointments";
import { cn } from "@/lib/utils";
import { buildPrescriptionSlipData, openPrescriptionPrintWindow } from "@/lib/prescription-slip";
import {
  Activity,
  Award,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  FileCheck,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Pencil,
  Printer,
  Star,
  Stethoscope,
  Trash2,
  User,
  Users,
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
  patientId: string;
  updatedAt: Date | string;
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
  notes?: string | null;
  prescription?: string | null;
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

type DoctorTab = "overview" | "queue" | "schedule" | "notes" | "profile";

const DOCTOR_NAV: { id: DoctorTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", short: "Home", icon: LayoutDashboard },
  { id: "queue", label: "Patient Queue", short: "Queue", icon: Users },
  { id: "schedule", label: "Schedule", short: "Slots", icon: Calendar },
  { id: "notes", label: "Notes & Rx", short: "Notes", icon: ClipboardList },
  { id: "profile", label: "My Profile", short: "Profile", icon: User },
];

const PAGE_SIZE = 5;

export default function DoctorDashboardClient({
  user,
  profile,
  appointments = [],
}: DoctorDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<DoctorTab>("overview");
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [pastPage, setPastPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const activeAppointments = useMemo(
    () => appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING"),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED"),
    [appointments]
  );
  const completedConsultations = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "COMPLETED")
        .sort((a, b) => {
          const dateA = new Date(a.timeSlot.date).getTime();
          const dateB = new Date(b.timeSlot.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return b.timeSlot.startTime.localeCompare(a.timeSlot.startTime);
        }),
    [appointments]
  );
  const totalPastPages = Math.max(1, Math.ceil(pastAppointments.length / PAGE_SIZE));
  const totalNotesPages = Math.max(1, Math.ceil(completedConsultations.length / PAGE_SIZE));
  const paginatedPast = pastAppointments.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE);
  const paginatedNotes = completedConsultations.slice((notesPage - 1) * PAGE_SIZE, notesPage * PAGE_SIZE);
  const currentTab = DOCTOR_NAV.find((item) => item.id === activeTab) ?? DOCTOR_NAV[0];

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && DOCTOR_NAV.some((item) => item.id === tab)) {
      setActiveTab(tab as DoctorTab);
    }
  }, [searchParams]);

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
      startRefreshTransition(() => router.refresh());
    } else {
      toast({
        title: "Cancellation Failed",
        description: result.error || "An error occurred.",
        type: "error",
      });
    }
  };

  const switchTab = (tab: DoctorTab) => {
    setActiveTab(tab);
    setShowMoreTabs(false);
  };

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut({ callbackUrl: "/login?role=DOCTOR" });
  };

  const handlePrintPrescription = (appt: Appointment) => {
    if (!appt.prescription) return;

    openPrescriptionPrintWindow(
      buildPrescriptionSlipData(
        {
          appointmentId: appt.id,
          updatedAt: appt.updatedAt,
          prescription: appt.prescription,
          timeSlotDate: appt.timeSlot.date,
          doctor: {
            user: { name: user.name ?? null },
            specialization: profile.specialization,
            licenseNumber: profile.licenseNumber,
          },
        },
        {
          name: appt.patient.user.name,
          dob: "On file",
          gender: "On file",
        }
      )
    );
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
      className="animate-slide-up rounded-xl border border-slate-105 bg-white p-4 transition-[transform,border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-[0_4px_16px_rgba(15,118,110,0.08)]"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">{appt.patient.user.name || "Anonymous Patient"}</h4>
            {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
              <span className="inline-flex items-center gap-1.5 rounded bg-teal-550/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600">
                {appt.status === "CONFIRMED" && <span className="status-dot-confirmed h-1.5 w-1.5 rounded-full bg-teal-600" />}
                {appt.status}
              </span>
            )}
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
            <p className="text-xs text-slate-650">
              Reason: <span className="font-semibold">{appt.reason}</span>
            </p>
          )}
          {appt.symptoms && (
            <p className="text-xs text-slate-400">
              Symptoms: <span className="italic">{appt.symptoms}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {appt.videoRoomUrl && appt.status === "CONFIRMED" && (
            <Link href={`/doctor/appointments/${appt.id}/session`} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-600/10 transition hover:bg-teal-700">
              <Video className="h-3.5 w-3.5" /> Join Room
            </Link>
          )}
          {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
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
                  <Trash2 className="h-3.5 w-3.5" /> Cancel Consultation
                </>
              )}
            </button>
          )}
          {appt.status === "COMPLETED" && (
            <button onClick={() => setSelectedAppt(appt)} className="inline-flex items-center justify-center rounded-md bg-teal-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-teal-700">
              Review Notes
            </button>
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

  const statCards = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Award} label="Experience" value={`${profile.yearsOfExperience} Years`} tone="teal" />
      <StatCard icon={DollarSign} label="Consulting Rate" value={`$${profile.consultationFee.toFixed(2)}`} tone="emerald" />
      {/* <StatCard icon={Star} label="Physician Rating" value={`${profile.rating.toFixed(1)} / 5.0`} tone="amber" /> */}
      <StatCard icon={Clock} label="Availability Status" value="Active" tone="teal" dot />
    </div>
  );

  const profileContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Physician Profile</h2>
        <Link
          href="/doctor/profile/edit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-600/10 transition hover:bg-teal-700"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit Profile
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Specialization", profile.specialization],
          ["Years of Experience", `${profile.yearsOfExperience} years`],
          ["Consultation Fee", `$${profile.consultationFee.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold">Professional Biography</h2>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{profile.bio}</p>
        <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
          <p>
            License ID: <span className="font-mono font-semibold text-slate-700">{profile.licenseNumber}</span>
          </p>
        </div>
      </div>
    </div>
  );

  const scheduleContent = (
    <ActionPanel
      icon={Calendar}
      title="Schedule & Slot Management"
      copy="Configure recurring consulting days, establish time slots, and define breaks for automatic booking coordination."
      href="/doctor/schedule"
      cta="Manage Slots"
    />
  );

  const notesContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl border border-slate-200/60 p-6 shadow-md">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Completed Consultation Records</h2>
              <p className="mt-0.5 text-xs text-slate-500">Review clinical notes and prescriptions from finalized sessions.</p>
            </div>
          </div>
          <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700">{completedConsultations.length}</span>
        </div>

        {completedConsultations.length === 0 ? (
          <EmptyState
            title="No completed consultations yet"
            copy="When you finalize a live session, the consultation notes and prescriptions will appear here."
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-3">
            {paginatedNotes.map((appt, index) => (
              <div
                key={appt.id}
                style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
                className="animate-slide-up rounded-xl border border-slate-100 bg-white p-4 transition hover:border-teal-500/30 hover:shadow-[0_4px_16px_rgba(15,118,110,0.08)]"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{appt.patient.user.name || "Anonymous Patient"}</h4>
                      {appt.notes && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">Notes</span>
                      )}
                      {appt.prescription && (
                        <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600">Rx</span>
                      )}
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
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Reason: <span className="font-semibold text-slate-700">{appt.reason}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAppt(appt)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-teal-600/10 transition hover:bg-teal-700"
                  >
                    <ClipboardList className="h-3.5 w-3.5" /> Review Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalNotesPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-400">
              Showing {(notesPage - 1) * PAGE_SIZE + 1}-{Math.min(notesPage * PAGE_SIZE, completedConsultations.length)} of {completedConsultations.length}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setNotesPage((p) => Math.max(1, p - 1))} disabled={notesPage === 1} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">
                Previous
              </button>
              <button onClick={() => setNotesPage((p) => Math.min(totalNotesPages, p + 1))} disabled={notesPage === totalNotesPages} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
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
          {statCards}
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Today&apos;s queue</h2>
              {activeAppointments.length > 3 && <button onClick={() => switchTab("queue")} className="text-xs font-bold text-teal-700">View all</button>}
            </div>
            {upcoming.length ? <div className="space-y-4">{upcoming.map(appointmentCard)}</div> : <EmptyState title="No pending sessions" copy="Bookings will automatically populate here." icon={Video} />}
          </section>
          {scheduleContent}
        </div>
      );
    }

    if (activeTab === "queue") {
      return (
        <div className="space-y-6 animate-fade-in">
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold">Upcoming Consultation Queue</h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700">{activeAppointments.length}</span>
            </div>
            {activeAppointments.length ? <div className="space-y-4">{activeAppointments.map(appointmentCard)}</div> : <EmptyState title="No pending sessions" copy="Bookings will automatically populate here." icon={Video} />}
          </section>
          <section className="glass-card rounded-2xl border border-slate-200/60 p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Past & Cancelled Log</h3>
            {pastAppointments.length ? <div className="space-y-3">{paginatedPast.map(appointmentCard)}</div> : <EmptyState title="No past consultations" copy="Completed and cancelled consultations will be listed here." icon={ClipboardList} />}
            {renderPastPagination()}
          </section>
        </div>
      );
    }

    if (activeTab === "schedule") return scheduleContent;
    if (activeTab === "notes") return notesContent;
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
            {DOCTOR_NAV.map((item, index) => {
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
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-teal-700">{user.name}</span> · {profile.specialization} Specialist
            </p>
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
        nav={DOCTOR_NAV}
        activeTab={activeTab}
        showMoreTabs={showMoreTabs}
        setShowMoreTabs={setShowMoreTabs}
        switchTab={switchTab}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-teal-500/10 p-2 text-teal-650">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Consultation Record Review</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Patient: {selectedAppt.patient.user.name} · {new Date(selectedAppt.timeSlot.date).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div>
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Chief Complaint</span>
                  <span className="mt-0.5 block font-semibold text-slate-700">{selectedAppt.reason}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Patient Symptoms</span>
                  <span className="mt-0.5 block italic text-slate-700">{selectedAppt.symptoms || "None declared"}</span>
                </div>
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Your Diagnostic Notes</span>
                <div className="whitespace-pre-wrap rounded-xl border border-slate-150 bg-slate-50 p-3.5 leading-relaxed text-slate-650">
                  {selectedAppt.notes || "No clinical diagnostic notes logged for this session."}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Prescribed Rx</span>
                {selectedAppt.prescription ? (
                  <div className="whitespace-pre-wrap rounded-xl border border-dashed border-teal-500/20 bg-teal-500/[0.02] p-3.5 font-mono leading-relaxed text-slate-700">
                    {selectedAppt.prescription}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[10px] text-slate-400">No prescription issued for this encounter.</div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2 border-t border-slate-200 pt-3">
              {selectedAppt.prescription && (
                <button
                  onClick={() => handlePrintPrescription(selectedAppt)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-500/20 py-2.5 text-xs font-bold text-teal-700 transition hover:bg-teal-500/5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Rx
                </button>
              )}
              <button onClick={() => setSelectedAppt(null)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-650 transition hover:bg-slate-200">
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, dot }: { icon: React.ElementType; label: string; value: string; tone: "teal" | "emerald" | "amber"; dot?: boolean }) {
  const toneClass = tone === "amber" ? "bg-amber-500/10 text-amber-500" : tone === "emerald" ? "bg-emerald-500/10 text-emerald-600" : "bg-teal-500/10 text-teal-600";
  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl border border-slate-200/60 p-5 shadow-md">
      <div className={cn("rounded-xl p-3", toneClass)}>
        <Icon className={cn("h-5 w-5", tone === "amber" && "fill-amber-500")} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xl font-bold">
          {dot && <span className="h-2 w-2 rounded-full bg-emerald-500 status-dot-confirmed" />}
          {value}
        </p>
      </div>
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
  nav: typeof DOCTOR_NAV;
  activeTab: DoctorTab;
  showMoreTabs: boolean;
  setShowMoreTabs: React.Dispatch<React.SetStateAction<boolean>>;
  switchTab: (tab: DoctorTab) => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const primary = nav.slice(0, 4);
  const more = nav.slice(4);

  const selectMoreTab = (tab: DoctorTab) => {
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
