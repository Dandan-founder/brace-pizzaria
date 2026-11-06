const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** R$ 59,00 */
export const money = (v: number) => brl.format(v);

/** Pluraliza de forma simples: plural(2, "item", "itens") → "2 itens" */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
