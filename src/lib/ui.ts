"use client";

import { useSyncExternalStore } from "react";

/** Estado de interface compartilhado: gaveta do carrinho, personalizador e aviso de "adicionado". */
type Customizing = { productId: string; editKey?: string; origin?: DOMRect | null };
type Toast = { id: number; title: string; image?: string; undo?: () => void };

type UIState = {
  cartOpen: boolean;
  customizing: Customizing | null;
  toast: Toast | null;
  /** Incrementa a cada adição para o botão do carrinho reagir. */
  bump: number;
};

let state: UIState = { cartOpen: false, customizing: null, toast: null, bump: 0 };
const listeners = new Set<() => void>();
const set = (patch: Partial<UIState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const server: UIState = { cartOpen: false, customizing: null, toast: null, bump: 0 };

export function useUI() {
  return useSyncExternalStore(subscribe, () => state, () => server);
}

export const openCart = () => set({ cartOpen: true });
export const closeCart = () => set({ cartOpen: false });
export const setCartOpen = (cartOpen: boolean) => set({ cartOpen });

export const openCustomizer = (productId: string, editKey?: string, origin?: DOMRect | null) =>
  set({ customizing: { productId, editKey, origin }, cartOpen: editKey ? false : state.cartOpen });
export const closeCustomizer = () => set({ customizing: null });

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function notifyAdded(title: string, image?: string) {
  clearTimeout(toastTimer);
  set({ toast: { id: Date.now(), title, image }, bump: state.bump + 1 });
  toastTimer = setTimeout(() => set({ toast: null }), 3200);
}
export const dismissToast = () => set({ toast: null });

/** Aviso de item removido com opção de desfazer (ação destrutiva nunca é definitiva na hora). */
export function notifyRemoved(title: string, undo: () => void, image?: string) {
  clearTimeout(toastTimer);
  set({ toast: { id: Date.now(), title, image, undo } });
  toastTimer = setTimeout(() => set({ toast: null }), 5000);
}
