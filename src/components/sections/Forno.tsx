"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MQ, ScrollTrigger, useGsap } from "@/lib/gsap";
import { detectTier, lowerTier, SceneBoundary, useInView, type Tier } from "@/components/three/Lazy3D";

const OvenScene = dynamic(() => import("@/components/three/OvenScene"), { ssr: false, loading: () => <OvenFallback /> });

/** Enquanto o 3D carrega (ou sem WebGL): o brilho da boca do forno, em CSS. */
function OvenFallback() {
  return (
    <div aria-hidden className="absolute inset-0 bg-forno">
      <div className="absolute left-1/2 top-[52%] h-[32vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-[radial-gradient(ellipse_at_50%_90%,#ffb35c_0%,#e2541c_28%,#7a1c0c_60%,#1a0f0b_100%)] opacity-80 blur-[2px]" />
    </div>
  );
}

const beats = [
  { kicker: "15h", title: "A lenha é acesa à tarde", text: "Eucalipto de reflorestamento, empilhado no fundo do forno. Leva horas para a cúpula de tijolos ficar pronta." },
  { kicker: "485 °C", title: "A cúpula guarda o calor", text: "O tijolo refratário devolve o calor por cima, a pedra assa por baixo. É assim que a borda cresce e mancha." },
  { kicker: "90 s", title: "E a pizza está pronta", text: "Um minuto e meio, girando a pá perto do fogo. Sai macia no centro, crocante na borda, direto para a mesa." },
];

/**
 * "O forno": seção fixa na tela enquanto o visitante rola. A câmera se aproxima da boca do forno 3D,
 * o fogo aumenta e a temperatura sobe. Com movimento reduzido: forno parado e os textos em lista.
 */
export function Forno() {
  const { ref, near, visible } = useInView<HTMLElement>();
  const progress = useRef(0.5);
  const temp = useRef<HTMLSpanElement>(null);
  const [beat, setBeat] = useState(0);
  const [reduced, setReduced] = useState(false);
  // Nível de 3D conforme o aparelho; a própria cena rebaixa se começar a travar
  const [tier, setTier] = useState<Tier | null>(null);
  const poster = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // celular/tablet (toque): a seção presa com o forno girando na rolagem fica travada no dedo.
    // Nesses aparelhos vira a lista comum (a mesma do movimento reduzido), com o forno em imagem.
    const touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setTier(touch ? "poster" : detectTier());
    const mq = window.matchMedia(MQ.reduce);
    setReduced(mq.matches || touch);
    const on = () => setReduced(mq.matches || touch);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useGsap(ref, (mm, el) => {
    // só com mouse: no toque a seção vira lista parada (ver o useEffect acima)
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      progress.current = 0;
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          poster.current?.style.setProperty("--p", p.toFixed(3));
          setBeat(Math.min(beats.length - 1, Math.floor(p * beats.length * 0.999)));
          if (temp.current) temp.current.textContent = String(Math.round(180 + p * 305));
        },
      });
    });
  }, []);

  const stage = (
    <div className="absolute inset-0">
      {tier === "poster" ? (
        // Aparelho sem fôlego para 3D ao vivo: o mesmo forno pré-renderizado (de longe e de perto),
        // com aproximação e troca guiadas pela rolagem — só transform/opacity, sempre liso.
        <div ref={poster} aria-hidden className="absolute inset-0 overflow-hidden bg-forno" style={{ ["--p" as string]: reduced ? "0.6" : "0" }}>
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/oven-m-far.webp" />
            <img src="/images/oven-d-far.webp" alt="" className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ transform: "scale(calc(1 + var(--p) * 0.5))", transformOrigin: "52% 62%" }} />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/oven-m-near.webp" />
            <img src="/images/oven-d-near.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ opacity: "clamp(0, calc((var(--p) - 0.5) * 9), 1)", transform: "scale(calc(1.12 - var(--p) * 0.12))", transformOrigin: "50% 55%" }} />
          </picture>
        </div>
      ) : near && tier ? (
        <SceneBoundary fallback={<OvenFallback />}>
          <OvenScene progress={progress} active={visible} reduced={reduced} tier={tier} onSlow={() => setTier((t) => (t ? lowerTier(t) : t))} />
        </SceneBoundary>
      ) : (
        <OvenFallback />
      )}
      {/* leitura do texto sobre a cena */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,12,10,.88)_0%,rgba(14,12,10,.55)_38%,transparent_62%)] max-md:bg-[linear-gradient(0deg,rgba(14,12,10,.95)_0%,rgba(14,12,10,.7)_38%,transparent_62%)]" />
    </div>
  );

  const heading = (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-olio-light">O forno</p>
      <h2 id="forno-title" className="display mt-4 max-w-[12ch] text-[clamp(2.6rem,6vw,5.4rem)] text-farinha">
        Onde a mágica pega fogo
      </h2>
    </>
  );

  if (reduced)
    return (
      <section ref={ref} id="forno" data-nav="dark" aria-labelledby="forno-title" className="relative overflow-hidden bg-forno text-farinha">
        <div className="relative h-[70svh]">{stage}</div>
        <div className="mx-auto max-w-[1600px] px-[var(--gutter)] py-20">
          {heading}
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {beats.map((b) => (
              <li key={b.title}>
                <p className="font-display text-[2.6rem] leading-none text-olio-light">{b.kicker}</p>
                <h3 className="mt-3 text-xl">{b.title}</h3>
                <p className="mt-2 leading-relaxed text-farinha/65">{b.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );

  return (
    <section ref={ref} id="forno" data-nav="dark" aria-labelledby="forno-title" className="relative bg-forno text-farinha" style={{ height: "340svh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {stage}
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-[var(--gutter)] pb-10 pt-[calc(var(--nav-h)+1rem)] md:justify-center md:pb-0">
          <div className="max-w-[34rem]">
            {heading}
            <ol className="mt-8 grid md:mt-12">
              {beats.map((b, i) => (
                <li
                  key={b.title}
                  aria-current={i === beat ? "step" : undefined}
                  className={`col-start-1 row-start-1 transition-[opacity,transform,translate,rotate,scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                    i === beat ? "translate-y-0 opacity-100" : i < beat ? "-translate-y-5 opacity-0" : "translate-y-5 opacity-0"
                  }`}
                >
                  <p className="font-display text-[clamp(2.8rem,5vw,4.4rem)] leading-none text-olio-light">{b.kicker}</p>
                  <h3 className="mt-3 text-xl md:text-2xl">{b.title}</h3>
                  <p className="mt-3 leading-relaxed text-farinha/70">{b.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {/* termômetro da cúpula */}
        <div aria-hidden className="absolute bottom-6 right-[var(--gutter)] pr-1 text-right max-md:top-[calc(var(--nav-h)+1rem)] max-md:bottom-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-farinha/50">Cúpula</p>
          <p className="font-display text-[clamp(1.8rem,3vw,2.6rem)] tabular-nums leading-none text-farinha">
            <span ref={temp}>180</span>
            <span className="text-olio-light"> °C</span>
          </p>
        </div>
      </div>
    </section>
  );
}
