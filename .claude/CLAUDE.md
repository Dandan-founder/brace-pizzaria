# Brace Pizzaria — instruções do projeto para o Claude

**Stack:** Next.js 15 (exportação estática) · React 19 · TypeScript · Tailwind 4 · GSAP + ScrollTrigger (sob demanda) · Motion (overlays) · React Three Fiber (forno 3D).
Leia o `README.md` antes de mudar algo: ele diz onde fica cada conteúdo editável.

## Estúdio (agentes e skills deste repositório)
Os agentes ficam em `.claude/agents/` e as skills em `.claude/skills/`. As skills foram copiadas das fontes
originais, com licença MIT/Apache, para o projeto funcionar em qualquer computador.
Skills deste projeto: `gsap-core`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`, `motion-framer`, `react-three-fiber`, `threejs-performance`, `threejs-fundamentals`, `frontend-design`, `webapp-testing`, `verification-before-completion`.

Quem edita o quê (um agente por arquivo; revisores só leem):

| Agente | Arquivos |
|---|---|
| senior-frontend | `src/app/**`, `src/components/{layout,sections,cart,checkout,ui,brand,decor}/**`, `src/lib/{cart,format,hours,seo,whatsapp,ui,preview}.ts` |
| motion-designer | GSAP: `src/lib/gsap.ts`, `src/lib/transition.ts`, `src/components/motion/**` |
| threejs-developer | `src/components/three/**` (forno 3D com 3 níveis, Ticker ~30 fps, vigia de fps em `FrameControl.tsx`) |
| creative-director, ui-ux-designer, performance-engineer, visual-qa | não editam; entregam brief, revisão ou medição |

## Regras de movimento (não negociáveis)
- Animar só `transform` (inclui `translate`/`scale`/`rotate` do Tailwind 4) e `opacity`. Nada de `width`, `height`,
  `top`/`left`, `padding`, `filter`, `clip-path` ou `background-position` em animação ou transição.
- No Tailwind 4, `translate-*`, `scale-*` e `rotate-*` usam as propriedades CSS próprias: a transição precisa
  listá-las (`transition-[transform,translate,rotate,scale]` ou `transition-transform`).
- Sem `backdrop-filter` em elementos fixos/sticky; use fundo sólido.
- Máscara/cortina: use uma "folha" que anda com transform, ou o par moldura + conteúdo em sentidos opostos.
- Animações contínuas pausam fora da tela; as abaixo da dobra são preparadas no ocioso.
- `prefers-reduced-motion`: tudo visível e parado.
- 3D: três níveis (completo, celular com dpr 1 sem bloom/transmission, imagem), vigia de fps que rebaixa,
  `frameloop="demand"` a ~30 fps, montar perto da tela, `dispose` ao desmontar.

## Antes de dizer "pronto"
```bash
npm run lint
npm run build
npx serve out -l 4173
NODE_PATH=$(npm root -g) npm run test:e2e
NODE_PATH=$(npm root -g) npm run test:a11y
```
E medir a rolagem no celular simulado com CPU 4x mais lenta: meta ~60 fps e ~0 quadros acima de 50 ms
(peça ao agente `performance-engineer`).
