import { categories, products } from "@/data/menu";
import { site } from "@/data/site";

const dayIds = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Dados estruturados schema.org: Restaurant + cardápio completo (aparece em resultados ricos do Google). */
export function restaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${site.url}/#restaurante`,
    name: site.legalName,
    description: site.description,
    url: site.url,
    image: [`${site.url}/og.jpg`],
    telephone: `+${site.whatsapp}`,
    email: site.email,
    servesCuisine: ["Pizza", "Italiana", "Napolitana"],
    priceRange: "$$",
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: site.hours.flatMap((h, i) =>
      h ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: dayIds[i], opens: h.open, closes: h.close }] : [],
    ),
    sameAs: site.social.map((s) => s.href),
    hasMenu: {
      "@type": "Menu",
      name: "Cardápio",
      hasMenuSection: categories.map((c) => ({
        "@type": "MenuSection",
        name: c.name,
        description: c.note,
        hasMenuItem: products
          .filter((p) => p.category === c.id)
          .map((p) => ({
            "@type": "MenuItem",
            name: p.name,
            description: p.description,
            ...(p.vegetarian ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
            offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "BRL" },
          })),
      })),
    },
  };
}
