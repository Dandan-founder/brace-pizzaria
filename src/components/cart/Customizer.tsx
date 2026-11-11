"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { QtyControl } from "@/components/ui/QtyControl";
import { extraById, extras, productById } from "@/data/menu";
import { addProduct, replaceProductLine, useCart, type ProductLine } from "@/lib/cart";
import { money } from "@/lib/format";
import { flyToCart } from "@/lib/fly";
import { closeCustomizer, notifyAdded, openCart, useUI } from "@/lib/ui";

export function Customizer() {
  const { customizing } = useUI();
  return (
    <Dialog.Root open={!!customizing} onOpenChange={(o) => !o && closeCustomizer()}>
      <AnimatePresence>
        {customizing && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <m.div className="fixed inset-0 z-[67] bg-forno/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Panel key={customizing.productId + (customizing.editKey ?? "")} productId={customizing.productId} editKey={customizing.editKey} />
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Panel({ productId, editKey }: { productId: string; editKey?: string }) {
  const p = productById[productId];
  const { lines } = useCart();
  const editing = editKey ? (lines.find((l) => l.key === editKey) as ProductLine | undefined) : undefined;

  const [chosen, setChosen] = useState<string[]>(editing?.extras ?? []);
  const [removed, setRemoved] = useState<string[]>(editing?.removed ?? []);
  const [note, setNote] = useState(editing?.note ?? "");
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const submitRef = useRef<HTMLButtonElement>(null);

  const unit = useMemo(() => p.price + chosen.reduce((s, id) => s + extraById[id].price, 0), [p.price, chosen]);
  const total = unit * qty;

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    const opts = { qty, extras: chosen, removed, note };
    if (editing) {
      replaceProductLine(editing.key, p.id, opts);
      closeCustomizer();
      openCart();
      return;
    }
    addProduct(p.id, opts);
    flyToCart(submitRef.current, p.image);
    closeCustomizer();
    notifyAdded(`${qty > 1 ? `${qty}× ` : ""}${p.name} adicionada ao pedido`, p.image);
  };

  return (
    <Dialog.Content forceMount asChild aria-describedby="custom-desc">
      <m.div
        className="fixed inset-x-0 bottom-0 z-[68] flex max-h-[92svh] flex-col overflow-hidden rounded-t-3xl bg-farinha text-forno on-light outline-none md:inset-auto md:left-1/2 md:top-1/2 md:grid md:h-[min(88vh,52rem)] md:max-h-none md:w-[min(64rem,92vw)] md:grid-rows-[minmax(0,1fr)] md:-translate-x-1/2 md:-translate-y-1/2 md:grid-cols-[0.9fr_1.1fr] md:rounded-none"
        initial={{ y: "8%", opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "6%", opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
      >
        {/* Foto */}
        <div className="relative hidden bg-forno md:block">
          {p.image ? (
            <m.div
              className="absolute inset-0"
              initial={{ rotate: -20, scale: 1.1 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <Picture name={p.image} alt={`Pizza ${p.name}`} sizes="40vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
            </m.div>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-10 text-center font-display text-[3rem] leading-none text-olio">{p.name}</div>
          )}
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 md:px-9 md:pt-9">
            <div>
              <Dialog.Title className="font-display text-[2.3rem] leading-none md:text-[2.8rem]">{p.name}</Dialog.Title>
              <p id="custom-desc" className="mt-2 max-w-[44ch] text-[0.95rem] text-cenere">
                {p.description}
              </p>
            </div>
            <Dialog.Close className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-forno/8" aria-label="Fechar">
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-6 pb-6 md:px-9">
            {!!p.removable?.length && (
              <fieldset>
                <legend className="font-medium">Tirar algum ingrediente?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.removable.map((r) => {
                    const on = removed.includes(r);
                    return (
                      <Chip key={r} on={on} onClick={() => toggle(removed, setRemoved, r)} label={`Sem ${r}`} />
                    );
                  })}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="font-medium">Adicionais</legend>
              <p className="text-sm text-cenere">Escolha quantos quiser.</p>
              <ul className="mt-3 divide-y divide-forno/10 border-y border-forno/10">
                {extras.map((e) => {
                  const on = chosen.includes(e.id);
                  return (
                    <li key={e.id}>
                      <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2.5">
                        <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(chosen, setChosen, e.id)} />
                        <span
                          aria-hidden
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-brasa peer-focus-visible:ring-offset-2 ${
                            on ? "border-brasa bg-brasa text-farinha" : "border-forno/30"
                          }`}
                        >
                          <AnimatePresence>
                            {on && (
                              <m.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 26 }}>
                                <Check className="h-4 w-4" strokeWidth={3} />
                              </m.span>
                            )}
                          </AnimatePresence>
                        </span>
                        <span className="flex-1">{e.name}</span>
                        <span className="tabular-nums text-cenere">+ {money(e.price)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            <div>
              <label htmlFor="obs" className="font-medium">
                Alguma observação?
              </label>
              <textarea
                id="obs"
                value={note}
                maxLength={140}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ex.: bem assada, cortar em 6 pedaços…"
                autoComplete="off"
                className="mt-2 w-full resize-none rounded-xl border border-forno/20 bg-white/60 px-4 py-3 text-base placeholder:text-cenere-light focus:border-brasa focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-cenere">{note.length}/140</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-forno/10 bg-farinha-2 px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-9 md:pb-4">
            <QtyControl value={qty} onChange={setQty} label={p.name} tone="light" />
            <button
              ref={submitRef}
              type="button"
              onClick={submit}
              className="flex h-12 flex-1 cursor-pointer items-center justify-between gap-3 rounded-full bg-brasa px-6 font-medium text-farinha transition-[background-color,transform,translate,rotate,scale] duration-200 hover:bg-pomodoro active:scale-[0.98]"
            >
              <span>{editing ? "Salvar" : "Adicionar"}<span className="max-[380px]:hidden">{editing ? " alterações" : " ao pedido"}</span></span>
              <AnimatedMoney value={total} />
            </button>
          </div>
        </div>
      </m.div>
    </Dialog.Content>
  );
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-150 ${
        on ? "border-forno bg-forno text-farinha" : "border-forno/25 hover:border-forno"
      }`}
    >
      {on && <Check className="h-3.5 w-3.5" aria-hidden />}
      {label}
    </button>
  );
}

/** Preço que "rola" até o novo valor em vez de trocar de repente. */
function AnimatedMoney({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 220, damping: 30 });
  const text = useTransform(spring, (v) => money(Math.round(v * 100) / 100));
  useEffect(() => spring.set(value), [spring, value]);
  return (
    <>
      <m.span aria-hidden className="tabular-nums">
        {text}
      </m.span>
      <span className="sr-only">{money(value)}</span>
    </>
  );
}
