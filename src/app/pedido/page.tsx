import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  description: "Revise seu pedido, escolha entrega ou retirada e envie pelo WhatsApp.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/pedido/" },
};

export default function PedidoPage() {
  return (
    <>
      <main id="conteudo" className="min-h-[100svh] bg-farinha text-forno on-light" data-nav="light">
        <Checkout />
      </main>
      <Footer home={false} />
    </>
  );
}
