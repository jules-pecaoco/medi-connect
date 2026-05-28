"use server";

import db from "@/lib/db";

export interface SearchDoctorsFilters {
  search?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}

/** Search and filter doctors with pagination */
export async function searchDoctors(filters: SearchDoctorsFilters = {}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 8;
    const skip = (page - 1) * limit;

    const where: any = {
      availabilityStatus: true,
    };

    if (filters.specialization && filters.specialization !== "ALL") {
      where.specialization = filters.specialization;
    }

    if (filters.search) {
      where.OR = [
        {
          user: {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [doctors, total] = await db.$transaction([
      db.doctorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          rating: "desc",
        },
      }),
      db.doctorProfile.count({ where }),
    ]);

    return {
      success: true as const,
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("searchDoctors error:", error);
    return { success: false as const, error: "Failed to search doctors" };
  }
}

/** Get details for a single doctor */
export async function getDoctorDetail(id: string) {
  try {
    const doctor = await db.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!doctor) {
      return { success: false as const, error: "Doctor not found" };
    }

    return { success: true as const, data: doctor };
  } catch (error) {
    console.error("getDoctorDetail error:", error);
    return { success: false as const, error: "Failed to load doctor profile" };
  }
}

/** Get list of distinct specializations */
export async function getSpecializations() {
  try {
    const doctors = await db.doctorProfile.findMany({
      where: { availabilityStatus: true },
      select: { specialization: true },
      distinct: ["specialization"],
    });

    const specializations = doctors.map((d) => d.specialization);
    return { success: true as const, data: specializations };
  } catch (error) {
    console.error("getSpecializations error:", error);
    return { success: false as const, error: "Failed to fetch specializations" };
  }
}
