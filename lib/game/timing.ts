export const PACES = ["immediate", "soon", "later"] as const
export type Pace = (typeof PACES)[number]

type Range = readonly [min: number, max: number]

/** Delay before an AI message appears, by the pace the AI picked. */
export const PACE_RANGES_MS: Record<Pace, Range> = {
  immediate: [1000, 4000],
  soon: [5000, 15000],
  later: [20000, 50000],
}

/** An AI response always lands within this long of its trigger, API time included. */
export const MAX_RESPONSE_MS = 60_000

/** Wait after the human's last message before the AI is asked, so a burst gets one response. */
export const HUMAN_MESSAGE_DEBOUNCE_MS: Range = [1000, 3000]

/** Silence before the AI is asked whether to speak up. Re-rolled on every message. */
export const QUIET_MS: Range = [15000, 40000]

/** Chance the AI's chosen pace is nudged one step faster or slower. */
const PACE_JITTER_CHANCE = 0.15

const TYPING_MS_PER_CHAR = 40
const TYPING_MS: Range = [1000, 6000]

export function randomBetween([min, max]: Range, random: () => number = Math.random): number {
  return Math.round(min + random() * (max - min))
}

/** Occasionally move the pace one step, so even the AI's rhythm isn't fully predictable. */
export function jitterPace(pace: Pace, random: () => number = Math.random): Pace {
  if (random() >= PACE_JITTER_CHANCE) return pace
  const index = PACES.indexOf(pace)
  const step = random() < 0.5 ? -1 : 1
  return PACES[Math.min(PACES.length - 1, Math.max(0, index + step))]
}

export function capPace(pace: Pace, max: Pace): Pace {
  return PACES.indexOf(pace) > PACES.indexOf(max) ? max : pace
}

/**
 * Split an AI response's delay into a silent "reading" phase and a visible
 * "typing" phase. `elapsedMs` is time already spent since the trigger.
 */
export function planDelivery(
  { pace, messageLength, elapsedMs }: { pace: Pace; messageLength: number; elapsedMs: number },
  random: () => number = Math.random,
): { readingMs: number; typingMs: number } {
  const budget = Math.max(0, MAX_RESPONSE_MS - elapsedMs)
  const totalMs = Math.min(randomBetween(PACE_RANGES_MS[pace], random), budget)
  const typingMs =
    messageLength > 0
      ? Math.min(totalMs, Math.min(TYPING_MS[1], Math.max(TYPING_MS[0], messageLength * TYPING_MS_PER_CHAR)))
      : 0
  return { readingMs: totalMs - typingMs, typingMs }
}
