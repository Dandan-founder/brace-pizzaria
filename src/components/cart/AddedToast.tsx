"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, X } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { dismissToast, openCart, useUI } from "@/lib/ui";

/** Confirmação curta e calorosa ao adicionar um item (interfaces-that-feel: celebrar pequenas vitórias). */
export function AddedToast() {
  const { toast, cartOpen } = useUI();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[80] flex justify-center px-4 md:bottom-8 md:justify-end md:px-8">
      <AnimatePresence>
        {toast && !cartOpen && (
          <m.div
            key={toast.id}
            role="status"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-farinha p-2.5 pr-3 text-forno shadow-[0_24px_60px_-18px_rgba(0,0,0,.65)]"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brasa">
              {toast.image && <Picture name={toast.image} alt="" sizes="48px" className="block h-full w-full" imgClassName="h-full w-full object-cover" />}
              {!toast.undo && <m.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 500, damping: 22 }}
                className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-brasa text-farinha ring-2 ring-farinha"
              >
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </m.span>}
            </div>
            <p className="min-w-0 flex-1 text-[0.92rem] font-medium leading-snug">{toast.title}</p>
            {toast.undo ? (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  dismissToast();
                }}
                className="h-10 shrink-0 cursor-pointer rounded-full bg-forno px-4 text-sm font-medium text-farinha transition-colors hover:bg-brasa"
              >
                Desfazer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  dismissToast();
                  openCart();
                }}
                className="h-10 shrink-0 cursor-pointer rounded-full bg-forno px-4 text-sm font-medium text-farinha transition-colors hover:bg-brasa"
              >
                Ver pedido
              </button>
            )}
            <button type="button" onClick={dismissToast} className="grid h-10 w-8 shrink-0 cursor-pointer place-items-center text-forno/50 hover:text-forno" aria-label="Fechar aviso">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
