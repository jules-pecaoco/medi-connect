import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { ToastProvider } from "@/components/ui/toast";
import NotificationListener from "@/components/shared/NotificationListener";
import NavigationProgress from "@/components/shared/NavigationProgress";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MediConnect - Modern Telehealth & Video Consultations",
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
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable} ${jetBrainsMono.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {session?.user?.id && <NotificationListener userId={session.user.id} role={session.user.role as "PATIENT" | "DOCTOR"} />}
          <main className="flex-1 flex flex-col relative">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
