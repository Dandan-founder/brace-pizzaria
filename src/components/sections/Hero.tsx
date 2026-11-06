"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { ButtonLink } from "@/components/ui/Button";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { Embers } from "@/components/decor/Embers";
import { Basil, Chili, Garlic, OliveBranch, Tomato, Wheat } from "@/components/decor/IngredientArt";
import { gsap, MQ, ScrollTrigger, SplitText, useGsap } from "@/lib/gsap";

/** Ingredientes em volta da pizza: posição/tamanho em % do palco da pizza. */
const ingredients = [
  { Art: Basil, x: 12, y: -9, size: 14, rot: -32, depth: 1.5, mobile: true },
  { Art: Tomato, x: 80, y: -4, size: 12, rot: 14, depth: 1.1, mobile: true },
  { Art: OliveBranch, x: 64, y: 90, size: 15, rot: -8, depth: 0.8, mobile: false },
  { Art: Wheat, x: 30, y: 94, size: 13, rot: 24, depth: 1.3, mobile: false },
  { Art: Chili, x: -4, y: 78, size: 10, rot: 36, depth: 0.9, mobile: true },
  { Art: Garlic, x: 92, y: 62, size: 10, rot: -12, depth: 1.2, mobile: true },
  { Art: Basil, x: -6, y: 14, size: 8, rot: 70, depth: 0.6, mobile: false },
];

