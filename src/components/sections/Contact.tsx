import { Mail, Phone } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { WhatsAppIcon, socialIcon } from "@/components/brand/SocialIcons";
import { site } from "@/data/site";
import { whatsappHello } from "@/lib/whatsapp";

export function Contact() {
  return (
    <Chapter id="contato" theme="red" aria-labelledby="contato-title" className="grain overflow-hidden py-24 md:py-36">
      <Wrap className="grid gap-14 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h2 id="contato-title" data-split className="display text-[clamp(3.2rem,9vw,9rem)]">
            Fale com a gente
          </h2>
          <p data-reveal className="prose-measure mt-8 text-lg text-farinha/80">
            Pedidos, mesas para grupos e eventos: respondemos pelo WhatsApp no horário de funcionamento.
          </p>
          <div data-reveal className="mt-10">
            <a
              href={whatsappHello()}
              target="_blank"
              rel="noopener"
              className="group inline-flex h-16 items-center gap-3 rounded-full bg-farinha pl-6 pr-8 text-lg font-medium text-brasa transition-[background-color,transform,translate,rotate,scale] duration-200 hover:bg-white active:scale-[0.97]"
            >
              <WhatsAppIcon className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-12" />
              Conversar no WhatsApp
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </div>
        </div>

        <div data-reveal className="space-y-8 md:col-span-4">
          <ul className="space-y-3 text-lg">
            <li>
              <a href={`tel:+${site.whatsapp}`} className="inline-flex items-center gap-3 underline-offset-4 hover:underline">
                <Phone className="h-5 w-5 text-farinha/70" aria-hidden />
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 break-all underline-offset-4 hover:underline">
                <Mail className="h-5 w-5 shrink-0 text-farinha/70" aria-hidden />
                {site.email}
              </a>
            </li>
          </ul>
          <div className="hairline opacity-60" />
          <ul className="flex flex-wrap gap-3" aria-label="Redes sociais">
            {site.social.map((s) => {
              const Icon = socialIcon(s.label);
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-12 items-center gap-2.5 rounded-full border border-farinha/30 px-5 transition-colors duration-200 hover:border-farinha hover:bg-farinha/10"
                  >
                    <Icon className="h-5 w-5" />
                    {s.label}
                    <span className="sr-only">(nova aba)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Wrap>
    </Chapter>
  );
}
