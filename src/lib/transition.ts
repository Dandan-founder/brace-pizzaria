"use client";

/**
 * Navegação com View Transitions API (react-view-transitions): a página atual sai com fade
 * e a nova entra por uma cortina vinda de baixo (CSS em globals.css). Navegadores sem suporte
 * ou com movimento reduzido navegam normalmente.
 *
 * Durante a transição o navegador congela a pintura (requestAnimationFrame não roda), então
 * a espera usa setTimeout e termina quando o <main> da nova página substitui o antigo.
 */
export function navigateWithTransition(push: () => void, targetPath: string) {
  const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => unknown };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    push();
    return;
  }
  const norm = (p: string) => p.replace(/\/+$/, "") || "/";
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const oldMain = document.getElementById("conteudo");
        push();
        const started = performance.now();
        const check = () => {
          const swapped = document.getElementById("conteudo") !== oldMain;
          if ((swapped && norm(location.pathname) === norm(targetPath)) || performance.now() - started > 2500) resolve();
          else setTimeout(check, 16);
        };
        check();
      }),
  );
}
