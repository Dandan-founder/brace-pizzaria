"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { itemCount, useCart } from "@/lib/cart";
import { openCart, useUI } from "@/lib/ui";
import { site } from "@/data/site";
import { navLinks } from "@/data/nav";
import { SINGLE_PAGE } from "@/lib/preview";


type Theme = "dark" | "light" | "red";

export function Nav() {
  const pathname = usePathname();
  const isHome = SINGLE_PAGE || pathname === "/";
  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const [theme, setTheme] = useState<Theme>("dark");
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const pinnedUntil = useRef(0);
  const lastInput = useRef(0);
  const { bump } = useUI();

  // Ao adicionar um item, a barra volta e fica visível: o "voo" pousa no carrinho e o cliente vê o contador mudar
  useEffect(() => {
    if (!bump) return;
    pinnedUntil.current = performance.now() + 3500;
    setHidden(false);
  }, [bump]);

  // Cor da barra acompanha o capítulo sob ela; some ao descer, volta ao subir
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setSolid(y > 40);
      const dy = y - lastY.current;
      if (Math.abs(dy) > 6) {
        const now = performance.now();
        const pinned = now < pinnedUntil.current;
        // Só esconde quando quem rolou foi a pessoa (roda, toque, teclado) — não em restauração
        // de scroll, ajustes de layout ou links de âncora
        const byUser = now - lastInput.current < 400;
        if (dy < 0 || !byUser || pinned) setHidden(false);
        else if (y > 640) setHidden(true);
        lastY.current = y;
      }
      const probe = 36;
      const sections = document.querySelectorAll<HTMLElement>("[data-nav]");
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          setTheme((s.dataset.nav as Theme) || "dark");
          break;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onInput = (e: Event) => {
      if (e instanceof KeyboardEvent && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "End", "Home"].includes(e.key)) return;
      lastInput.current = performance.now();
    };
    // Parte da posição atual (o navegador pode restaurar o scroll ao recarregar): a barra começa visível
    lastY.current = window.scrollY;
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchmove", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchmove", onInput);
      window.removeEventListener("keydown", onInput);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const palette: Record<Theme, string> = {
    dark: solid ? "bg-forno/92 text-farinha border-farinha/10" : "bg-transparent text-farinha border-transparent",
    light: "bg-farinha/95 text-forno border-forno/10",
    red: "bg-brasa/95 text-farinha border-farinha/15",
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-[6px] transition-[background-color,color,border-color,transform] duration-500 ease-[var(--ease-brasa)]",
          palette[theme],
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
        data-hero-nav
      >
        <nav aria-label="Principal" className="mx-auto mt-[env(safe-area-inset-top)] flex h-[var(--nav-h)] max-w-[1600px] items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href={SINGLE_PAGE ? "#inicio" : "/"} aria-label={`${site.name} — início`} className="rounded-sm text-[0.95rem]" data-hero-item>
            <Logo animated />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.id} data-hero-item>
                <a href={href(l.id)} className="group relative rounded-full px-3.5 py-2 text-[0.92rem] opacity-85 transition-opacity hover:opacity-100">
                  {l.label}
                  <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[var(--ease-brasa)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2" data-hero-item>
            <CartButton />
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger className="grid h-11 w-11 cursor-pointer place-items-center rounded-full lg:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" aria-hidden />
              </Dialog.Trigger>
              <AnimatePresence>
                {menuOpen && (
                  <Dialog.Portal forceMount>
                    <Dialog.Content forceMount asChild aria-describedby={undefined}>
                      <m.div
                        className="fixed inset-0 z-[60] flex flex-col bg-forno text-farinha grain"
                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        exit={{ clipPath: "inset(0 0 100% 0)" }}
                        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                      >
                        <Dialog.Title className="sr-only">Menu</Dialog.Title>
                        <div className="flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
                          <Logo />
                          <Dialog.Close className="grid h-11 w-11 cursor-pointer place-items-center rounded-full" aria-label="Fechar menu">
                            <X className="h-5 w-5" aria-hidden />
                          </Dialog.Close>
                        </div>
                        <ul className="flex flex-1 flex-col justify-center gap-1 px-[var(--gutter)]">
                          {navLinks.map((l, i) => (
                            <m.li
                              key={l.id}
                              initial={{ y: 40, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.18 + i * 0.05, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                            >
                              <a
                                href={href(l.id)}
                                onClick={() => setMenuOpen(false)}
                                className="display block py-2 text-[clamp(2.4rem,11vw,4rem)]"
                              >
                                {l.label}
                              </a>
                            </m.li>
                          ))}
                        </ul>
                        <p className="px-[var(--gutter)] pb-8 text-sm text-farinha/60">
                          {site.address.street} — {site.address.district}, {site.address.city}
                        </p>
                      </m.div>
                    </Dialog.Content>
                  </Dialog.Portal>
                )}
              </AnimatePresence>
            </Dialog.Root>
          </div>
        </nav>
      </header>
    </>
  );
}

function CartButton() {
  const { lines } = useCart();
  const { bump } = useUI();
  const count = itemCount(lines);
  const scope = useRef<HTMLButtonElement>(null);
  // Pulso no botão a cada item adicionado (Web Animations API nativa; não remonta o botão, preserva o foco)
  useEffect(() => {
    const el = scope.current;
    if (!bump || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: 0.3 }, { transform: "scale(.96)", offset: 0.65 }, { transform: "scale(1)" }],
      { duration: 500, delay: 550, easing: "cubic-bezier(.22,.61,.36,1)" },
    );
  }, [bump]);
  return (
    <button
      ref={scope}
      id="cart-button"
      type="button"
      onClick={openCart}
      className="relative flex h-11 cursor-pointer items-center gap-2 rounded-full border border-current/25 pl-3.5 pr-4 text-[0.92rem] transition-colors hover:border-current/60"
      aria-label={count ? `Abrir pedido, ${count} ${count === 1 ? "item" : "itens"}` : "Abrir pedido, vazio"}
    >
      <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
      <span className="hidden sm:inline">Pedido</span>
      <AnimatePresence initial={false}>
        {count > 0 && (
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="grid h-6 min-w-6 place-items-center rounded-full bg-brasa px-1.5 text-xs font-semibold tabular-nums text-farinha"
          >
            {count}
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
