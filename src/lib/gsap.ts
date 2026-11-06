"use client";

import { useLayoutEffect, useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.7 });
}

export { gsap, ScrollTrigger, SplitText };

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  finePointer: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
};

/**
 * Roda animações GSAP com escopo no elemento e limpeza automática ao desmontar.
 * `setup` recebe o gsap.matchMedia já criado: anime dentro de mm.add(MQ.motion, ...)
 * para respeitar prefers-reduced-motion.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (mm: gsap.MatchMedia, el: HTMLElement) => void,
  deps: unknown[] = [],
  opts: { defer?: boolean } = {},
) {
  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    let mm: gsap.MatchMedia | undefined;
    const run = () => {
      mm = gsap.matchMedia(el);
      setup(mm, el);
    };
    if (!opts.defer) {
      run();
      return () => mm?.revert();
    }
    // Capítulos abaixo da dobra: prepara as animações num momento ocioso do navegador,
    // fatiando o trabalho em tarefas pequenas (menos bloqueio da thread principal no carregamento)
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 1200 }) : window.setTimeout(run, 60);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
      mm?.revert();
    };
  }, deps);
}

/**
 * Revelações padrão de capítulo: elementos com [data-reveal] entram em lote quando
 * chegam à tela. "mask" abre por clip-path; o resto sobe 24px com fade.
 */
export function revealIn(mm: gsap.MatchMedia, el: HTMLElement) {
  mm.add(MQ.motion, () => {
    const fades = el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal='mask'])");
    const masks = el.querySelectorAll<HTMLElement>("[data-reveal='mask']");
    ScrollTrigger.batch(fades, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.fromTo(batch, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", overwrite: true }),
    });
    masks.forEach((m) =>
      gsap.fromTo(
        m,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: m, start: "top 85%", once: true },
        },
      ),
    );
  });
}

/** Parallax leve (≤ 5% da altura, MOTION.md) em [data-parallax="0.05"]. */
export function parallax(mm: gsap.MatchMedia, el: HTMLElement) {
  mm.add(MQ.desktop, () => {
    el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((p) => {
      const amount = Number(p.dataset.parallax || 0.05);
      gsap.fromTo(
        p,
        { yPercent: -amount * 100 },
        {
          yPercent: amount * 100,
          ease: "none",
          scrollTrigger: { trigger: p.parentElement ?? p, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  });
}

/** Título com linhas reveladas por máscara (SplitText). */
export function splitLines(mm: gsap.MatchMedia, targets: Element[] | NodeListOf<Element>, opts: { scroll?: boolean; delay?: number } = {}) {
  mm.add(MQ.motion, () => {
    const splits: SplitText[] = [];
    Array.from(targets).forEach((t) => {
      const split = SplitText.create(t, { type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.08,
            delay: opts.delay ?? 0,
            scrollTrigger: opts.scroll === false ? undefined : { trigger: t, start: "top 85%", once: true },
          }),
      });
      (t as HTMLElement).style.visibility = "visible";
      splits.push(split);
    });
    return () => splits.forEach((s) => s.revert());
  });
}
