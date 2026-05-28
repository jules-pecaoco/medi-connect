import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DOCTOR"], {
    required_error: "Please select a role",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DOCTOR"], {
    required_error: "Please select a role",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const patientProfileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
  bloodType: z.string().optional().nullable(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(8, "Emergency contact phone must be at least 8 digits"),
  medicalHistory: z.string().optional().nullable(),
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;

export const doctorProfileSchema = z.object({
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(4, "License number must be at least 4 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  yearsOfExperience: z.coerce.number().int().min(0, "Years of experience must be 0 or more"),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be 0 or more"),
});

export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;

export const scheduleSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  slotDurationMinutes: z.coerce
    .number()
    .int()
    .refine((v) => [15, 20, 30, 60].includes(v), {
      message: "Slot duration must be 15, 20, 30, or 60 minutes",
    }),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export const doctorSearchSchema = z.object({
  search: z.string().optional(),
  specialization: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type DoctorSearchInput = z.infer<typeof doctorSearchSchema>;

