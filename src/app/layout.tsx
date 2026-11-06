import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { restaurantJsonLd } from "@/lib/seo";
import { Providers } from "@/components/layout/Providers";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Pizza napolitana no forno a lenha | Vila Madalena, São Paulo`,
    template: `%s | ${site.name} Pizzaria`,
  },
  description: site.description,
  applicationName: site.legalName,
  keywords: ["pizza napolitana", "pizzaria Vila Madalena", "forno a lenha", "pizza São Paulo", "delivery de pizza", "fermentação natural"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: site.legalName,
    title: `${site.name} — Fogo, farinha e tempo`,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Pizza margherita da Brace sobre bancada enfarinhada" }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} — Fogo, farinha e tempo`, description: site.description, images: ["/og.jpg"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0c0a",
  viewportFit: "cover",
  colorScheme: "dark light",
};

/**
 * Antes da primeira pintura: se o visitante aceita movimento, marca <html class="motion-ok">.
 * Só então os elementos animáveis começam escondidos. Sem JS ou com movimento reduzido,
 * o conteúdo aparece pronto.
 */
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }} />
      </head>
      <body>
        <a
          href="#conteudo"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-farinha px-5 py-3 text-forno transition-transform focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
