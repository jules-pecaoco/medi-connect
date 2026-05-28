import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getDoctorDetail } from "@/actions/doctors";
import { getDoctorAvailableSlots } from "@/actions/schedule";
import DoctorDetailClient from "./DoctorDetailClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?role=PATIENT");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/doctor/dashboard");
  }

  const patientProfile = await db.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!patientProfile) {
    redirect("/patient/onboarding");
  }

  // Resolve params promise (Next.js 15+)
  const resolvedParams = await params;
  const doctorId = resolvedParams.id;

  // Fetch details and slots in parallel
  const [detailRes, slotsRes] = await Promise.all([
    getDoctorDetail(doctorId),
    getDoctorAvailableSlots(doctorId)
  ]);

  if (!detailRes.success || !detailRes.data) {
    redirect("/patient/doctors");
  }

  const doctor = detailRes.data;
  const slots = slotsRes.success ? slotsRes.data : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />

      <div className="z-10 relative">
        <DoctorDetailClient doctor={doctor} slots={slots} />
      </div>
    </div>
  );
}
