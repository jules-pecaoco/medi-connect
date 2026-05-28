import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
  useTLS: true,
});

/**
 * Triggers a real-time event via Pusher with full environment safeguards.
 */
export async function triggerNotification(
  channel: string,
  event: string,
  data: any
) {
  try {
    if (
      !process.env.PUSHER_APP_ID ||
      !process.env.PUSHER_SECRET ||
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      console.warn(
        `[Pusher Webhook Sim] Pusher credentials missing. Notification on channel: "${channel}" for event: "${event}" bypassed.`
      );
      return;
    }
    await pusherServer.trigger(channel, event, data);
    console.log(`[Pusher success] Event "${event}" sent on channel "${channel}"`);
  } catch (error) {
    console.error(`[Pusher failure] Triggering event "${event}" failed:`, error);
  }
}
