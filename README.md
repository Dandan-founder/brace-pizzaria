# Brace — Pizzaria Napoletana

Site premium e animado para uma pizzaria napolitana: hero cinematográfico, cardápio interativo,
carrinho completo com personalização e pedido enviado pelo WhatsApp.

> **Marca de demonstração.** "Brace", endereço, telefone, horários, preços e história são exemplos.
> Tudo que identifica o negócio fica em dois arquivos: [`src/data/site.ts`](src/data/site.ts) e
> [`src/data/menu.ts`](src/data/menu.ts). Veja [O que trocar antes de publicar](#o-que-trocar-antes-de-publicar).

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em out/
```

O resultado de `npm run build` (pasta `out/`) é HTML/CSS/JS estático: dá para hospedar em Vercel,
Netlify, Cloudflare Pages, GitHub Pages ou qualquer CDN. Não há servidor nem banco de dados.

## O que trocar antes de publicar

| O quê | Onde | Observação |
|---|---|---|
| Número do WhatsApp que recebe pedidos | `site.whatsapp` em `src/data/site.ts` | Formato internacional, só dígitos: `5511912345678` |
| Endereço, mapa, CEP | `site.address`, `site.mapQuery` | O mapa usa o embed público do Google Maps (sem chave) |
| Horários | `site.hours` | Fuso em `site.timezone`; o status "aberto/fechado" é calculado ao vivo |
| Taxa e prazos de entrega | `site.delivery` | |
| Redes sociais | `site.social` | Hoje apontam para a página inicial de cada rede |
| Domínio (SEO) | `site.url` | Usado em canonical, sitemap, Open Graph e dados estruturados |
| Cardápio, preços, adicionais, combos | `src/data/menu.ts` | |
| Aviso de demonstração | `site.isDemo = false` | Remove o aviso do rodapé e do checkout |
| Fotos | `assets-src/` → `node scripts/optimize-images.mjs` | Ver `CREDITS.md` |

## Como o pedido funciona (sem funcionalidade falsa)

1. O cliente monta o pedido (carrinho salvo no navegador, sobrevive a recarregar a página).
2. No checkout escolhe **entrega** (com endereço e taxa) ou **retirada**, informa nome, telefone e forma de pagamento.
3. Ao enviar, o site abre o WhatsApp (`wa.me`) com a mensagem do pedido já escrita: itens, adicionais,
   ingredientes retirados, observações, subtotal, taxa, total, endereço, pagamento e troco.
4. O cliente toca em enviar no WhatsApp; a pizzaria confirma por lá.

**Integrações que exigem credenciais reais do negócio (não implementadas de propósito):**

- **Pagamento online** (Pix automático, cartão): precisa de conta num gateway (Mercado Pago, Stripe, Pagar.me…)
  e de um backend para criar cobranças. Hoje o pagamento é feito na entrega/retirada.
- **Confirmação automática de pedido / painel da cozinha**: precisaria da API oficial do WhatsApp Business
  (Meta) ou de um backend. Hoje a confirmação é feita pela conversa no WhatsApp.
- **Cálculo de frete por distância**: precisaria de uma API de mapas com chave. Hoje a taxa é fixa.

## Stack

- **Next.js 15** (App Router, exportação estática) + **React 19** + **TypeScript**
- **Tailwind CSS 4** com tokens em três camadas (primitivo → semântico → componente) em `globals.css`
- **GSAP** (ScrollTrigger, SplitText) para a cena do hero, revelações por scroll, parallax e contadores
- **Motion** (via `LazyMotion`) para estados de React: carrinho, gaveta, personalizador, abas, avisos
- **Radix UI** (Dialog, Tabs, RadioGroup) para componentes acessíveis
- **lucide-react** para ícones

## Estrutura

```
src/
  app/                 layout (fontes, SEO, JSON-LD), página inicial, /pedido, sitemap, robots, ícone
  components/
    sections/          Hero, Story, Menu, BestSellers, Ingredients, Offers, Gallery, Location, Contact
    cart/              CartDrawer, Customizer, AddedToast
    checkout/          Checkout (formulário + resumo + envio pelo WhatsApp)
    layout/            Nav, Footer, Providers
    motion/            Chapter (revelações, parallax e títulos por capítulo)
    brand/ decor/ ui/  Logo, ilustrações de ingredientes, Picture, Button, QtyControl, OpenStatus
  data/                site.ts (negócio), menu.ts (cardápio), images.json (gerado)
  lib/                 cart (store), whatsapp (mensagem), hours (aberto/fechado), gsap, transition, fly
docs/                  brand.md (voz e identidade) e MOTION.md (regras de movimento)
scripts/               otimização de imagens, recorte da pizza do hero, imagem de compartilhamento
```

## Animação, acessibilidade e desempenho

- **Uma cena memorável** (o hero) e o resto disciplinado: revelações por máscara, parallax ≤ 5%,
  nada de sequestrar o scroll. Regras em [`docs/MOTION.md`](docs/MOTION.md).
- **`prefers-reduced-motion`**: tudo aparece no estado final, sem giro nem parallax. O conteúdo nunca
  depende do JavaScript para ficar visível.
- **Botão de pausa** para as animações contínuas do hero (WCAG 2.2.2).
- Celular: menos ingredientes e brasas, sem parallax de mouse; animações fora da tela ficam pausadas.
- Imagens AVIF/WebP responsivas com dimensões reservadas (CLS ≈ 0); entrada da pizza do hero em CSS
  (aparece na primeira pintura).

Resultados medidos (build de produção servido com compressão):

| | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Lighthouse desktop | 98 | 100 | 100 | 100 |
| Lighthouse celular (4G simulado, CPU 4× mais lenta) | 76–84 | 100 | 100 | 100 |

- LCP real medido no celular emulado (CPU 4×, 4G): **~1,9 s**. O Lighthouse estima 3,7–4,1 s porque
  simula a rede e a CPU; o gargalo restante é a execução de JavaScript (GSAP + React).
- axe-core (WCAG 2.1 AA): **0 violações** na página inicial e no checkout, desktop e celular.

## Testes

Os testes de ponta a ponta (Playwright) cobrem: pausa das animações, adicionar pelo cardápio, personalizar
(retirar ingrediente, adicionais, quantidade, preço), combos, gaveta (quantidade, remover, desfazer, Esc),
persistência ao recarregar, checkout (validação com foco no primeiro erro, entrega × retirada, máscara de
telefone, troco) e o conteúdo exato da mensagem do WhatsApp.

## Créditos

Fotos do Unsplash e fontes do Google Fonts: ver [`CREDITS.md`](CREDITS.md).
