"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";
import { products, type Product } from "@/data/menu";
import { addProduct } from "@/lib/cart";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/fly";
import { gsap, MQ } from "@/lib/gsap";
import { notifyAdded, openCustomizer } from "@/lib/ui";

const best = products.filter((p) => p.bestSeller).sort((a, b) => a.bestSeller! - b.bestSeller!);

export function BestSellers() {
  return (
    <Chapter
      id="mais-pedidas"
      theme="light"
      aria-labelledby="mais-pedidas-title"
      className="overflow-hidden bg-farinha-2 py-24 md:py-40"
      onAnimate={(mm, el) =>
        mm.add(MQ.motion, () => {
          // As pizzas giram conforme a rolagem, cada uma num sentido (pizzas animadas sem custo extra)
          el.querySelectorAll<HTMLElement>("[data-disc]").forEach((d, i) =>
            gsap.fromTo(
              d,
              { rotation: i % 2 ? 40 : -40 },
              { rotation: i % 2 ? -40 : 40, ease: "none", scrollTrigger: { trigger: d, start: "top bottom", end: "bottom top", scrub: 0.8 } },
            ),
          );
        })
      }
    >
      <Wrap>
        <h2 id="mais-pedidas-title" data-split className="display max-w-[14ch] text-[clamp(2.8rem,7vw,6.5rem)]">
          As três que mais saem do forno
        </h2>

        <ol className="mt-16 grid gap-20 md:mt-24 md:grid-cols-12 md:gap-x-10 md:gap-y-28">
          {best.map((p, i) => (
            <BestItem key={p.id} product={p} index={i} />
          ))}
        </ol>
      </Wrap>
    </Chapter>
  );
}

const layouts = [
  "md:col-span-7 md:row-span-2", // 1º: grande, à esquerda
  "md:col-span-5 md:col-start-8", // 2º: direita, em cima
  "md:col-span-5 md:col-start-8", // 3º: direita, embaixo
];

function BestItem({ product: p, index }: { product: Product; index: number }) {
  const btn = useRef<HTMLButtonElement>(null);
  const big = index === 0;
  return (
    <li className={`group relative ${layouts[index]}`}>
      <div className={`relative mx-auto ${big ? "w-[min(100%,40rem)]" : "w-[min(78%,22rem)]"}`}>
        <span
          aria-hidden
          className="absolute -left-1 -top-10 z-10 font-display text-[clamp(6rem,14vw,12rem)] leading-none text-transparent [-webkit-text-stroke:1.2px_var(--olio)] xl:-left-10"
        >
          {index + 1}
        </span>
        <div data-reveal className="relative aspect-square">
          <div className="absolute inset-[4%] translate-y-[4%] rounded-full bg-forno/35 blur-2xl" aria-hidden />
          <div data-disc className="relative h-full w-full">
            <Picture
              name={p.image!}
              alt={`Pizza ${p.name} vista de cima`}
              sizes={big ? "(min-width: 768px) 40vw, 90vw" : "(min-width: 768px) 24vw, 70vw"}
              className="block h-full w-full overflow-hidden rounded-full ring-1 ring-forno/10"
              imgClassName="h-full w-full scale-[1.02] object-cover transition-transform duration-700 ease-[var(--ease-brasa)] group-hover:scale-[1.08]"
            />
          </div>
        </div>
      </div>
      <div data-reveal className={`mx-auto mt-8 ${big ? "max-w-[34rem]" : "max-w-[22rem]"}`}>
        <p className="text-sm text-cenere">{index === 0 ? "A mais pedida da casa" : `${index + 1}ª mais pedida`}</p>
        <h3 translate="no" className={`mt-1 font-display leading-[1.02] ${big ? "text-[clamp(2.4rem,4.5vw,3.8rem)]" : "text-[2.1rem]"}`}>{p.name}</h3>
        <p className="mt-3 text-cenere">{p.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="font-display text-[1.7rem] tabular-nums">{money(p.price)}</span>
          <button
            ref={btn}
            type="button"
            onClick={() => {
              addProduct(p.id);
              flyToCart(btn.current, p.image);
              notifyAdded(`${p.name} adicionada ao pedido`, p.image);
            }}
            className="group/add inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-brasa pl-3.5 pr-5 text-sm font-medium text-farinha transition-[background-color,transform] duration-200 hover:bg-pomodoro active:scale-[0.96]"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" aria-hidden />
            Adicionar ao pedido
            <span className="sr-only">: {p.name}</span>
          </button>
          <button
            type="button"
            onClick={(e) => openCustomizer(p.id, undefined, e.currentTarget.getBoundingClientRect())}
            className="h-11 cursor-pointer rounded-full px-2 text-sm underline decoration-forno/30 underline-offset-4 transition-colors hover:decoration-forno"
          >
            Personalizar<span className="sr-only"> {p.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
