/**
 * Rolagem lisa em celular e tablet, sem perder as animações.
 *
 * Em telas de toque, a rolagem é feita pelo próprio navegador (fora do JavaScript). Uma animação presa ao
 * dedo (`scrub`: parallax, fotos que crescem, faixas que andam) é recalculada pelo JavaScript logo depois e
 * chega sempre um pouco atrasada: o elemento parece tremer ou travar, mesmo a 60 fps.
 *
 * Por isso, em aparelhos sem mouse, cada animação com `scrub` vira uma animação de entrada: ela toca sozinha,
 * por tempo (~1,4 s, lisa), quando a seção aparece na tela. O movimento continua; só não fica preso ao dedo.
 * - Efeitos de saída do topo da página (ex.: o hero que some ao rolar) não fazem sentido como entrada: ficam parados.
 * - Seções com `pin` não são tocadas (mudam o layout e são só de computador).
 */
type ST = { trigger?: unknown; scrub?: unknown; pin?: unknown; start?: unknown; containerAnimation?: unknown };
type Vars = { scrollTrigger?: ST; paused?: boolean; [k: string]: unknown } | undefined;

export const SCROLL_FX = "(hover: hover) and (pointer: fine)";
export const scrollFx = () => typeof window !== "undefined" && window.matchMedia(SCROLL_FX).matches;

// objeto "vazio" que aceita qualquer chamada encadeada (.to().fromTo().kill()...) sem fazer nada
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop: any = new Proxy(function () {}, {
  get: (_t, k) => (k === "then" ? undefined : k === "progress" || k === "duration" || k === "totalProgress" ? () => 0 : noop),
  apply: () => noop,
});

const isScrub = (st: unknown): st is ST => !!st && typeof st === "object" && !!(st as ST).scrub && !(st as ST).pin;

function triggerEl(st: ST): Element | null {
  const t = st.trigger;
  if (t instanceof Element) return t;
  if (typeof t === "string") return document.querySelector(t);
  return null;
}

/** "top 85%" → mantém; qualquer outro início vira "top 88%" (quando a seção entra na tela). */
function enterStart(st: ST) {
  return typeof st.start === "string" && /^top \d+%$/.test(st.start) ? st.start : "top 88%";
}

/** Já está na primeira tela ao carregar? Então é efeito de saída (hero): não vira entrada. */
function isTopOfPage(el: Element | null) {
  if (!el) return true;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return top < window.innerHeight * 0.6;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function touchSafeScroll(gsap: any, ScrollTrigger: any) {
  if (typeof window === "undefined" || gsap.__touchSafe) return;
  gsap.__touchSafe = true;

  const create = ScrollTrigger.create.bind(ScrollTrigger);
  const to = gsap.to.bind(gsap);

  /** Toca a animação (pausada) uma vez quando o gatilho entra na tela, com desaceleração suave. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playOnEnter = (anim: any, st: ST) => {
    const el = triggerEl(st);
    create({
      trigger: el ?? st.trigger,
      start: enterStart(st),
      once: true,
      onEnter: () => to(anim, { progress: 1, duration: 1.4, ease: "power3.out", overwrite: true }),
    });
    return anim;
  };

  /** Decide o que fazer com uma animação de `scrub` no toque: null = deixar como está (computador ou sem scrub). */
  const plan = (v: Vars): "keep" | "drop" | "enter" => {
    if (scrollFx() || !v || !isScrub(v.scrollTrigger)) return "keep";
    const st = v.scrollTrigger;
    if (st.containerAnimation) return "drop"; // faz parte de um trilho horizontal (só computador)
    return isTopOfPage(triggerEl(st)) ? "drop" : "enter";
  };
  const asPaused = (v: Vars) => {
    const rest = { ...(v as object) } as Record<string, unknown>;
    delete rest.scrollTrigger;
    return { ...rest, paused: true, ease: "none" };
  };

  for (const m of ["to", "from", "fromTo"] as const) {
    const orig = gsap[m].bind(gsap);
    gsap[m] = (...a: unknown[]) => {
      const v = a[a.length - 1] as Vars;
      const p = plan(v);
      if (p === "keep") return orig(...a);
      if (p === "drop") return noop;
      const st = v!.scrollTrigger as ST;
      return playOnEnter(orig(...a.slice(0, -1), asPaused(v)), st);
    };
  }
  const tl = gsap.timeline.bind(gsap);
  gsap.timeline = (v?: Vars) => {
    const p = plan(v);
    if (p === "keep") return tl(v);
    if (p === "drop") return noop;
    return playOnEnter(tl(asPaused(v)), v!.scrollTrigger as ST);
  };
  // repassa todos os argumentos: o GSAP chama create(vars, animação) ao ligar um gatilho a um tween/timeline
  ScrollTrigger.create = (v: unknown, ...rest: unknown[]) => (!scrollFx() && isScrub(v) ? noop : create(v, ...rest));
}
