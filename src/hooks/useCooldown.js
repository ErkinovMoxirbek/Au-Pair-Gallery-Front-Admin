// src/hooks/useCooldown.js
import { useEffect, useState } from "react";

export function useCooldown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Number(initialSeconds) || 0));

  useEffect(() => {
    if (!secondsLeft) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [secondsLeft]);


  return { secondsLeft };
}

export function formatMmSs(totalSec) {
  const s = Math.max(0, totalSec || 0);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}
