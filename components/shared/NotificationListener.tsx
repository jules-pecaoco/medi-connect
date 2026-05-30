"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface NotificationListenerProps {
  userId: string;
  role: "PATIENT" | "DOCTOR";
}

type NotificationPayload = { title: string; message: string };

export default function NotificationListener({
  userId,
  role,
}: NotificationListenerProps) {
  const { toast } = useToast();
  const router = useRouter();
  const toastRef = useRef(toast);
  const routerRef = useRef(router);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn("Pusher environment variables missing on client. Real-time listening skipped.");
      return;
    }

    const pusher = new PusherClient(pusherKey, {
      cluster: pusherCluster,
    });

    const channelName = role === "PATIENT" ? `patient-${userId}` : `doctor-${userId}`;
    const channel = pusher.subscribe(channelName);

    const showToast = (
      data: NotificationPayload,
      type: "success" | "error" | "info",
      fallbackTitle: string,
      fallbackMessage: string
    ) => {
      toastRef.current({
        title: data.title || fallbackTitle,
        description: data.message || fallbackMessage,
        type,
      });
      routerRef.current.refresh();
    };

    let eventsBound = false;

    const onSubscriptionSucceeded = () => {
      if (eventsBound) return;
      eventsBound = true;

      console.log(`[Pusher Client] Subscribed to channel: ${channelName}`);

      channel.bind("appointment.booked", (data: NotificationPayload) => {
        showToast(
          data,
          "success",
          "Appointment Booked!",
          "A new consultation has been successfully booked."
        );
      });

      channel.bind("appointment.cancelled", (data: NotificationPayload) => {
        showToast(
          data,
          "error",
          "Appointment Cancelled",
          "A consultation schedule has been cancelled."
        );
      });

      channel.bind("appointment.updated", (data: NotificationPayload) => {
        showToast(
          data,
          "info",
          "Appointment Rescheduled",
          "A consultation schedule has been updated."
        );
      });

      channel.bind("appointment.completed", (data: NotificationPayload) => {
        showToast(
          data,
          "info",
          "Medical Record Available",
          "Your consultation notes and prescription are ready."
        );
      });
    };

    channel.bind("pusher:subscription_succeeded", onSubscriptionSucceeded);

    if (channel.subscribed) {
      onSubscriptionSucceeded();
    }

    return () => {
      channel.unbind("pusher:subscription_succeeded", onSubscriptionSucceeded);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [userId, role]);

  return null;
}
