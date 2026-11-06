// Gera versões AVIF/WebP responsivas a partir de assets-src/ e um manifesto
// com dimensões e cor dominante (placeholder sem layout shift).
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const SRC = "assets-src";
const OUT = "public/images";

// name: arquivo de origem, ratio: proporção final (w/h), widths: tamanhos gerados
// extract: recorte em px antes de redimensionar, position: foco do recorte
const jobs = [
  { name: "hero-pizza", file: "hero-pizza-clean.png", ratio: 1, widths: [480, 720, 960, 1374], alpha: true },
  { name: "flour", file: "hero.jpg", extract: { left: 1640, top: 0, width: 760, height: 1600 }, rotate: 90, ratio: 1600 / 760, widths: [900, 1600] },
  { name: "oven", file: "oven.jpg", ratio: 3 / 2, widths: [640, 1200, 2000] },
  { name: "chef", file: "chef.jpg", ratio: 4 / 5, widths: [480, 900, 1400] },
  { name: "interior", file: "interior.jpg", ratio: 3 / 2, widths: [640, 1200, 2000] },
  { name: "table", file: "table.jpg", ratio: 4 / 5, widths: [480, 900, 1400] },
  { name: "wine", file: "wine.jpg", ratio: 1, widths: [480, 900] },
  { name: "filante", file: "filante.jpg", ratio: 4 / 5, widths: [480, 900, 1400] },
  { name: "slice", file: "slice.jpg", ratio: 4 / 5, widths: [480, 900, 1400] },
  { name: "share", file: "share.jpg", ratio: 3 / 2, widths: [640, 1200, 2000] },
  { name: "paddle", file: "paddle.jpg", ratio: 4 / 5, widths: [480, 900, 1400] },
  { name: "tomatoes", file: "tomatoes.jpg", ratio: 1, widths: [480, 900] },
  { name: "oil", file: "oil.jpg", ratio: 4 / 5, widths: [480, 900] },
  { name: "parmesan", file: "parmesan.jpg", ratio: 1, widths: [480, 900] },
  { name: "bread", file: "bread.jpg", ratio: 1, widths: [480, 900] },
  ...["margherita", "bianca", "spinaci", "diavola", "rustica", "tagliere", "funghi", "capricciosa"].map((n) => ({
    name: n, file: `${n}.jpg`, ratio: 1, widths: [400, 720, 1100],
  })),
];

await mkdir(OUT, { recursive: true });
// Uso: node scripts/optimize-images.mjs [nome ...] — sem argumentos processa tudo
const only = process.argv.slice(2);
const manifestPath = "src/data/images.json";
const manifest = only.length ? JSON.parse(await readFile(manifestPath, "utf8")) : {};
for (const j of jobs) {
  if (only.length && !only.includes(j.name)) continue;
  let base = sharp(`${SRC}/${j.file}`);
  if (j.extract) base = base.extract(j.extract);
  let buf = await base.toBuffer();
  if (j.rotate) buf = await sharp(buf).rotate(j.rotate).toBuffer();
  const meta = await sharp(buf).metadata();
  // recorte central na proporção pedida
  let w = meta.width, h = Math.round(w / j.ratio);
  if (h > meta.height) { h = meta.height; w = Math.round(h * j.ratio); }
  const crop = { left: Math.round((meta.width - w) / 2), top: Math.round((meta.height - h) / 2), width: w, height: h };
  const cropped = await sharp(buf).extract(crop).toBuffer();
  const { dominant } = await sharp(cropped).stats();
  const widths = j.widths.filter((x) => x <= w);
  if (!widths.length) widths.push(w);
  for (const width of widths) {
    const r = sharp(cropped).resize({ width });
    await r.clone().avif({ quality: j.alpha ? 60 : 52, effort: 6 }).toFile(`${OUT}/${j.name}-${width}.avif`);
    await r.clone().webp({ quality: j.alpha ? 80 : 74 }).toFile(`${OUT}/${j.name}-${width}.webp`);
  }
  manifest[j.name] = {
    widths, ratio: j.ratio, alpha: !!j.alpha,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
  };
  console.log(j.name, widths.join(","));
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
