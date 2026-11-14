/**
 * Rolagem lisa em celular e tablet.
 *
 * Em telas de toque, a rolagem é feita pelo próprio navegador (fora do JavaScript). Qualquer animação
 * presa à rolagem (`scrub`: parallax, fotos que crescem, faixas que andam) é recalculada pelo JavaScript
 * logo depois, e chega sempre um pouco atrasada: o elemento parece tremer ou travar, mesmo a 60 fps.
 *
 * Por isso, em aparelhos sem mouse, toda animação com `scrub` simplesmente não é criada: o elemento fica
 * na posição natural e a rolagem fica 100% nativa. Entradas de uma vez só (textos subindo, fotos se
 * revelando) continuam. Seções com `pin` não são tocadas (elas mudam o layout e são só de computador).
 */
type Vars = { scrollTrigger?: unknown } | undefined;

export const SCROLL_FX = "(hover: hover) and (pointer: fine)";
export const scrollFx = () => typeof window !== "undefined" && window.matchMedia(SCROLL_FX).matches;

// objeto "vazio" que aceita qualquer chamada encadeada (.to().fromTo().kill()...) sem fazer nada
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop: any = new Proxy(function () {}, {
  get: (_t, k) => (k === "then" ? undefined : k === "progress" || k === "duration" || k === "totalProgress" ? () => 0 : noop),
  apply: () => noop,
});

function isScrub(st: unknown) {
  if (!st || typeof st !== "object") return false;
  const s = st as { scrub?: unknown; pin?: unknown };
  return !!s.scrub && !s.pin;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function touchSafeScroll(gsap: any, ScrollTrigger: any) {
  if (typeof window === "undefined" || gsap.__touchSafe) return;
  gsap.__touchSafe = true;
  const skip = (v: Vars) => !scrollFx() && isScrub(v?.scrollTrigger);
  for (const m of ["to", "from", "fromTo"] as const) {
    const orig = gsap[m].bind(gsap);
    gsap[m] = (...a: unknown[]) => (skip(a[a.length - 1] as Vars) ? noop : orig(...a));
  }
  const tl = gsap.timeline.bind(gsap);
  gsap.timeline = (v?: Vars) => (skip(v) ? noop : tl(v));
  const create = ScrollTrigger.create.bind(ScrollTrigger);
  // repassa todos os argumentos: o GSAP chama create(vars, animação) ao ligar um gatilho a um tween/timeline
  ScrollTrigger.create = (v: unknown, ...rest: unknown[]) => (!scrollFx() && isScrub(v) ? noop : create(v, ...rest));
}
