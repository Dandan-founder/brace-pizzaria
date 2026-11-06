"use client";

import { gsap } from "./gsap";
import images from "@/data/images.json";

/**
 * "Voo" até o carrinho: um disco com a foto do item sai do botão clicado e cai em arco no
 * ícone do carrinho (feedback de que o item entrou no pedido). Pulado com movimento reduzido.
 */
const smallest = (name: string) => images[name as keyof typeof images]?.widths[0] ?? 400;

export function flyToCart(from: HTMLElement | null, image?: string) {
  if (!from || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-button");
  if (!target) return;
  const a = from.getBoundingClientRect();
  const r = target.getBoundingClientRect();
  // Se a barra estiver escondida (subiu ao rolar), mira onde o botão vai estar quando ela voltar
  const shift = r.bottom <= 0 ? (target.closest("header")?.getBoundingClientRect().height ?? 72) : 0;
  const b = { left: r.left, top: r.top + shift, width: r.width, height: r.height };
  const size = 56;
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  Object.assign(dot.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    zIndex: "90",
    pointerEvents: "none",
    background: image ? `center/cover url(/images/${image}-${smallest(image)}.webp), #8e1b1b` : "#8e1b1b",
    boxShadow: "0 0 0 2px #b8913f, 0 12px 30px -8px rgba(0,0,0,.6)",
  });
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  // Arco: x anda linear, y sobe primeiro e depois cai (ease diferentes = trajetória curva)
  const tl = gsap.timeline({ onComplete: () => dot.remove() });
  tl.fromTo(dot, { scale: 0.4 }, { scale: 1, duration: 0.18, ease: "back.out(2)" })
    .to(dot, { x: dx, duration: 0.7, ease: "power1.inOut" }, 0.12)
    .to(dot, { y: Math.min(dy, -80) - 60, duration: 0.32, ease: "power2.out" }, 0.12)
    .to(dot, { y: dy, duration: 0.38, ease: "power2.in" }, 0.44)
    .to(dot, { scale: 0.2, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.68);
}
