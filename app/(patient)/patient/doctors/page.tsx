import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { searchDoctors, getSpecializations } from "@/actions/doctors";
import DoctorListingClient from "./DoctorListingClient";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    specialization?: string;
    page?: string;
  }>;
}

export default async function DoctorDiscoveryPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?role=PATIENT");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/doctor/dashboard");
  }

  const profile = await db.patientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/patient/onboarding");
  }

  // Resolve searchParams promise
  const params = await searchParams;
  const search = params.search || "";
  const specialization = params.specialization || "ALL";
  const page = parseInt(params.page || "1", 10);

  // Parallel server fetches
  const [specsRes, doctorsRes] = await Promise.all([
    getSpecializations(),
    searchDoctors({ search, specialization, page, limit: 6 })
  ]);

  const specializations = specsRes.success ? specsRes.data : [];
  const doctorsData = doctorsRes.success ? doctorsRes.data : [];
  const meta = doctorsRes.success ? doctorsRes.meta : { total: 0, page: 1, limit: 6, totalPages: 1 };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-bg top-[-200px] left-[-200px] opacity-10" />
      <div className="glow-bg bottom-[-200px] right-[-200px] opacity-10" />

      <div className="z-10 relative">
        <DoctorListingClient 
          initialDoctors={doctorsData} 
          specializations={specializations} 
          meta={meta}
          currentSearch={search}
          currentSpecialization={specialization}
        />
      </div>
    </div>
  );
}
