/**
 * Ingredientes em traço dourado (linha fina, sem preenchimento) — decoração do hero e capítulos.
 * Todos usam viewBox 0 0 100 100 e herdam a cor via currentColor.
 */
type ArtProps = React.SVGProps<SVGSVGElement> & { strokeWidth?: number };

const base = (strokeWidth = 1.1): React.SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
});

export function Basil({ strokeWidth, ...p }: ArtProps) {
  return (
    <svg {...base(strokeWidth)} {...p}>
      <path d="M50 6C72 20 84 44 78 66 73 84 60 94 50 96 40 94 27 84 22 66 16 44 28 20 50 6Z" />
      <path d="M50 12C51 40 51 70 50 99" />
      <path d="M50 30C58 32 66 36 72 42M50 30C42 32 34 36 28 42M50 48C60 50 70 54 76 60M50 48C40 50 30 54 24 60M50 66C58 68 66 72 70 78M50 66C42 68 34 72 30 78" opacity=".7" />
    </svg>
  );
}

export function Tomato({ strokeWidth, ...p }: ArtProps) {
  const chambers = [0, 90, 180, 270];
  return (
    <svg {...base(strokeWidth)} {...p}>
      <circle cx="50" cy="50" r="44" />
      <circle cx="50" cy="50" r="38" opacity=".6" />
      <circle cx="50" cy="50" r="6" />
      {chambers.map((a) => (
        <g key={a} transform={`rotate(${a + 45} 50 50)`}>
          <path d="M50 16C60 18 64 28 58 40 55 44 45 44 42 40 36 28 40 18 50 16Z" />
          <circle cx="47" cy="27" r="1.6" />
          <circle cx="53" cy="31" r="1.6" />
          <circle cx="49" cy="35" r="1.6" />
        </g>
      ))}
    </svg>
  );
}

export function Garlic({ strokeWidth, ...p }: ArtProps) {
  return (
    <svg {...base(strokeWidth)} {...p}>
      <path d="M50 18C38 30 18 44 20 66 22 84 38 92 50 92 62 92 78 84 80 66 82 44 62 30 50 18Z" />
      <path d="M50 18C49 12 50 8 53 4" />
      <path d="M50 22C42 40 40 66 46 90M50 22C58 40 60 66 54 90M38 34C28 50 28 72 36 88M62 34C72 50 72 72 64 88" opacity=".7" />
      <path d="M44 92l-3 5M50 92v6M56 92l3 5" />
    </svg>
  );
}

export function Wheat({ strokeWidth, ...p }: ArtProps) {
  const rows = [0, 1, 2, 3, 4];
  return (
    <svg {...base(strokeWidth)} {...p}>
      <path d="M50 99C50 70 50 40 51 10" />
      <ellipse cx="51" cy="10" rx="3.5" ry="7" />
      {rows.map((i) => (
        <g key={i}>
          <ellipse cx="44" cy={24 + i * 11} rx="3.6" ry="8" transform={`rotate(-32 44 ${24 + i * 11})`} />
          <ellipse cx="57" cy={24 + i * 11} rx="3.6" ry="8" transform={`rotate(32 57 ${24 + i * 11})`} />
        </g>
      ))}
      <path d="M44 16L38 4M58 16l6-12M40 28l-8-8M61 28l8-8" opacity=".55" />
    </svg>
  );
}

export function Chili({ strokeWidth, ...p }: ArtProps) {
  return (
    <svg {...base(strokeWidth)} {...p}>
      <path d="M40 22C60 24 76 44 78 68 79 82 74 92 70 94 70 80 62 58 46 44 38 38 34 30 40 22Z" />
      <path d="M36 26C34 20 38 16 44 18 46 21 45 24 42 25" />
      <path d="M40 19C38 12 41 7 48 4" />
      <path d="M50 34C60 42 68 56 71 74" opacity=".5" />
    </svg>
  );
}

export function OliveBranch({ strokeWidth, ...p }: ArtProps) {
  const leaves = [
    { x: 30, y: 70, r: -70 },
    { x: 34, y: 66, r: 20 },
    { x: 48, y: 52, r: -60 },
    { x: 54, y: 46, r: 30 },
    { x: 66, y: 34, r: -55 },
    { x: 72, y: 28, r: 35 },
    { x: 84, y: 18, r: -40 },
  ];
  return (
    <svg {...base(strokeWidth)} {...p}>
      <path d="M12 90C36 66 60 44 90 12" />
      {leaves.map((l, i) => (
        <path key={i} d="M0 0C6-4 16-4 22 0 16 4 6 4 0 0Z" transform={`translate(${l.x} ${l.y}) rotate(${l.r})`} />
      ))}
      <ellipse cx="42" cy="66" rx="5" ry="7" transform="rotate(-30 42 66)" />
      <ellipse cx="62" cy="48" rx="5" ry="7" transform="rotate(-30 62 48)" />
    </svg>
  );
}

export const ingredientArt = { Basil, Tomato, Garlic, Wheat, Chili, OliveBranch };
