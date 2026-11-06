"use client";

import { useSyncExternalStore } from "react";
import { comboById, extraById, productById } from "@/data/menu";

/**
 * Carrinho como store externa (useSyncExternalStore): só os componentes que leem o carrinho
 * re-renderizam, e o estado sobrevive a recarregar a página (localStorage).
 */

export type ProductLine = {
  key: string;
  kind: "product";
  productId: string;
  qty: number;
  extras: string[];
  removed: string[];
  note: string;
};
export type ComboLine = { key: string; kind: "combo"; comboId: string; qty: number };
export type CartLine = ProductLine | ComboLine;

export type Fulfillment = "delivery" | "pickup";

type State = { lines: CartLine[] };

const STORAGE_KEY = "brace:cart:v1";
const MAX_QTY = 20;
const EMPTY: State = { lines: [] };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as State;
    // Descarta linhas de produtos que não existem mais no cardápio
    state = {
      lines: (parsed.lines ?? []).filter((l) =>
        l.kind === "product" ? !!productById[l.productId] : !!comboById[l.comboId],
      ),
    };
  } catch {
    state = EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível (aba anônima etc.): o carrinho segue funcionando em memória */
  }
}

function set(next: State) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  // Sincroniza entre abas
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ───────── Preços ───────── */

export function linePrice(l: CartLine): number {
  if (l.kind === "combo") return comboById[l.comboId].price;
  const base = productById[l.productId].price;
  return base + l.extras.reduce((s, id) => s + (extraById[id]?.price ?? 0), 0);
}

export const lineTotal = (l: CartLine) => linePrice(l) * l.qty;
export const subtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + lineTotal(l), 0);
export const itemCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.qty, 0);

export function lineName(l: CartLine) {
  return l.kind === "combo" ? comboById[l.comboId].name : productById[l.productId].name;
}

export function lineImage(l: CartLine) {
  return l.kind === "combo" ? comboById[l.comboId].image : productById[l.productId].image;
}

/* ───────── Ações ───────── */

function productKey(productId: string, extras: string[], removed: string[], note: string) {
  return ["p", productId, [...extras].sort().join("+"), [...removed].sort().join("+"), note.trim()].join("|");
}

export function addProduct(
  productId: string,
  opts: { qty?: number; extras?: string[]; removed?: string[]; note?: string } = {},
) {
  const { qty = 1, extras = [], removed = [], note = "" } = opts;
  const key = productKey(productId, extras, removed, note);
  const existing = state.lines.find((l) => l.key === key);
  if (existing) {
    updateQty(key, existing.qty + qty);
    return key;
  }
  const line: ProductLine = { key, kind: "product", productId, qty: Math.min(qty, MAX_QTY), extras, removed, note: note.trim() };
  set({ lines: [...state.lines, line] });
  return key;
}

export function addCombo(comboId: string) {
  const key = `c|${comboId}`;
  const existing = state.lines.find((l) => l.key === key);
  if (existing) updateQty(key, existing.qty + 1);
  else set({ lines: [...state.lines, { key, kind: "combo", comboId, qty: 1 }] });
  return key;
}

export function updateQty(key: string, qty: number) {
  if (qty <= 0) {
    removeLine(key);
    return;
  }
  set({ lines: state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)) });
}

/** Substitui a configuração de uma linha (edição pelo personalizador). */
export function replaceProductLine(
  oldKey: string,
  productId: string,
  opts: { qty: number; extras: string[]; removed: string[]; note: string },
) {
  const without = state.lines.filter((l) => l.key !== oldKey);
  state = { lines: without };
  addProduct(productId, opts);
}

export function removeLine(key: string) {
  const index = state.lines.findIndex((l) => l.key === key);
  if (index < 0) return null;
  const line = state.lines[index];
  set({ lines: state.lines.filter((l) => l.key !== key) });
  return { line, index };
}

/** Desfaz uma remoção, devolvendo o item à mesma posição. */
export function restoreLine(line: CartLine, index: number) {
  if (state.lines.some((l) => l.key === line.key)) return;
  const lines = [...state.lines];
  lines.splice(Math.min(index, lines.length), 0, line);
  set({ lines });
}

/** Remove com aviso "Desfazer". */
export function removeWithUndo(key: string, notify: (title: string, undo: () => void, image?: string) => void) {
  const removed = removeLine(key);
  if (!removed) return;
  notify(`Removido do pedido: ${lineName(removed.line)}`, () => restoreLine(removed.line, removed.index), lineImage(removed.line));
}

export function clearCart() {
  set(EMPTY);
}

export const MAX_LINE_QTY = MAX_QTY;
