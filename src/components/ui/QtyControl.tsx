"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  tone?: "dark" | "light";
  /** Quando o mínimo é 1 e permite remover, o botão "−" vira lixeira em 1. */
  removable?: boolean;
};

/** Controle de quantidade com número que rola para cima/baixo conforme muda (micro-interactions). */
export function QtyControl({ value, onChange, min = 1, max = 20, label, tone = "dark", removable }: Props) {
  const ring = tone === "dark" ? "border-farinha/20" : "border-forno/20";
  const btn =
    "grid h-10 w-10 place-items-center rounded-full transition-colors duration-150 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed " +
    (tone === "dark" ? "hover:bg-farinha/10" : "hover:bg-forno/8");
  const showTrash = removable && value <= 1;
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center rounded-full border ${ring}`}>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={!removable && value <= min}
        aria-label={showTrash ? `Remover ${label}` : `Diminuir quantidade de ${label}`}
      >
        {showTrash ? <Trash2 className="h-4 w-4" aria-hidden /> : <Minus className="h-4 w-4" aria-hidden />}
      </button>
      <span className="relative grid h-10 w-8 place-items-center overflow-hidden tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={value}
            initial={{ y: "-80%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "80%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
          >
            {value}
          </m.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
