import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { ToastProvider } from "@/components/ui/toast";
import NotificationListener from "@/components/shared/NotificationListener";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MediConnect — Modern Telehealth & Video Consultations",
  description:
    "Experience premium, instant healthcare consultation, Gemini-driven symptom recommendations, and seamless secure telehealth consulting from anywhere.",
  keywords: ["telehealth", "doctor booking", "video consultation", "AI healthcare triage"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${outfit.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          {session?.user?.id && <NotificationListener userId={session.user.id} role={session.user.role as "PATIENT" | "DOCTOR"} />}
          <main className="flex-1 flex flex-col relative">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
