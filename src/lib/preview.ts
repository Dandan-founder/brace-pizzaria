/**
 * Modo página única (NEXT_PUBLIC_SINGLE_PAGE=1 no build).
 * Para prévias em visualizadores que não permitem trocar de rota nem embutir sites externos
 * (ex.: artefatos do Claude): o checkout abre por cima da página, os links viram âncoras e o
 * mapa do Google dá lugar ao endereço com links. O site normal não usa este modo.
 */
export const SINGLE_PAGE = process.env.NEXT_PUBLIC_SINGLE_PAGE === "1";

/** Na prévia, só WebP: o compartilhamento público de artefatos aceita JPEG, PNG, GIF ou WebP (não AVIF). */
export const WEBP_ONLY = SINGLE_PAGE;
