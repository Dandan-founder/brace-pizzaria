"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { Picture } from "@/components/ui/Picture";

const photos = [
  { image: "filante", alt: "Fatia de pizza sendo levantada, com o queijo derretido esticando", cls: "col-span-2 md:col-span-5 aspect-[4/5]" },
  { image: "interior", alt: "Salão com mesas de madeira, luz baixa e balcão ao fundo", cls: "col-span-2 md:col-span-7 md:self-end aspect-[3/2]" },
  { image: "slice", alt: "Mão servindo uma fatia de pizza de calabresa", cls: "md:col-span-4 aspect-[4/5]" },
  { image: "paddle", alt: "Pizza recém-saída do forno sobre a pá de madeira", cls: "md:col-span-4 md:mt-20 aspect-[4/5]" },
  { image: "table", alt: "Mesa posta com taças e prato servido", cls: "col-span-2 md:col-span-4 aspect-[4/5]" },
  { image: "share", alt: "Amigos dividindo uma pizza sobre a tábua de madeira", cls: "col-span-2 md:col-span-8 md:col-start-3 aspect-[3/2]" },
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));
  };

  return (
    <Chapter id="galeria" theme="dark" aria-labelledby="galeria-title" className="grain overflow-hidden py-24 md:py-40">
      <Wrap>
        <h2 id="galeria-title" data-split className="display max-w-[16ch] text-[clamp(2.8rem,7vw,6.5rem)]">
          Uma noite na Brace
        </h2>
        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-12 md:gap-6">
          {photos.map((p, i) => (
            <li key={p.image} className={p.cls}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden"
                aria-label={`Ampliar foto: ${p.alt}`}
                data-reveal="mask"
              >
                <div data-parallax="0.04" className="absolute inset-[-5%_0]">
                  <Picture
                    name={p.image}
                    alt=""
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-brasa)] group-hover:scale-[1.02]"
                  />
                </div>
                <span className="absolute inset-0 bg-forno/0 transition-colors duration-500 group-hover:bg-forno/15" />
              </button>
            </li>
          ))}
        </ul>
        <p data-reveal className="mt-8 text-sm text-farinha/45">
          Fotos ilustrativas do banco de imagens Unsplash.
        </p>
      </Wrap>

      <Dialog.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <AnimatePresence>
          {open !== null && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay forceMount asChild>
                <m.div className="fixed inset-0 z-[70] bg-forno/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              </Dialog.Overlay>
              <Dialog.Content
                forceMount
                aria-describedby={undefined}
                className="fixed inset-0 z-[71] flex items-center justify-center p-4 outline-none md:p-14"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") go(1);
                  if (e.key === "ArrowLeft") go(-1);
                }}
              >
                <Dialog.Title className="sr-only">{photos[open].alt}</Dialog.Title>
                <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                  <m.figure
                    key={open}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -60 }}
                    transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                    className="max-h-full max-w-[min(100%,1200px)]"
                  >
                    <Picture
                      name={photos[open].image}
                      alt={photos[open].alt}
                      sizes="90vw"
                      className="block"
                      imgClassName="max-h-[80vh] w-auto object-contain"
                    />
                    <figcaption className="mt-3 text-sm text-farinha/70">
                      {photos[open].alt} <span className="text-farinha/40">({open + 1} de {photos.length})</span>
                    </figcaption>
                  </m.figure>
                </AnimatePresence>
                <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-auto md:left-auto md:right-6 md:top-6 md:translate-x-0">
                  <button type="button" onClick={() => go(-1)} className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-farinha/10 text-farinha hover:bg-farinha/20" aria-label="Foto anterior">
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button type="button" onClick={() => go(1)} className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-farinha/10 text-farinha hover:bg-farinha/20" aria-label="Próxima foto">
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                  <Dialog.Close className="grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-farinha text-forno hover:bg-white" aria-label="Fechar galeria">
                    <X className="h-5 w-5" aria-hidden />
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Chapter>
  );
}
