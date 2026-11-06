import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% estático: gera HTML pronto para SEO e pode ser hospedado em qualquer CDN.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true }, // imagens já otimizadas por scripts/optimize-images.mjs
  reactStrictMode: true,
};

export default nextConfig;
