import { site } from "@/data/site";

/** Dia da semana e minutos desde 00:00 no fuso da pizzaria, independente do fuso do visitante. */
export function nowInShop(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
  return { day, minutes };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; nextLabel: string | null };

export function openStatus(date = new Date()): OpenStatus {
  const { day, minutes } = nowInShop(date);
  const today = site.hours[day];
  if (today && minutes >= toMin(today.open) && minutes < toMin(today.close)) {
    return { open: true, closesAt: today.close === "23:59" ? "meia-noite" : today.close.replace(":", "h") };
  }
  // Próxima abertura: hoje mais tarde ou nos próximos dias
  if (today && minutes < toMin(today.open)) return { open: false, nextLabel: `hoje às ${today.open.replace(":", "h")}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = site.hours[d];
    if (h) {
      const label = i === 1 ? "amanhã" : ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][d];
      return { open: false, nextLabel: `${label} às ${h.open.replace(":", "h")}` };
    }
  }
  return { open: false, nextLabel: null };
}

export const formatRange = (h: { open: string; close: string }) =>
  `${h.open.replace(":", "h")} – ${h.close === "23:59" ? "0h" : h.close.replace(":", "h")}`;
