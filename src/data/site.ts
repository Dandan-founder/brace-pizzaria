/**
 * Dados do negócio.
 *
 * ⚠️  TUDO AQUI É EXEMPLO (marca fictícia). Antes de publicar de verdade, troque:
 *   - whatsapp: número que recebe os pedidos (formato internacional, só dígitos)
 *   - address / mapQuery: endereço real
 *   - hours: horários reais
 *   - social: perfis reais
 *   - url: domínio final (usado no SEO)
 * Depois mude `isDemo` para false — isso remove o aviso de demonstração do rodapé e do checkout.
 */
export const site = {
  isDemo: true,
  name: "Brace",
  legalName: "Brace Pizzaria Napoletana",
  url: "https://brace-pizzaria.example.com",
  description:
    "Pizza napolitana de fermentação longa, assada em 90 segundos no forno a lenha. Peça para entrega ou retirada na Vila Madalena, São Paulo.",
  whatsapp: "5511900000000",
  phoneDisplay: "(11) 90000-0000",
  email: "ola@brace-pizzaria.example.com",
  address: {
    street: "Rua Harmonia, 000",
    district: "Vila Madalena",
    city: "São Paulo",
    state: "SP",
    zip: "05435-000",
    country: "BR",
  },
  mapQuery: "Rua Harmonia, Vila Madalena, São Paulo",
  timezone: "America/Sao_Paulo",
  /** 0 = domingo … 6 = sábado. `null` = fechado. Horários no fuso de `timezone`. */
  hours: [
    { open: "12:00", close: "23:00" }, // domingo
    null, // segunda — fechado
    { open: "18:30", close: "23:00" },
    { open: "18:30", close: "23:00" },
    { open: "18:30", close: "23:30" },
    { open: "18:30", close: "23:59" },
    { open: "12:00", close: "23:59" },
  ] as ({ open: string; close: string } | null)[],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],
  delivery: {
    fee: 9.9,
    etaMinutes: [40, 55] as [number, number],
    pickupMinutes: 25,
  },
} as const;

export const weekdayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
