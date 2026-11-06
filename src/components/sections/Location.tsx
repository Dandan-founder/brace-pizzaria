"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Chapter, Wrap } from "@/components/motion/Chapter";
import { ButtonLink } from "@/components/ui/Button";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { site, weekdayNames } from "@/data/site";
import { formatRange, nowInShop } from "@/lib/hours";
import { SINGLE_PAGE } from "@/lib/preview";

const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;
const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
// Embed público do Google Maps (não exige chave de API)
const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;

/** Segunda a domingo, na ordem de leitura brasileira */
const order = [1, 2, 3, 4, 5, 6, 0];

export function Location() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(nowInShop().day), []);

  return (
    <Chapter id="onde-estamos" theme="light" aria-labelledby="onde-title" className="py-24 md:py-40">
      <Wrap className="grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <h2 id="onde-title" data-split className="display text-[clamp(2.8rem,6.5vw,6rem)]">
            Onde estamos
          </h2>
          <address data-reveal className="mt-10 not-italic">
            <p className="flex items-start gap-3 text-lg">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brasa" aria-hidden />
              <span>
                {site.address.street}
                <br />
                {site.address.district}, {site.address.city} — {site.address.state}
                <br />
                <span className="text-cenere">CEP {site.address.zip}</span>
              </span>
            </p>
          </address>
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={mapsDirections} target="_blank" rel="noopener" variant="primary">
              <Navigation className="h-4 w-4" aria-hidden />
              Traçar rota
              <span className="sr-only">(abre o Google Maps em nova aba)</span>
            </ButtonLink>
            <ButtonLink href={mapsSearch} target="_blank" rel="noopener" variant="outline-dark">
              Abrir no Google Maps
              <span className="sr-only">(nova aba)</span>
            </ButtonLink>
          </div>

          <div data-reveal className="mt-14">
            <h3 className="font-display text-[1.9rem]">Horários</h3>
            <OpenStatus className="mt-2 text-sm text-cenere [&_.bg-olio-light]:bg-brasa [&_.bg-olio-light\/70]:bg-brasa/50" />
            <table className="mt-5 w-full max-w-md border-collapse text-[0.98rem]">
              <caption className="sr-only">Horário de funcionamento por dia da semana</caption>
              <tbody>
                {order.map((d) => {
                  const h = site.hours[d];
                  const isToday = today === d;
                  return (
                    <tr key={d} className={`border-b border-forno/10 ${isToday ? "font-semibold" : ""}`} aria-current={isToday ? "date" : undefined}>
                      <th scope="row" className="py-2.5 text-left font-[inherit]">
                        {weekdayNames[d]}
                        {isToday && <span className="ml-2 rounded-full bg-brasa px-2 py-0.5 text-xs font-medium text-farinha">hoje</span>}
                      </th>
                      <td className={`py-2.5 text-right tabular-nums ${h ? "" : "text-cenere"}`}>{h ? formatRange(h) : "Fechado"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div data-reveal="mask" className="relative min-h-[24rem] overflow-hidden bg-farinha-3 md:col-span-7 md:min-h-[40rem]">
          {/* Aparece enquanto o mapa carrega (ou se o Google Maps estiver bloqueado na rede) */}
          <div className="absolute inset-0 grid place-items-center p-8 text-center text-cenere" aria-hidden>
            <div>
              <MapPin className="mx-auto h-10 w-10 text-brasa" />
              <p className="mt-4 font-display text-[1.6rem] text-forno">{site.address.district}</p>
              <p className="mt-1">{site.address.street}, {site.address.city}</p>
            </div>
          </div>
          {!SINGLE_PAGE && <iframe
            title={`Mapa: ${site.legalName}, ${site.address.district}`}
            src={mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:grayscale(.85)_sepia(.25)_contrast(1.05)]"
          />}
        </div>
      </Wrap>
    </Chapter>
  );
}
