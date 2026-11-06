import images from "@/data/images.json";
import { WEBP_ONLY } from "@/lib/preview";

type ImageKey = keyof typeof images;

type Props = {
  name: string;
  alt: string;
  /** Atributo sizes do srcset, ex.: "(min-width: 768px) 50vw, 100vw" */
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Cor de fundo enquanto carrega (padrão: cor dominante da foto) */
  placeholder?: boolean;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
};

/**
 * <picture> responsivo com AVIF → WebP, dimensões reservadas (sem layout shift)
 * e cor dominante como placeholder. Gerado por scripts/optimize-images.mjs.
 */
export function Picture({ name, alt, sizes, className, imgClassName, priority, placeholder = true, style, imgStyle }: Props) {
  const meta = images[name as ImageKey];
  if (!meta) throw new Error(`Imagem desconhecida: ${name}`);
  const largest = meta.widths[meta.widths.length - 1];
  const set = (ext: string) => meta.widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture className={className} style={{ ...(placeholder && !meta.alpha ? { backgroundColor: meta.color } : {}), ...style }}>
      {!WEBP_ONLY && <source type="image/avif" srcSet={set("avif")} sizes={sizes} />}
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/images/${name}-${largest}.webp`}
        alt={alt}
        width={largest}
        height={Math.round(largest / meta.ratio)}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={imgClassName}
        style={imgStyle}
        draggable={false}
      />
    </picture>
  );
}

export const imageRatio = (name: string) => images[name as ImageKey]?.ratio ?? 1;
