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
