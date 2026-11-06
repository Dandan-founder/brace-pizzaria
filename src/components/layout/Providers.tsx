"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import { Nav } from "./Nav";
import { AddedToast } from "@/components/cart/AddedToast";

// Carregados só quando necessários: não pesam no primeiro carregamento
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const Customizer = dynamic(() => import("@/components/cart/Customizer").then((m) => m.Customizer), { ssr: false });

const loadFeatures = () => import("@/lib/motion-features").then((r) => r.default);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": Motion troca deslocamentos por fades quando o sistema pede menos movimento
    // LazyMotion: os recursos de animação (incluindo layout) carregam depois, fora do primeiro carregamento
    <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 420, damping: 36 }}>
      <Nav />
      {children}
      <CartDrawer />
      <Customizer />
      <AddedToast />
    </MotionConfig>
    </LazyMotion>
  );
}
