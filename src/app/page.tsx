import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Menu } from "@/components/sections/Menu";
import { BestSellers } from "@/components/sections/BestSellers";
import { Ingredients } from "@/components/sections/Ingredients";
import { Forno } from "@/components/sections/Forno";
import { Offers } from "@/components/sections/Offers";
import { Gallery } from "@/components/sections/Gallery";
import { Location } from "@/components/sections/Location";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main id="conteudo">
        <Hero />
        <Story />
        <Menu />
        <BestSellers />
        <Ingredients />
        <Forno />
        <Offers />
        <Gallery />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
