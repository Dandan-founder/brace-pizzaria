"use client";

import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";
import { Basil, Chili, Tomato, Wheat } from "@/components/decor/IngredientArt";
import { gsap, MQ } from "@/lib/gsap";

/** Etapas do processo: aqui a numeração é legítima, porque é uma sequência real. */
const steps = [
  { value: 4, unit: "", label: "ingredientes na massa", detail: "Farinha tipo 00, água, sal e fermento natural. Só isso.", Art: Wheat },
  { value: 72, unit: "h", label: "de fermentação", detail: "A frio, devagar. A massa fica leve e fácil de digerir.", Art: Basil },
  { value: 485, unit: "°C", label: "no forno a lenha", detail: "Lenha de eucalipto de reflorestamento, acesa desde a tarde.", Art: Chili },
  { value: 90, unit: "s", label: "de forno", detail: "O tempo de a borda crescer e manchar, e o centro ficar macio.", Art: Tomato },
];

const pantry = [
  { image: "tomatoes", name: "Tomate San Marzano", origin: "Campânia, Itália", alt: "Tomates maduros no ramo sobre fundo escuro" },
  { image: "oil", name: "Azeite extravirgem", origin: "Puglia, Itália", alt: "Garrafa de azeite com azeitonas ao lado" },
  { image: "parmesan", name: "Parmigiano 24 meses", origin: "Emília-Romanha, Itália", alt: "Pedaço de queijo parmesão sobre pedra escura" },
  { image: "bread", name: "Farinha tipo 00", origin: "Moída em Nápoles", alt: "Pão rústico de fermentação natural polvilhado de farinha" },
];

export function Ingredients() {
  return (
    <Chapter
      id="ingredientes"
      theme="dark"
      aria-labelledby="ingredientes-title"
      className="grain overflow-hidden py-24 md:py-40"
      onAnimate={(mm, el) => {
        mm.add(MQ.motion, () => {
          // Contadores sobem quando entram na tela
          el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
            const end = Number(n.dataset.count);
            const obj = { v: 0 };
            gsap.to(obj, {
              v: end,
              duration: end > 100 ? 1.8 : 1.3,
              ease: "power2.out",
              scrollTrigger: { trigger: n, start: "top 85%", once: true },
              onUpdate: () => (n.textContent = String(Math.round(obj.v))),
            });
          });
          // Linha que liga as etapas se desenha com a rolagem
          const line = el.querySelector<SVGPathElement>("[data-connector]");
          if (line)
            gsap.fromTo(
              line,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el.querySelector("[data-steps]"), start: "top 75%", end: "bottom 60%", scrub: 0.6 } },
            );
          // Ilustração de cada etapa entra girando levemente
          gsap.from(el.querySelectorAll("[data-step-art]"), {
            rotation: -40,
            scale: 0.6,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.12,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: el.querySelector("[data-steps]"), start: "top 80%", once: true },
          });
        });
      }}
    >
      <Wrap>
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 id="ingredientes-title" data-split className="display text-[clamp(2.8rem,7vw,6.5rem)] md:col-span-8">
            O ingrediente principal é o tempo
          </h2>
          <p data-reveal className="prose-measure text-farinha/70 md:col-span-4 md:pb-3">
            Pizza napolitana tem regra: massa simples, fermentação longa e forno muito quente. A gente segue à risca.
          </p>
        </div>

        <div data-steps className="relative mt-20 md:mt-28">
          {/* Conector (horizontal no desktop) */}
          <svg aria-hidden className="absolute left-0 top-[3.25rem] hidden h-4 w-full md:block" viewBox="0 0 100 4" preserveAspectRatio="none">
            <path d="M6 2H94" stroke="var(--olio)" strokeOpacity=".55" strokeWidth=".25" pathLength={1} strokeDasharray="1" data-connector strokeDashoffset="0" />
          </svg>
          <ol className="relative grid gap-14 md:grid-cols-4 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.label} className="relative pl-16 md:pl-0" data-reveal>
                <div className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border border-olio/50 bg-forno md:relative md:mb-10 md:h-[6.5rem] md:w-[6.5rem]">
                  <span data-step-art className="block w-6 text-olio md:w-12">
                    <s.Art strokeWidth={1.6} />
                  </span>
                </div>
                <p className="text-sm text-farinha/50">Etapa {i + 1}</p>
                <p className="mt-1 font-display text-[clamp(3.6rem,6vw,5.6rem)] leading-none tabular-nums text-farinha">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-olio-light">{s.unit}</span>
                </p>
                <p className="mt-2 text-lg text-farinha">{s.label}</p>
                <p className="mt-3 max-w-[28ch] text-[0.95rem] leading-relaxed text-farinha/60">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-28 md:mt-40">
          <h3 data-reveal className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-tight">Da despensa</h3>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {pantry.map((p, i) => (
              <li key={p.name} className={i % 2 ? "md:mt-16" : ""}>
                <div data-reveal="mask" className="relative aspect-[4/5] overflow-hidden">
                  <div data-parallax="0.04" className="absolute inset-[-5%_0]">
                    <Picture name={p.image} alt={p.alt} sizes="(min-width: 768px) 24vw, 50vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                  </div>
                </div>
                <p data-reveal className="mt-4 font-display text-[1.35rem] leading-tight md:text-[1.6rem]">{p.name}</p>
                <p data-reveal className="mt-1 text-sm text-farinha/55">{p.origin}</p>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </Chapter>
  );
}
