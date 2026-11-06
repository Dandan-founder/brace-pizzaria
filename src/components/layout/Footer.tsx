import { OvenMark } from "@/components/brand/Logo";
import { site } from "@/data/site";
import { navLinks } from "@/data/nav";

export function Footer({ home = true }: { home?: boolean }) {
  const year = new Date().getFullYear();
  return (
    <footer data-nav="dark" className="grain relative overflow-hidden bg-forno pt-20 text-farinha md:pt-28">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <OvenMark className="h-12 w-12 text-olio" />
            <p className="mt-6 max-w-[30ch] text-farinha/65">Pizza napolitana de fermentação longa e forno a lenha, na Vila Madalena.</p>
          </div>
          <nav aria-label="Rodapé" className="md:col-span-3">
            <h2 className="text-sm text-farinha/45">Navegue</h2>
            <ul className="mt-4 space-y-2">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={home ? `#${l.id}` : `/#${l.id}`} className="text-farinha/80 transition-colors hover:text-farinha">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-3">
            <h2 className="text-sm text-farinha/45">Visite</h2>
            <p className="mt-4 text-farinha/80">
              {site.address.street}
              <br />
              {site.address.district}, {site.address.city}
            </p>
            <p className="mt-4 text-farinha/80">
              Terça a domingo
              <br />
              Segunda fechado
            </p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-sm text-farinha/45">Siga</h2>
            <ul className="mt-4 space-y-2">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener" className="text-farinha/80 transition-colors hover:text-farinha">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Assinatura gigante: a palavra ocupa a largura da tela */}
      <p
        aria-hidden
        translate="no"
        className="mt-20 select-none whitespace-nowrap text-center font-display text-[30vw] font-medium leading-[0.72] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(184,145,63,.55)] md:mt-28"
      >
        Brace
      </p>

      <div className="relative border-t border-farinha/10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-[var(--gutter)] py-6 text-xs text-farinha/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}. Fotos: Unsplash.
          </p>
          {site.isDemo && (
            <p className="text-farinha/60">Site de demonstração: marca, endereço, telefone e preços são exemplos.</p>
          )}
          <a href="#conteudo" className="underline-offset-4 hover:underline">
            Voltar ao topo
          </a>
        </div>
      </div>
    </footer>
  );
}
