"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";
import { combos, comboFullPrice, productById, type Combo } from "@/data/menu";
import { addCombo } from "@/lib/cart";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/fly";
import { nowInShop } from "@/lib/hours";
import { notifyAdded } from "@/lib/ui";
import { weekdayNames } from "@/data/site";

/** Composições diferentes por oferta (banner-design): nada de três cartões idênticos. */
const looks: Record<string, { box: string; tone: "dark" | "red" | "photo" }> = {
  "notte-a-due": { box: "md:col-span-7", tone: "dark" },
  martedi: { box: "md:col-span-5", tone: "red" },
  tavolata: { box: "md:col-span-12", tone: "photo" },
};

export function Offers() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(nowInShop().day), []);

  return (
    <Chapter id="ofertas" theme="light" aria-labelledby="ofertas-title" className="py-24 md:py-40">
      <Wrap>
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="ofertas-title" data-split className="display text-[clamp(2.8rem,7vw,6.5rem)] md:col-span-7">
            Ofertas da casa
          </h2>
          <p data-reveal className="prose-measure text-cenere md:col-span-5 md:pb-3">
            Combinações pensadas para a mesa. O preço já vem com o desconto aplicado no pedido.
          </p>
        </div>
        <ul className="mt-14 grid gap-5 md:mt-20 md:grid-cols-12 md:gap-6">
          {combos.map((c) => (
            <OfferCard key={c.id} combo={c} today={today} />
          ))}
        </ul>
      </Wrap>
    </Chapter>
  );
}

function OfferCard({ combo: c, today }: { combo: Combo; today: number | null }) {
  const btn = useRef<HTMLButtonElement>(null);
  const look = looks[c.id] ?? { box: "md:col-span-6", tone: "dark" as const };
  const full = comboFullPrice(c);
  const restricted = !!c.days?.length;
  const availableToday = !restricted || (today !== null && c.days!.includes(today));
  const dayNames = c.days?.map((d) => weekdayNames[d].toLowerCase()).join(" e ");

  const add = () => {
    addCombo(c.id);
    flyToCart(btn.current, c.image);
    notifyAdded(`${c.name} adicionado ao pedido`, c.image);
  };

  // Texto secundário mais claro sobre o vermelho para manter contraste AA (4.5:1)
  const muted = look.tone === "red" ? "text-farinha/90" : "text-farinha/60";
  const toneCls = {
    dark: "bg-forno text-farinha",
    red: "bg-brasa text-farinha",
    photo: "bg-forno text-farinha",
  }[look.tone];

  return (
    <li data-reveal className={`group relative isolate overflow-hidden ${toneCls} ${look.box}`}>
      {look.tone === "photo" && (
        <>
          <div className="absolute inset-0 -z-10">
            <Picture
              name={c.image}
              alt=""
              sizes="100vw"
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-brasa)] group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forno via-forno/80 to-forno/10" />
        </>
      )}

      <div className={`relative flex h-full flex-col p-7 md:p-12 ${look.tone === "photo" ? "md:min-h-[30rem] md:max-w-[44rem]" : "min-h-[26rem]"}`}>
        {look.tone === "dark" && (
          <div className="pointer-events-none absolute -right-16 -top-10 hidden w-[46%] lg:block" aria-hidden>
            <div className="aspect-square overflow-hidden rounded-full ring-1 ring-olio/40 transition-transform duration-[1200ms] ease-[var(--ease-brasa)] group-hover:rotate-6">
              <Picture name={c.image} alt="" sizes="30vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <p className={`text-sm ${look.tone === "red" ? "text-farinha/75" : "text-olio-light"}`}>
          {restricted ? `Só às ${dayNames}s` : "Todos os dias"}
        </p>
        <h3 className="mt-3 max-w-[12ch] font-display text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[0.95]">{c.name}</h3>
        <p className="mt-4 max-w-[34ch] text-farinha/75">{c.pitch}</p>

        <ul className={`mt-5 space-y-1 text-sm ${muted}`}>
          {c.items.map((i) => (
            <li key={i.productId}>
              {i.qty}× {productById[i.productId].name}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-10">
          <p className="leading-none">
            <span className={`block text-sm ${muted}`}>
              <span className="sr-only">Preço normal: </span>
              <s>{money(full)}</s>
            </span>
            <span className="mt-1 block font-display text-[clamp(2.4rem,4vw,3.4rem)] tabular-nums">
              <span className="sr-only">Preço da oferta: </span>
              {money(c.price)}
            </span>
          </p>
          <div className="flex flex-col items-end gap-2">
            <button
              ref={btn}
              type="button"
              onClick={add}
              disabled={!availableToday}
              aria-describedby={!availableToday ? `${c.id}-indisponivel` : undefined}
              className={`group/add inline-flex h-12 cursor-pointer items-center gap-2 rounded-full pl-4 pr-6 text-[0.95rem] font-medium transition-[background-color,transform,opacity] duration-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 ${
                look.tone === "red" ? "bg-farinha text-brasa hover:bg-white" : "bg-olio text-forno hover:bg-olio-light"
              }`}
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" aria-hidden />
              Adicionar combo
              <span className="sr-only">{c.name}</span>
            </button>
            {!availableToday && today !== null && (
              <p id={`${c.id}-indisponivel`} className={`text-xs ${look.tone === "red" ? "text-farinha" : "text-farinha/70"}`}>
                Disponível às {dayNames}s. Hoje é {weekdayNames[today].toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
