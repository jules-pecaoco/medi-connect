"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Search, 
  Filter, 
  Star, 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Award,
  Stethoscope
} from "lucide-react";

interface Doctor {
  id: string;
  specialization: string;
  yearsOfExperience: number;
  consultationFee: number;
  rating: number;
  bio: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DoctorListingClientProps {
  initialDoctors: Doctor[];
  specializations: string[];
  meta: Meta;
  currentSearch: string;
  currentSpecialization: string;
}

export default function DoctorListingClient({
  initialDoctors,
  specializations,
  meta,
  currentSearch,
  currentSpecialization,
}: DoctorListingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search local states
  const [search, setSearch] = useState(currentSearch);
  const [specialization, setSpecialization] = useState(currentSpecialization);

  const handleFilterChange = (newSearch: string, newSpec: string, newPage = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newSpec && newSpec !== "ALL") {
      params.set("specialization", newSpec);
    } else {
      params.delete("specialization");
    }

    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange(search, specialization, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/patient/dashboard"
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-600/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Physician Directory</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Discover medical experts, read reviews, and examine schedules.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by physician name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow"
          />
        </div>

        {/* Specialization Select */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              handleFilterChange(search, e.target.value, 1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl input-glow appearance-none"
          >
            <option value="ALL">All Specializations</option>
            {specializations.map((spec, idx) => (
              <option key={idx} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-teal-600/10 cursor-pointer"
          >
            Search Directory
          </button>
        </div>
      </form>

      {/* Main Listing Grid */}
      {initialDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/85 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/10">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-sm">No Physicians Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            We couldn&apos;t find any doctors matching your search terms. Try modifying your search parameters or check your spelling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {initialDoctors.map((doc) => {
            const initials = doc.user.name
              ? doc.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "DR";

            return (
              <div
                key={doc.id}
                className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top info and avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 hover:text-teal-600 transition">
                        Dr. {doc.user.name}
                      </h3>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-1">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>

                  {/* Bio summary */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">
                    {doc.bio}
                  </p>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 dark:border-slate-800/40 mb-5 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {doc.rating.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Experience</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                        {doc.yearsOfExperience} Yrs
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Consult Fee</p>
                      <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                        ${doc.consultationFee.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/patient/doctors/${doc.id}`}
                  className="w-full text-center py-2.5 border border-slate-200 dark:border-slate-800 hover:border-teal-500/35 hover:bg-teal-500/5 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  View Profile & Availability
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400">
            Showing page <span className="font-semibold text-slate-600 dark:text-slate-200">{meta.page}</span> of <span className="font-semibold text-slate-600 dark:text-slate-200">{meta.totalPages}</span> ({meta.total} physicians found)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange(search, specialization, meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleFilterChange(search, specialization, meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
