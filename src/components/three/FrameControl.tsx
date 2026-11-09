"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/**
 * Dentro do <Canvas frameloop="demand">:
 * - Ticker: pede quadros a ~30 fps só enquanto a cena está ativa (na tela e com movimento permitido).
 *   30 fps bastam para estes movimentos e liberam o processador para a rolagem continuar lisa.
 * - FrameGuard: mede os quadros reais; se a média passar de ~34 ms, avisa (onSlow) para baixar a qualidade.
 */
export function Ticker({ running, fps = 30 }: { running: boolean; fps?: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => invalidate(), 1000 / fps);
    return () => window.clearInterval(id);
  }, [running, fps, invalidate]);
  return null;
}

export function FrameGuard({ onSlow }: { onSlow?: () => void }) {
  const n = useRef(0);
  const sum = useRef(0);
  const last = useRef(0);
  const fired = useRef(false);
  useFrame(() => {
    const now = performance.now();
    const dt = last.current ? now - last.current : 0;
    last.current = now;
    if (fired.current || !dt || dt > 400) return; // ignora pausas (aba oculta, fora da tela)
    n.current++;
    if (n.current <= 15) return; // aquecimento
    sum.current += dt;
    if (n.current === 75) {
      // a 30 fps o esperado é ~33 ms; acima de ~45 ms de média, está travando
      if (sum.current / 60 > 45) {
        fired.current = true;
        onSlow?.();
      }
      n.current = 15;
      sum.current = 0;
    }
  });
  return null;
}
