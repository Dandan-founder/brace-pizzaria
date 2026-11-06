# Brace — MOTION.md

O movimento da Brace imita o forno: calor que sobe devagar, brasa que respira, a pá que gira a pizza.
Nada pula, nada pisca. Uma única cena memorável (o hero) e o resto em silêncio disciplinado.

## Princípios (Disney → Brace)

| Princípio | Como aparece |
|---|---|
| Staging | Um elemento por vez no hero: pizza → título → frase → ação. |
| Slow in / slow out | Nunca `linear` em UI. Exceção: rotação contínua da pizza (é um giro físico). |
| Follow through | Ingredientes chegam depois da pizza e "assentam" com leve overshoot. |
| Arc | Ingredientes entram em arco, não em linha reta. |
| Secondary action | A sombra da pizza respira enquanto ela gira. |
| Timing | Rápido para resposta (UI), lento para cena (hero). |

## Curvas

| Nome | Valor | Uso |
|---|---|---|
| `ease-brasa` | `cubic-bezier(.22,.61,.36,1)` | entradas de seção e máscaras |
| `ease-ui` | `cubic-bezier(.4,0,.2,1)` | estados de controle |
| `ease-out-soft` | `cubic-bezier(0,0,.2,1)` | elementos entrando |
| `ease-in-soft` | `cubic-bezier(.4,0,1,1)` | elementos saindo |
| GSAP | `expo.out`, `power3.out` | timelines do hero |
| Mola (Motion) | `stiffness 420, damping 32` | contador do carrinho, botões |

## Durações

| Tipo | Duração |
|---|---|
| Feedback de controle (hover, toque) | 160–220 ms |
| Microinteração (adicionar, quantidade) | 200–320 ms |
| Revelação de seção | 600–760 ms, stagger 50–70 ms |
| Transição de página | 450–600 ms |
| Sequência do hero | ~2,2 s no total |

## Regras

1. Só `transform` e `opacity` (e `clip-path` em máscaras). Nada de animar largura/altura/top.
2. Parallax ≤ 5% da altura do elemento; nunca sequestrar o scroll.
3. Celular: sem parallax de mouse, ingredientes reduzidos, giro da pizza via CSS.
4. `prefers-reduced-motion: reduce`: tudo aparece no estado final, sem giro, sem parallax; feedback de estado continua (cor/texto), sem deslocamento.
5. Movimento que responde a uma ação (abrir, adicionar, confirmar) mostra o que mudou.
6. Animações fora da tela pausam; timelines são limpas ao desmontar (`gsap.context().revert()`).
