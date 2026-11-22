"use client";

import { useEffect, useState } from "react";

export function Countdown({ to }: { to: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const tick = () =>
      setDays(Math.max(0, Math.ceil((new Date(to + "T00:00:00").getTime() - Date.now()) / 86_400_000)));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [to]);

  return (
    <span className="tabular-nums" aria-live="polite">
      {days === null ? "—" : days}
    </span>
  );
}
