"use client";

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface NotificationListenerProps {
  userId: string;
  role: "PATIENT" | "DOCTOR";
  pusherKey: string;
  pusherCluster: string;
}

type NotificationPayload = { title: string; message: string };

export default function NotificationListener({
  userId,
  role,
  pusherKey,
  pusherCluster,
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
    if (!pusherKey || !pusherCluster) {
      console.warn(
        "[Pusher Client] Missing key or cluster from server config. Real-time listening skipped.",
        { hasKey: Boolean(pusherKey), hasCluster: Boolean(pusherCluster) }
      );
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

    const onSubscriptionError = (status: { type?: string; error?: string }) => {
      console.error(`[Pusher Client] Subscription failed for ${channelName}:`, status);
    };

    const onConnectionError = (err: { type?: string; error?: { message?: string } }) => {
      console.error("[Pusher Client] Connection error:", err);
    };

    channel.bind("pusher:subscription_succeeded", onSubscriptionSucceeded);
    channel.bind("pusher:subscription_error", onSubscriptionError);
    pusher.connection.bind("error", onConnectionError);

    if (channel.subscribed) {
      onSubscriptionSucceeded();
    }

    return () => {
      channel.unbind("pusher:subscription_succeeded", onSubscriptionSucceeded);
      channel.unbind("pusher:subscription_error", onSubscriptionError);
      pusher.connection.unbind("error", onConnectionError);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [userId, role, pusherKey, pusherCluster]);

  return null;
}
