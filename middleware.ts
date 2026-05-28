import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isPatientRoute = nextUrl.pathname.startsWith("/patient");
  const isDoctorRoute = nextUrl.pathname.startsWith("/doctor");

  if (isAuthRoute) {
    if (isLoggedIn && user) {
      const dest = user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard";
      return Response.redirect(new URL(dest, nextUrl));
    }
    return;
  }

  if (isPatientRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login?role=PATIENT", nextUrl));
    }
    if (user?.role !== "PATIENT") {
      return Response.redirect(new URL("/doctor/dashboard", nextUrl));
    }
  }

  if (isDoctorRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login?role=DOCTOR", nextUrl));
    }
    if (user?.role !== "DOCTOR") {
      return Response.redirect(new URL("/patient/dashboard", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/patient/:path*",
    "/doctor/:path*",
  ],
};
