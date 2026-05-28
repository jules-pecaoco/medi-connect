"use client";

import { useEffect } from "react";
import PusherClient from "pusher-js";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface NotificationListenerProps {
  userId: string;
  role: "PATIENT" | "DOCTOR";
}

export default function NotificationListener({
  userId,
  role,
}: NotificationListenerProps) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn("Pusher environment variables missing on client. Real-time listening skipped.");
      return;
    }

    // Initialize Pusher Client
    const pusher = new PusherClient(pusherKey, {
      cluster: pusherCluster,
    });

    const channelName = role === "PATIENT" ? `patient-${userId}` : `doctor-${userId}`;
    const channel = pusher.subscribe(channelName);

    console.log(`[Pusher Client] Subscribed to channel: ${channelName}`);

    // Bind event: Booked
    channel.bind("appointment.booked", (data: { title: string; message: string }) => {
      toast({
        title: data.title || "Appointment Booked!",
        description: data.message || "A new consultation has been successfully booked.",
        type: "success",
      });
      router.refresh();
    });

    // Bind event: Cancelled
    channel.bind("appointment.cancelled", (data: { title: string; message: string }) => {
      toast({
        title: data.title || "Appointment Cancelled",
        description: data.message || "A consultation schedule has been cancelled.",
        type: "error",
      });
      router.refresh();
    });

    // Bind event: Updated/Rescheduled
    channel.bind("appointment.updated", (data: { title: string; message: string }) => {
      toast({
        title: data.title || "Appointment Rescheduled",
        description: data.message || "A consultation schedule has been updated.",
        type: "info",
      });
      router.refresh();
    });

    // Clean up subscriptions
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [userId, role, toast, router]);

  return null;
}