const PAUSE_KEY = "brace:hero-paused";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const loopsRef = useRef<gsap.core.Tween[]>([]);
  const offscreen = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  // Lembra a escolha de pausar as animações (WCAG 2.2.2: movimento contínuo precisa poder parar)
  useEffect(() => {
    try {
      if (localStorage.getItem(PAUSE_KEY) === "1") setPaused(true);
    } catch {
      /* sem armazenamento */
    }
  }, []);
  useEffect(() => {
    pausedRef.current = paused;
    loopsRef.current.forEach((t) => (paused || offscreen.current ? t.pause() : t.resume()));
  }, [paused]);
  const togglePause = () => {
    setPaused((p) => {
      try {
        localStorage.setItem(PAUSE_KEY, p ? "0" : "1");
      } catch {
        /* sem armazenamento */
      }
      return !p;
    });
  };

  useGsap(root, (mm, el) => {
    const q = gsap.utils.selector(el);

    mm.add(MQ.motion, () => {
      const spin = q("[data-pizza-spin]")[0];
      const ings = q("[data-ing]");
      const floats = q("[data-float]");
      const title = q("[data-hero-title]")[0];

      // Logo da barra: o arco do forno se desenha e a brasa acende (logo-animation)
      const arch = document.querySelectorAll("[data-logo-arch], [data-logo-base]");
      const ember = document.querySelector("[data-logo-ember]");
      gsap.fromTo(arch, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.15, stagger: 0.2 });
      if (ember) gsap.fromTo(ember, { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, duration: 0.6, ease: "back.out(2.4)", delay: 0.9 });

      const split = SplitText.create(title, { type: "lines", mask: "lines", autoSplit: false });
      gsap.set(el.querySelectorAll("[data-hero-hide]"), { visibility: "visible" });

      // Sequência de abertura (~2,2 s): fundo → pizza → título → frase → ações → ingredientes
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo("[data-hero-bg]", { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1.04, duration: 2.4, ease: "power2.out" }, 0)
        .fromTo("[data-heat]", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2 }, 0.2)
        .from(split.lines, { yPercent: 110, duration: 1.15, stagger: 0.1 }, 0.75)
        .fromTo("[data-hero-copy]", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.2)
        .fromTo("[data-hero-cta] > *", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 1.35)
        .fromTo("[data-hero-meta]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 1.7)
        // Ingredientes saem do centro da pizza em arco e "assentam" (follow through)
        .fromTo(
          ings,
          { autoAlpha: 0, scale: 0.4, xPercent: (i: number) => (50 - ingredients[i].x) * 4, yPercent: (i: number) => (50 - ingredients[i].y) * 4, rotation: (i: number) => ingredients[i].rot - 90 },
          { autoAlpha: 1, scale: 1, xPercent: 0, yPercent: 0, rotation: (i: number) => ingredients[i].rot, duration: 1.6, stagger: 0.07, ease: "back.out(1.15)" },
          1.0,
        );

      // Giro contínuo da pizza (é um giro físico: aqui o linear é correto)
      const spinTween = gsap.to(spin, { rotation: 360, duration: 90, repeat: -1, ease: "none" });
      // Ingredientes flutuam devagar, cada um no seu ritmo
      const floatTweens = floats.map((f, i) =>
        gsap.to(f, { y: i % 2 ? 10 : -10, rotation: i % 2 ? 5 : -5, duration: 3.6 + (i % 4) * 0.7, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2 }),
      );
      const heat = gsap.to("[data-heat]", { scale: 1.08, opacity: 0.8, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
      const bgDrift = gsap.to("[data-hero-bg] img", { xPercent: -2.5, yPercent: -1.5, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Pausa tudo quando o hero sai da tela (economia de bateria/CPU)
      const loops = [spinTween, heat, bgDrift, ...floatTweens];
      loopsRef.current = loops;
      if (pausedRef.current) loops.forEach((t) => t.pause());
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onLeave: () => {
          offscreen.current = true;
          loops.forEach((t) => t.pause());
        },
        onEnterBack: () => {
          offscreen.current = false;
          if (!pausedRef.current) loops.forEach((t) => t.resume());
        },
      });

      // Ao rolar: a pizza gira mais um quarto de volta e recua; o texto sobe um pouco mais rápido
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 } })
        .to("[data-pizza-scroll]", { rotation: 90, scale: 0.86, yPercent: -8, ease: "none" }, 0)
        .to("[data-hero-text]", { yPercent: -18, autoAlpha: 0.15, ease: "none" }, 0)
        .to("[data-ing-layer]", { scale: 1.12, autoAlpha: 0.4, ease: "none" }, 0);

      return () => {
        split.revert();
        loopsRef.current = [];
      };
    });

    // Parallax do mouse (só desktop com mouse): camadas em profundidades diferentes
    mm.add(MQ.finePointer, () => {
      const layers = q("[data-depth]").map((d) => ({
        depth: Number((d as HTMLElement).dataset.depth),
        x: gsap.quickTo(d, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(d, "y", { duration: 1.2, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * 26 * l.depth);
          l.y(ny * 20 * l.depth);
        });
      };
      el.addEventListener("pointermove", onMove);
      return () => el.removeEventListener("pointermove", onMove);
    });
  });

  return (
    <section
      ref={root}
      id="inicio"
      data-nav="dark"
      aria-labelledby="hero-title"
      className="grain relative isolate min-h-[100svh] overflow-hidden bg-forno"
      data-paused={paused ? "" : undefined}
    >
      {/* Fundo: bancada enfarinhada + vinheta + calor do forno */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div data-hero-bg data-hero-hide className="absolute inset-0 overflow-hidden opacity-100">
          <Picture
            name="flour"
            alt=""
            sizes="100vw"
            className="block h-full w-full"
            imgClassName="h-[106%] w-[106%] max-w-none object-cover opacity-[.42]"
            placeholder={false}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_45%,transparent_0%,rgba(14,12,10,.55)_55%,#0e0c0a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forno via-forno/70 to-transparent md:h-1/3" />
      </div>
      <Embers />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1600px] flex-col px-[var(--gutter)] pb-8 pt-[var(--nav-h)] md:justify-center md:pb-16 md:pt-[calc(var(--nav-h)+2rem)]">
        {/* Palco da pizza */}
        <div
          className="pointer-events-none relative -mt-2 aspect-square w-[min(94vw,62svh)] self-center sm:w-[min(78vw,60svh)] md:absolute md:right-[-6vw] md:top-[calc(50%+var(--nav-h)/2)] md:mt-0 md:w-[min(52vw,88vh)] md:-translate-y-1/2"
          aria-hidden
        >
          <div data-heat data-hero-hide className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(179,38,30,.38)_0%,rgba(142,27,27,.16)_38%,transparent_68%)]" />
          <div data-depth="0.45" className="absolute inset-0">
            <div data-pizza-enter className="absolute inset-0">
              {/* Sombra fixa (não gira) que respira junto com o calor */}
              <div className="absolute inset-[6%] translate-x-[3%] translate-y-[5%] rounded-full bg-black/70 blur-[38px]" />
              <div data-pizza-scroll className="absolute inset-0">
                <div data-pizza-spin className="absolute inset-0 will-change-transform">
                  <Picture
                    name="hero-pizza"
                    alt=""
                    sizes="(min-width: 768px) 52vw, 94vw"
                    priority
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          <div data-ing-layer className="absolute inset-0">
            {ingredients.map(({ Art, x, y, size, rot, depth, mobile }, i) => (
              <div
                key={i}
                data-ing
                data-hero-hide
                className={`absolute text-olio ${mobile ? "" : "max-md:hidden"}`}
                style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, transform: `rotate(${rot}deg)` }}
              >
                <div data-depth={depth}>
                  <div data-float>
                    <Art className="h-auto w-full drop-shadow-[0_6px_14px_rgba(0,0,0,.6)]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Texto */}
        <div data-hero-text className="relative z-10 mt-auto max-w-[44rem] md:mt-0 md:max-w-[min(52vw,46rem)]">
          <h1
            id="hero-title"
            data-hero-title
            className="display text-[clamp(3.2rem,14vw,5.2rem)] font-medium text-farinha md:text-[clamp(4.6rem,8vw,9rem)]"
          >
            Fogo, farinha e tempo.
          </h1>
          <p data-hero-copy data-hero-hide className="prose-measure mt-4 max-w-[34rem] text-base leading-relaxed text-farinha/80 md:mt-8 md:text-lg">
            Massa de fermentação natural por 72 horas, poucos ingredientes escolhidos a dedo e 90 segundos de forno a lenha.
            Pizza napolitana como em Nápoles, aqui na Vila Madalena.
          </p>
          <div data-hero-cta className="mt-6 flex flex-wrap items-center gap-3 md:mt-10">
            <ButtonLink href="#cardapio" size="lg" data-hero-hide>
              Peça agora
            </ButtonLink>
            <ButtonLink href="#onde-estamos" variant="outline" size="lg" data-hero-hide>
              Como chegar
            </ButtonLink>
          </div>
          <div data-hero-meta data-hero-hide className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-farinha/65 md:mt-8">
            <OpenStatus />
            <p>Entrega em 40 a 55 minutos na região</p>
          </div>
        </div>
      </div>

      {/* Indicador de rolagem */}
      <div aria-hidden className="absolute bottom-6 left-1/2 hidden h-12 w-px -translate-x-1/2 overflow-hidden bg-farinha/15 md:block">
        <span data-scroll-cue className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2.2s_cubic-bezier(.65,0,.35,1)_infinite] bg-olio-light" />
      </div>
      {/* Pausar/retomar as animações contínuas (some com movimento reduzido, quando já não há loops) */}
      <button
        type="button"
        onClick={togglePause}
        aria-pressed={paused}
        className="absolute bottom-5 right-[var(--gutter)] z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-farinha/20 text-farinha/70 transition-colors hover:border-farinha/60 hover:text-farinha motion-reduce:hidden"
        aria-label={paused ? "Retomar animações" : "Pausar animações"}
        title={paused ? "Retomar animações" : "Pausar animações"}
      >
        {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
      </button>
      <style>{`@keyframes scroll-cue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
