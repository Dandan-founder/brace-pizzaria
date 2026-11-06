import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";
import { Wheat } from "@/components/decor/IngredientArt";

export function Story() {
  return (
    <Chapter id="historia" theme="light" aria-labelledby="historia-title" className="overflow-hidden py-24 md:py-40">
      <Wrap className="grid gap-14 md:grid-cols-12 md:gap-x-10 md:gap-y-24">
        {/* Retrato assimétrico, não uma grade de "equipe" */}
        <figure className="relative md:col-span-5 md:row-span-2">
          <div data-reveal="mask" className="relative aspect-[4/5] overflow-hidden">
            <div data-parallax="0.05" className="absolute inset-[-6%_0]">
              <Picture
                name="chef"
                alt="Pizzaiolo abrindo a massa sobre a bancada, iluminado pelas luminárias de cobre da cozinha"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </div>
          <figcaption data-reveal className="mt-4 text-sm text-cenere">
            Lucia Ferrante, pizzaiola e sócia, abrindo a primeira massa do dia.
          </figcaption>
        </figure>

        <div className="md:col-span-6 md:col-start-7 md:pt-16">
          <h2 id="historia-title" data-split className="display text-[clamp(2.8rem,6.4vw,6rem)]">
            Uma pizzaria pequena, de propósito.
          </h2>
          <div className="mt-10 space-y-5 text-[1.075rem] leading-[1.75] text-cenere">
            <p data-reveal className="prose-measure">
              A Brace nasceu de uma viagem a Nápoles e de uma teimosia: fazer em São Paulo a pizza que a gente comeu de pé, na
              calçada, ainda quente do forno. Borda alta e manchada de fogo, centro macio, nenhum excesso.
            </p>
            <p data-reveal className="prose-measure">
              Por isso o cardápio é curto. Farinha italiana tipo 00, tomate San Marzano, fior di latte que chega toda semana e
              azeite extravirgem. O que não está bom no dia não entra na pizza.
            </p>
          </div>
        </div>

        {/* Segunda imagem sobreposta + citação: muda a escala, não repete o bloco */}
        <div className="relative md:col-span-7 md:col-start-6">
          <div data-reveal="mask" className="relative aspect-[3/2] overflow-hidden">
            <div data-parallax="0.04" className="absolute inset-[-5%_0]">
              <Picture
                name="oven"
                alt="Pizza assando dentro do forno a lenha, com as chamas ao fundo"
                sizes="(min-width: 768px) 55vw, 100vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </div>
          <blockquote
            data-reveal
            className="relative mt-[-3.5rem] ml-auto w-[88%] bg-forno p-7 text-farinha md:absolute md:-left-[22%] md:bottom-[-3rem] md:mt-0 md:w-[min(30rem,62%)] md:p-10"
          >
            <Wheat className="mb-5 h-10 w-10 text-olio" />
            <p className="font-display text-[clamp(1.5rem,2.2vw,2.1rem)] leading-[1.18]">
              A massa decide quando está pronta. A gente só aprende a esperar.
            </p>
            <footer className="mt-5 text-sm text-farinha/60">Lucia Ferrante</footer>
          </blockquote>
        </div>
      </Wrap>
    </Chapter>
  );
}
