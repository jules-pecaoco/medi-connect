"use strict";

"use server";

import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { auth } from "@/auth";
import {
  registerSchema,
  patientProfileSchema,
  doctorProfileSchema,
  type RegisterInput,
  type PatientProfileInput,
  type DoctorProfileInput,
} from "@/validators/auth";
import { revalidatePath } from "next/cache";

export async function registerUser(input: RegisterInput) {
  try {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { email, password, name, role } = parsed.data;

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function upsertPatientProfile(input: PatientProfileInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "PATIENT") {
      return { success: false, error: "Forbidden: Not a patient" };
    }

    const parsed = patientProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    await db.patientProfile.upsert({
      where: { userId: session.user.id },
      update: {
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        bloodType: data.bloodType,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        medicalHistory: data.medicalHistory,
      },
      create: {
        userId: session.user.id,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        bloodType: data.bloodType,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        medicalHistory: data.medicalHistory,
      },
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/records");
    revalidatePath("/patient/profile/edit");
    return { success: true };
  } catch (error: any) {
    console.error("Patient profile error:", error);
    return { success: false, error: "Could not save patient profile" };
  }
}

export async function upsertDoctorProfile(input: DoctorProfileInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "DOCTOR") {
      return { success: false, error: "Forbidden: Not a doctor" };
    }

    const parsed = doctorProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    await db.doctorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        consultationFee: data.consultationFee,
      },
      create: {
        userId: session.user.id,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        consultationFee: data.consultationFee,
      },
    });

    revalidatePath("/doctor/dashboard");
    revalidatePath("/patient/doctors");
    revalidatePath("/patient/doctors/[id]");
    revalidatePath("/doctor/profile/edit");
    return { success: true };
  } catch (error: any) {
    console.error("Doctor profile error:", error);
    return { success: false, error: "Could not save doctor profile" };
  }
}
