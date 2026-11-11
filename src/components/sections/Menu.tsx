"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, m, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Leaf, Plus, SlidersHorizontal } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";
import { categories, products, type CategoryId, type Product } from "@/data/menu";
import { addProduct } from "@/lib/cart";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/fly";
import { notifyAdded, openCustomizer } from "@/lib/ui";

export function Menu() {
  const [tab, setTab] = useState<CategoryId>("rosse");
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Prévia da foto que segue o cursor (só em telas com mouse), com mola para não parecer "colada"
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 28, mass: 0.6 });
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = listRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const preview = hovered ? products.find((p) => p.id === hovered)?.image : undefined;

  return (
    <Chapter id="cardapio" theme="dark" aria-labelledby="cardapio-title" className="grain py-24 md:py-36">
      <Wrap>
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 id="cardapio-title" data-split className="display text-[clamp(3.2rem,9vw,8.5rem)] md:col-span-7">
            Cardápio
          </h2>
          <p data-reveal className="prose-measure text-farinha/70 md:col-span-5 md:pb-4">
            Todas as pizzas têm 30 cm, massa de 72 horas e saem do forno em 90 segundos. Personalize à vontade: tire o que não
            gosta, acrescente o que faltar.
          </p>
        </div>

        <Tabs.Root value={tab} onValueChange={(v) => setTab(v as CategoryId)} className="mt-14 md:mt-20">
          <Tabs.List
            aria-label="Categorias do cardápio"
            className="-mx-[var(--gutter)] flex gap-1 overflow-x-auto border-b border-farinha/12 px-[var(--gutter)] [scrollbar-width:none]"
            data-reveal
          >
            {categories.map((c) => (
              <Tabs.Trigger
                key={c.id}
                value={c.id}
                className="relative shrink-0 cursor-pointer px-4 pb-4 pt-2 font-display text-[1.6rem] text-farinha/45 transition-colors duration-200 hover:text-farinha/80 data-[state=active]:text-farinha md:px-6 md:text-[2rem]"
              >
                {c.name}
                {tab === c.id && (
                  <m.span layoutId="menu-tab-underline" className="absolute inset-x-3 -bottom-px h-[2px] bg-olio md:inset-x-5" />
                )}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {categories.map((c) => (
            <Tabs.Content key={c.id} value={c.id} className="rounded-sm outline-none">
              <p className="mt-6 text-sm text-farinha/55">{c.note}</p>
              <div ref={listRef} className="relative mt-4" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
                <m.ul
                  key={c.id}
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.045 } }, hidden: {} }}
                >
                  {products
                    .filter((p) => p.category === c.id)
                    .map((p) => (
                      <MenuRow key={p.id} product={p} onHover={setHovered} />
                    ))}
                </m.ul>

                {/* Prévia flutuante (decorativa, só com mouse) */}
                <AnimatePresence>
                  {preview && (
                    <m.div
                      key="preview"
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-0 z-20 hidden w-56 [@media(hover:hover)_and_(pointer:fine)]:block lg:w-64"
                      style={{ x, y, translateX: "-50%", translateY: "-115%" }}
                      initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <m.div
                          key={preview}
                          initial={{ opacity: 0, rotate: -25 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="aspect-square overflow-hidden rounded-full shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)] ring-1 ring-olio/50"
                        >
                          <Picture name={preview} alt="" sizes="256px" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                        </m.div>
                      </AnimatePresence>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Wrap>
    </Chapter>
  );
}

function MenuRow({ product: p, onHover }: { product: Product; onHover: (id: string | null) => void }) {
  const addRef = useRef<HTMLButtonElement>(null);
  const add = () => {
    addProduct(p.id);
    flyToCart(addRef.current, p.image);
    notifyAdded(`${p.name} adicionada ao pedido`, p.image);
  };
  return (
    <m.li
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } },
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(p.image ? p.id : null)}
      className="group relative grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b border-farinha/10 py-6 md:grid-cols-[1fr_auto_auto] md:gap-x-10 md:py-7"
    >
      {/* Miniatura só no celular (no desktop a prévia segue o mouse) */}
      {p.image ? (
        <Picture
          name={p.image}
          alt=""
          sizes="64px"
          className="row-span-2 block h-16 w-16 overflow-hidden rounded-full md:hidden"
          imgClassName="h-full w-full object-cover"
        />
      ) : (
        <span className="row-span-2 block h-16 w-16 md:hidden" aria-hidden />
      )}
      <div className="min-w-0">
        <h3 translate="no" className="flex items-baseline gap-3 font-display text-[1.65rem] leading-tight transition-colors duration-300 group-hover:text-olio-light md:text-[2.4rem]">
          {p.name}
          {p.vegetarian && (
            <span className="inline-flex translate-y-[-2px] items-center text-olio" title="Vegetariana">
              <Leaf className="h-4 w-4" aria-hidden />
              <span className="sr-only">Vegetariana</span>
            </span>
          )}
        </h3>
        <p className="mt-1.5 max-w-[56ch] text-[0.95rem] leading-relaxed text-farinha/60">{p.description}</p>
      </div>
      <p className="col-start-2 font-display text-[1.35rem] tabular-nums text-farinha md:col-start-auto md:text-[1.7rem]">
        {money(p.price)}
      </p>
      <div className="col-start-2 flex items-center gap-2 md:col-start-auto">
        {p.customizable && (
          <button
            type="button"
            onClick={(e) => openCustomizer(p.id, undefined, e.currentTarget.getBoundingClientRect())}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-farinha/20 px-4 text-sm transition-colors duration-200 hover:border-farinha/60"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Personalizar
            <span className="sr-only">{p.name}</span>
          </button>
        )}
        <button
          ref={addRef}
          type="button"
          onClick={add}
          className="group/add inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-brasa pl-3.5 pr-5 text-sm font-medium text-farinha transition-[background-color,transform,translate,rotate,scale] duration-200 hover:bg-pomodoro active:scale-[0.96]"
        >
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" aria-hidden />
          Adicionar
          <span className="sr-only">{p.name} ao pedido</span>
        </button>
      </div>
    </m.li>
  );
}
