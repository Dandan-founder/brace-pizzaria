# Brace — brand.md

> Marca fictícia criada para demonstração. Nome, endereço, telefone, preços e história são exemplos
> e estão centralizados em `src/data/site.ts` e `src/data/menu.ts` para troca rápida.

## Quem somos

**Brace** ("brasa", em italiano) é uma pizzaria napolitana de forno a lenha. A massa fermenta
devagar, o forno trabalha quente e o cardápio é curto de propósito.

- **O que vendemos:** pizza napolitana de fermentação longa, para comer no salão, retirar ou receber em casa.
- **Para quem:** quem leva comida a sério sem cerimônia — jantares a dois, mesas de amigos, pedidos de sexta à noite.
- **Promessa:** poucos ingredientes, escolhidos com cuidado, e tempo — muito tempo — na massa.

## Voz

| Somos | Não somos |
|---|---|
| Calorosos e diretos | Formais ou pomposos |
| Específicos ("72 horas de fermentação") | Vagos ("a melhor pizza da cidade") |
| Confiantes em poucas palavras | Exagerados ou cheios de pontos de exclamação |
| Italianos nos nomes, brasileiros na conversa | Caricatos ("mamma mia!") |

Regras de texto:
- Frases curtas, voz ativa, sentence case. Nada de CAIXA ALTA em rótulos.
- Nomes das pizzas em italiano; descrições em português.
- Botões dizem exatamente o que acontece: "Adicionar ao pedido", "Enviar pedido pelo WhatsApp".
- Sem prêmios, números de clientes ou avaliações inventadas.

## Ativos

- Logo: `src/components/brand/Logo.tsx` (palavra "Brace" em Bodoni Moda + brasa em ouro).
- Fotos: Unsplash (licença gratuita), lista em `CREDITS.md`.
- Ilustrações: ingredientes em traço dourado, `src/components/decor/IngredientArt.tsx`.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `forno` (preto) | `#0E0C0A` | fundo dos capítulos escuros, texto principal no claro |
| `brasa` (vermelho profundo) | `#8E1B1B` | ações principais, capítulo de ofertas |
| `pomodoro` (vermelho vivo) | `#B3261E` | hover/ativo das ações |
| `farinha` (creme quente) | `#F3E9D7` | fundo dos capítulos claros, texto no escuro |
| `olio` (dourado sutil) | `#B8913F` | detalhes, traços, ilustrações — nunca texto pequeno no creme |
| `cenere` (cinza de lenha) | `#3A332D` | texto secundário no claro |

## Tipografia

- **Bodoni Moda** (display): criada a partir dos tipos de Giambattista Bodoni, de Parma. Títulos grandes, alto contraste, sem itálico de destaque em palavras soltas.
- **Hanken Grotesk** (texto e interface): neutra, legível, boa em tamanhos pequenos.
