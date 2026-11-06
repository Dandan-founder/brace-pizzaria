import { comboById, extraById, productById } from "@/data/menu";
import { site } from "@/data/site";
import { linePrice, lineTotal, subtotal, type CartLine, type Fulfillment } from "./cart";
import { money } from "./format";

export type PaymentMethod = "pix" | "cartao" | "dinheiro";

export const paymentLabels: Record<PaymentMethod, string> = {
  pix: "Pix na entrega/retirada",
  cartao: "Cartão na maquininha",
  dinheiro: "Dinheiro",
};

export type OrderDetails = {
  name: string;
  phone: string;
  fulfillment: Fulfillment;
  address?: { street: string; number: string; district: string; complement: string; reference: string };
  payment: PaymentMethod;
  changeFor?: string;
  notes: string;
};

export const deliveryFee = (f: Fulfillment) => (f === "delivery" ? site.delivery.fee : 0);

export function orderTotal(lines: CartLine[], f: Fulfillment) {
  return subtotal(lines) + deliveryFee(f);
}

/** Monta a mensagem do pedido em texto (formatação do WhatsApp: *negrito*, _itálico_). */
export function buildOrderMessage(lines: CartLine[], d: OrderDetails) {
  const out: string[] = [];
  out.push(`*Novo pedido — ${site.legalName}*`, "");

  for (const l of lines) {
    if (l.kind === "combo") {
      const c = comboById[l.comboId];
      out.push(`${l.qty}x *${c.name}* — ${money(lineTotal(l))}`);
      for (const i of c.items) out.push(`   · ${i.qty}x ${productById[i.productId].name}`);
    } else {
      const p = productById[l.productId];
      out.push(`${l.qty}x *${p.name}* — ${money(lineTotal(l))}`);
      if (l.qty > 1) out.push(`   _${money(linePrice(l))} cada_`);
      for (const id of l.extras) out.push(`   + ${extraById[id].name} (${money(extraById[id].price)})`);
      for (const r of l.removed) out.push(`   − sem ${r}`);
      if (l.note) out.push(`   Obs.: ${l.note}`);
    }
  }

  const fee = deliveryFee(d.fulfillment);
  out.push("", `Subtotal: ${money(subtotal(lines))}`);
  if (d.fulfillment === "delivery") out.push(`Taxa de entrega: ${money(fee)}`);
  out.push(`*Total: ${money(orderTotal(lines, d.fulfillment))}*`, "");

  if (d.fulfillment === "delivery" && d.address) {
    const a = d.address;
    out.push("*Entrega*", `${a.street}, ${a.number}${a.complement ? ` — ${a.complement}` : ""}`, a.district);
    if (a.reference) out.push(`Referência: ${a.reference}`);
  } else {
    out.push("*Retirada no balcão*", `${site.address.street} — ${site.address.district}`);
  }
  out.push("");
  out.push(`Pagamento: ${paymentLabels[d.payment]}${d.payment === "dinheiro" && d.changeFor ? ` (troco para ${d.changeFor})` : ""}`);
  out.push(`Nome: ${d.name}`, `Telefone: ${d.phone}`);
  if (d.notes) out.push(`Observações: ${d.notes}`);
  return out.join("\n");
}

export const whatsappUrl = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const whatsappHello = () =>
  whatsappUrl(`Olá! Vim pelo site da ${site.name} e gostaria de falar com vocês.`);
