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
    const missing = [
      !process.env.PUSHER_APP_ID && "PUSHER_APP_ID",
      !process.env.PUSHER_SECRET && "PUSHER_SECRET",
      !process.env.NEXT_PUBLIC_PUSHER_KEY && "NEXT_PUBLIC_PUSHER_KEY",
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER && "NEXT_PUBLIC_PUSHER_CLUSTER",
    ].filter(Boolean);

    if (missing.length > 0) {
      console.warn(
        `[Pusher] Server credentials missing (${missing.join(", ")}). Skipped "${event}" on channel "${channel}".`
      );
      return;
    }
    await pusherServer.trigger(channel, event, data);
    console.log(`[Pusher success] Event "${event}" sent on channel "${channel}"`);
  } catch (error) {
    console.error(`[Pusher failure] Triggering event "${event}" failed:`, error);
  }
}
