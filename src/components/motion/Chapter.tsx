"use client";

import { useRef } from "react";
import { parallax, revealIn, splitLines, useGsap } from "@/lib/gsap";

type Theme = "dark" | "light" | "red";

const themes: Record<Theme, string> = {
  dark: "bg-forno text-farinha",
  light: "bg-farinha text-forno on-light",
  red: "bg-brasa text-farinha",
};

type Props = React.HTMLAttributes<HTMLElement> & {
  id: string;
  theme: Theme;
  /** Configuração extra de animação específica do capítulo. */
  onAnimate?: (mm: gsap.MatchMedia, el: HTMLElement) => void;
};

/**
 * Capítulo editorial: aplica revelações por scroll ([data-reveal]), parallax leve
 * ([data-parallax]) e títulos revelados linha a linha ([data-split]).
 * A cor da barra de navegação acompanha o tema (data-nav).
 */
export function Chapter({ id, theme, onAnimate, className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, (mm, el) => {
    revealIn(mm, el);
    parallax(mm, el);
    splitLines(mm, el.querySelectorAll("[data-split]"));
    onAnimate?.(mm, el);
  }, [], { defer: true });
  return (
    <section ref={ref} id={id} data-nav={theme} className={`relative ${themes[theme]} ${className}`} {...rest}>
      {children}
    </section>
  );
}

/** Container com a grade de 12 colunas e as margens do site. */
export function Wrap({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto max-w-[1600px] px-[var(--gutter)] ${className}`}>{children}</div>;
}
