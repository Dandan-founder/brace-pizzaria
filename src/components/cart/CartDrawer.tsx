"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { QtyControl } from "@/components/ui/QtyControl";
import { Button } from "@/components/ui/Button";
import { comboById, extraById } from "@/data/menu";
import { addProduct, itemCount, lineImage, lineName, lineTotal, removeWithUndo, subtotal, updateQty, useCart, type CartLine } from "@/lib/cart";
import { money, plural } from "@/lib/format";
import { navigateWithTransition } from "@/lib/transition";
import { closeCart, dismissToast, notifyRemoved, openCheckout, openCustomizer, setCartOpen, useUI } from "@/lib/ui";
import { SINGLE_PAGE } from "@/lib/preview";

export function CartDrawer() {
  const { cartOpen, toast } = useUI();
  const { lines } = useCart();
  const router = useRouter();
  const count = itemCount(lines);

  const checkout = () => {
    if (SINGLE_PAGE) return openCheckout();
    closeCart();
    navigateWithTransition(() => router.push("/pedido/"), "/pedido/");
  };

  return (
    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <AnimatePresence>
        {cartOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <m.div
                className="fixed inset-0 z-[65] bg-forno/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild aria-describedby={undefined}>
              <m.aside
                className="fixed inset-y-0 right-0 z-[66] flex w-full max-w-[30rem] flex-col bg-farinha text-forno on-light outline-none"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 38 }}
              >
                <header className="flex items-center justify-between border-b border-forno/10 px-6 py-5">
                  <div>
                    <Dialog.Title className="font-display text-[2rem] leading-none">Seu pedido</Dialog.Title>
                    <p className="mt-1.5 text-sm text-cenere">{count ? plural(count, "item", "itens") : "Nenhum item ainda"}</p>
                  </div>
                  <Dialog.Close className="grid h-11 w-11 cursor-pointer place-items-center rounded-full hover:bg-forno/8" aria-label="Fechar pedido">
                    <X className="h-5 w-5" aria-hidden />
                  </Dialog.Close>
                </header>

                {lines.length === 0 ? (
                  <>
                    <UndoBar toast={toast} />
                    <EmptyCart />
                  </>
                ) : (
                  <>
                    <UndoBar toast={toast} />
                    <ul className="flex-1 overflow-y-auto overscroll-contain px-6">
                      <AnimatePresence initial={false}>
                        {lines.map((l) => (
                          <CartRow key={l.key} line={l} />
                        ))}
                      </AnimatePresence>
                    </ul>
                    <footer className="border-t border-forno/10 bg-farinha-2 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-cenere">Subtotal</span>
                        <m.span key={subtotal(lines)} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[1.8rem] tabular-nums">
                          {money(subtotal(lines))}
                        </m.span>
                      </div>
                      <p className="mt-1 text-sm text-cenere">Entrega ou retirada você escolhe no próximo passo.</p>
                      <Button size="lg" className="mt-5 w-full" onClick={checkout}>
                        Finalizar pedido
                      </Button>
                    </footer>
                  </>
                )}
              </m.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function CartRow({ line: l }: { line: CartLine }) {
  const img = lineImage(l);
  const name = lineName(l);
  const details: string[] =
    l.kind === "combo"
      ? []
      : [...l.extras.map((e) => `+ ${extraById[e].name}`), ...l.removed.map((r) => `sem ${r}`), ...(l.note ? [`“${l.note}”`] : [])];
  const comboText = l.kind === "combo" ? comboById[l.comboId].pitch : null;

  return (
    <m.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, x: 40 }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="flex gap-4 border-b border-forno/10 py-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-farinha-3">
          {img && <Picture name={img} alt="" sizes="64px" className="block h-full w-full" imgClassName="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[1.35rem] leading-tight">{name}</h3>
            <span className="shrink-0 pt-0.5 tabular-nums">{money(lineTotal(l))}</span>
          </div>
          {comboText && <p className="mt-1 text-sm text-cenere">{comboText}</p>}
          {details.length > 0 && <p className="mt-1 break-words text-sm text-cenere">{details.join(" · ")}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <QtyControl value={l.qty} onChange={(v) => (v <= 0 ? removeWithUndo(l.key, notifyRemoved) : updateQty(l.key, v))} label={name} tone="light" removable />
            {l.kind === "product" && (
              <button
                type="button"
                onClick={() => openCustomizer(l.productId, l.key)}
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm text-cenere hover:bg-forno/8 hover:text-forno"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Editar<span className="sr-only"> {name}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </m.li>
  );
}

/** "Removido · Desfazer" dentro da gaveta (fora dela o modal bloquearia o clique e o leitor de tela). */
function UndoBar({ toast }: { toast: ReturnType<typeof useUI>["toast"] }) {
  return (
    <div aria-live="polite" className="px-6">
      <AnimatePresence initial={false}>
        {toast?.undo && (
          <m.div
            key={toast.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-forno px-4 py-2.5 text-sm text-farinha">
              <span className="min-w-0 truncate">{toast.title}</span>
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  dismissToast();
                }}
                className="h-9 shrink-0 cursor-pointer rounded-full px-3 font-medium text-olio-light underline-offset-4 hover:underline"
              >
                Desfazer
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-6 pb-16">
      <p className="font-display text-[2.2rem] leading-tight">Seu pedido está esperando a primeira pizza.</p>
      <p className="mt-3 text-cenere">Comece pela Margherita, a mais pedida da casa, ou veja o cardápio inteiro.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            addProduct("margherita");
          }}
        >
          Adicionar Margherita
        </Button>
        <Link href={SINGLE_PAGE ? "#cardapio" : "/#cardapio"} onClick={closeCart} className="inline-flex h-12 items-center rounded-full border border-forno/25 px-6 hover:border-forno">
          Ver cardápio
        </Link>
      </div>
    </div>
  );
}
