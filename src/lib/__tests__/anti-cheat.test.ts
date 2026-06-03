import { describe, expect, it } from "vitest";
import { createSuspiciousActivityEvent, isScoreInvalidatedBySuspiciousActivity } from "../anti-cheat";

describe("anti-cheat events", () => {
  it("counts warnings and invalidates only after the fifth event", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      createSuspiciousActivityEvent({ type: "tab_switch", existingCount: i }),
    );

    expect(events[4].warningNumber).toBe(5);
    expect(events[4].invalidatesScore).toBe(false);
    expect(events[5].warningNumber).toBe(6);
    expect(events[5].invalidatesScore).toBe(true);
    expect(isScoreInvalidatedBySuspiciousActivity(events.slice(0, 5))).toBe(false);
    expect(isScoreInvalidatedBySuspiciousActivity(events)).toBe(true);
  });
});
