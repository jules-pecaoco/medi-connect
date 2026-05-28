import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "PATIENT" | "DOCTOR";
  }
  interface Session {
    user: {
      id: string;
      role?: "PATIENT" | "DOCTOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "PATIENT" | "DOCTOR";
  }
}
