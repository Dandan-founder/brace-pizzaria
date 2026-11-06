"use client";

import { useEffect, useState } from "react";
import { openStatus, type OpenStatus as Status } from "@/lib/hours";

/** "Aberto agora, até 23h" calculado no fuso da pizzaria. Renderiza só no cliente (hora real). */
export function useOpenStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setStatus(openStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

export function OpenStatus({ className = "" }: { className?: string }) {
  const status = useOpenStatus();
  return (
    <p className={`inline-flex min-h-6 items-center gap-2.5 ${className}`} aria-live="polite">
      {status && (
        <>
          <span className="relative grid h-2.5 w-2.5 place-items-center" aria-hidden>
            {status.open && <span className="absolute inset-0 animate-ping rounded-full bg-olio-light/70 motion-reduce:hidden" />}
            <span className={`h-2.5 w-2.5 rounded-full ${status.open ? "bg-olio-light" : "bg-current opacity-40"}`} />
          </span>
          {status.open
            ? `Forno aceso agora, até ${status.closesAt}`
            : status.nextLabel
              ? `Fechado agora. Abrimos ${status.nextLabel}`
              : "Fechado agora"}
        </>
      )}
    </p>
  );
}
