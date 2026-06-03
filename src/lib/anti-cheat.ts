export const SUSPICIOUS_BEHAVIOR_LIMIT = 5;

export type SuspiciousActivityType =
  | "tab_switch"
  | "window_blur"
  | "copy"
  | "paste"
  | "state_tamper"
  | "timer_mismatch"
  | "impossible_speed";

export interface SuspiciousActivityEvent {
  id: string;
  type: SuspiciousActivityType;
  occurredAt: string;
  warningNumber: number;
  limit: number;
  invalidatesScore: boolean;
  message: string;
}

const MESSAGES: Record<SuspiciousActivityType, string> = {
  tab_switch: "Switching tabs during a quiz run was flagged.",
  window_blur: "Leaving the quiz window during a quiz run was flagged.",
  copy: "Copy activity during a quiz run was flagged.",
  paste: "Paste activity during a quiz run was flagged.",
  state_tamper: "Saved quiz state changed unexpectedly and was flagged.",
  timer_mismatch: "Quiz timer state changed unexpectedly and was flagged.",
  impossible_speed: "Answer timing looked impossible and was flagged.",
};

function createId(type: SuspiciousActivityType, occurredAt: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${type}-${occurredAt}-${Math.random().toString(36).slice(2)}`;
}

export function createSuspiciousActivityEvent(input: {
  type: SuspiciousActivityType;
  existingCount: number;
  occurredAt?: Date;
  limit?: number;
}): SuspiciousActivityEvent {
  const occurredAt = (input.occurredAt ?? new Date()).toISOString();
  const limit = input.limit ?? SUSPICIOUS_BEHAVIOR_LIMIT;
  const warningNumber = input.existingCount + 1;

  return {
    id: createId(input.type, occurredAt),
    type: input.type,
    occurredAt,
    warningNumber,
    limit,
    invalidatesScore: warningNumber > limit,
    message: MESSAGES[input.type],
  };
}

export function isScoreInvalidatedBySuspiciousActivity(
  events: readonly SuspiciousActivityEvent[],
  limit = SUSPICIOUS_BEHAVIOR_LIMIT,
) {
  return events.length > limit;
}
