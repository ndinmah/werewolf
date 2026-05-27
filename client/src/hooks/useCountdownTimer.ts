import { useEffect, useState } from 'react';

/**
 * A hook that counts down seconds remaining from a given start timestamp and duration.
 * Updates every 200ms for responsiveness.
 * Returns the rounded-up seconds left, or null if duration/startAt are missing.
 */
export function useCountdownTimer(duration?: number, startAt?: number): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!duration || !startAt) {
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startAt;
      const remaining = Math.max(0, duration - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
    };

    // Run once immediately
    updateTimer();

    const interval = setInterval(updateTimer, 200);

    return () => {
      clearInterval(interval);
      setSecondsLeft(null);
    };
  }, [duration, startAt]);

  if (!duration || !startAt) {
    return null;
  }

  return secondsLeft;
}
