const EARLY_JOIN_MS = 10 * 60 * 1000;
const LATE_CLOSE_MS = 60 * 60 * 1000;

export function isEarlyConsultJoinEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_EARLY_CONSULT_JOIN === "true";
}

export interface ConsultationJoinState {
  earlyJoinBoundary: Date;
  joinCloseBoundary: Date;
  isEarly: boolean;
  isLate: boolean;
  isWithinWindow: boolean;
}

export function getConsultationJoinState(
  slotStart: Date,
  slotEnd: Date,
  now: Date,
  options?: { allowEarlyJoin?: boolean; hasVideoRoom?: boolean }
): ConsultationJoinState {
  const earlyJoinBoundary = new Date(slotStart.getTime() - EARLY_JOIN_MS);
  const joinCloseBoundary = new Date(slotEnd.getTime() + LATE_CLOSE_MS);

  const allowEarlyJoin =
    options?.allowEarlyJoin ?? isEarlyConsultJoinEnabled();

  if (allowEarlyJoin && options?.hasVideoRoom !== false) {
    return {
      earlyJoinBoundary,
      joinCloseBoundary,
      isEarly: false,
      isLate: false,
      isWithinWindow: true,
    };
  }

  const isEarly = now < earlyJoinBoundary;
  const isLate = now > joinCloseBoundary;
  const isWithinWindow = now >= earlyJoinBoundary && now <= joinCloseBoundary;

  return {
    earlyJoinBoundary,
    joinCloseBoundary,
    isEarly,
    isLate,
    isWithinWindow,
  };
}

/** Daily.co room `exp` (unix seconds). Extends minimum TTL when early-join testing flag is on. */
export function getDailyRoomExpTimestamp(slotEnd: Date): number {
  const defaultExpMs = slotEnd.getTime() + 2 * 60 * 60 * 1000;
  const expMs = isEarlyConsultJoinEnabled()
    ? Math.max(defaultExpMs, Date.now() + 24 * 60 * 60 * 1000)
    : defaultExpMs;
  return Math.floor(expMs / 1000);
}
