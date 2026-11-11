"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Checkout } from "./Checkout";
import { closeCheckout, useUI } from "@/lib/ui";

/**
 * Checkout por cima da página (modo página única, usado em prévias que não trocam de rota).
 * Mesmo conteúdo da página /pedido, entrando como uma cortina de baixo para cima.
 */
export function CheckoutOverlay() {
  const { checkoutOpen } = useUI();
  return (
    <Dialog.Root open={checkoutOpen} onOpenChange={(o) => !o && closeCheckout()}>
      <AnimatePresence>
        {checkoutOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Content forceMount asChild aria-describedby={undefined}>
              <m.div
                className="on-light fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-farinha text-forno outline-none"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Dialog.Title asChild>
                  <span className="sr-only">Finalizar pedido</span>
                </Dialog.Title>
                <div className="sticky top-0 z-10 border-b border-forno/10 bg-farinha pt-[env(safe-area-inset-top)]">
                  <div className="mx-auto flex h-[var(--nav-h)] max-w-[1400px] items-center justify-between px-[var(--gutter)]">
                    <Logo />
                    <Dialog.Close className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-forno/20 px-4 text-sm transition-colors hover:border-forno">
                      <X className="h-4 w-4" aria-hidden />
                      Voltar ao site
                    </Dialog.Close>
                  </div>
                </div>
                <div className="-mt-[var(--nav-h)]">
                  <Checkout onExit={(hash) => closeCheckout(hash)} />
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
