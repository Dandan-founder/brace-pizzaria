"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

/** Mostra o fallback se a cena 3D falhar (navegador sem WebGL, GPU bloqueada etc.). */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Observa um elemento: `near` vira true (e fica) quando ele chega perto da tela — hora de baixar o 3D;
 * `visible` acompanha se ele está na tela — para pausar a animação quando sai.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pre = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    pre.observe(el);
    vis.observe(el);
    return () => {
      pre.disconnect();
      vis.disconnect();
    };
  }, []);
  return { ref, near, visible };
}

/**
 * Nível de 3D para este aparelho:
 * - "poster": sem placa de vídeo (renderização por software), economia de dados ou pouca memória → imagem pré-renderizada
 * - "medium": celular/tela de toque → 3D simplificado (resolução 1x, sem efeitos caros)
 * - "high": computador → 3D completo
 * Em qualquer nível, o FrameGuard rebaixa sozinho se o 3D começar a travar.
 */
export type Tier = "high" | "medium" | "poster";

export function detectTier(): Tier {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "poster";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "poster";
  } catch {
    return "poster";
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "poster";
  if ((nav.deviceMemory ?? 8) <= 2) return "poster";
  return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ? "medium" : "high";
}

export const lowerTier = (t: Tier): Tier => (t === "high" ? "medium" : "poster");
