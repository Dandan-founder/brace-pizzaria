import * as THREE from "three";

/**
 * Texturas procedurais (geradas em canvas, sem baixar imagens): cor + relevo (normal map).
 * O relevo sai de um mapa de altura: bordas gastas, lascas e granulação.
 */

const hash = (x: number, y: number, s = 0) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
function noise(x: number, y: number, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, y: number, s = 0, oct = 4) => {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise(x * f, y * f, s + i * 13);
    f *= 2;
    a *= 0.5;
  }
  return v;
};

function toTexture(w: number, h: number, fill: (x: number, y: number) => [number, number, number], srgb: boolean) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, gg, b] = fill(x, y);
      const k = (y * w + x) * 4;
      img.data[k] = r;
      img.data[k + 1] = gg;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Normal map a partir de um campo de altura (0..1). */
function normalFrom(w: number, h: number, height: Float32Array, strength: number) {
  const at = (x: number, y: number) => height[((y + h) % h) * w + ((x + w) % w)];
  return toTexture(
    w,
    h,
    (x, y) => {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      return [((-dx / l) * 0.5 + 0.5) * 255, ((dy / l) * 0.5 + 0.5) * 255, ((1 / l) * 0.5 + 0.5) * 255];
    },
    false,
  );
}

/** Face de tijolo refratário: cor neutra (multiplicada pela cor de cada instância) + relevo. */
export function brickTextures() {
  const w = 256, h = 160;
  const height = new Float32Array(w * h);
  const shade = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      // borda arredondada e gasta (cai para as quinas)
      const ex = Math.min(u, 1 - u) * 9, ey = Math.min(v, 1 - v) * 9 * (w / h);
      const edge = Math.min(1, Math.min(ex, ey) + (fbm(u * 18, v * 18, 3) - 0.5) * 0.9);
      const grain = fbm(u * 40, v * 25, 1, 3);
      const pits = noise(u * 70, v * 44, 7) > 0.86 ? -0.35 : 0; // poros
      const chip = fbm(u * 6, v * 4, 9) > 0.72 && edge < 0.9 ? -0.5 : 0; // lascas nas bordas
      height[y * w + x] = Math.max(0, edge) * 0.8 + grain * 0.2 + pits * 0.3 + chip * 0.4;
      shade[y * w + x] = 0.78 + grain * 0.32 + (fbm(u * 3, v * 2, 5) - 0.5) * 0.25 + chip * 0.35 - (1 - Math.min(1, edge)) * 0.25;
    }
  const map = toTexture(w, h, (x, y) => {
    const s = Math.max(0.35, Math.min(1.15, shade[y * w + x]));
    return [235 * s, 222 * s, 210 * s];
  }, true);
  return { map, normalMap: normalFrom(w, h, height, 3.2) };
}

/** Argamassa granulada (cinza quente). */
export function mortarTexture() {
  const w = 256, h = 128;
  const t = toTexture(w, h, (x, y) => {
    const n = fbm(x / 10, y / 10, 2, 4) * 0.6 + noise(x / 1.6, y / 1.6, 4) * 0.4;
    const s = 0.65 + n * 0.5;
    return [118 * s, 102 * s, 88 * s];
  }, true);
  t.repeat.set(10, 4);
  return t;
}

/** Pedra (granito escuro) com veios e relevo, para a base e o tampo. */
export function stoneTextures(tone: [number, number, number], seed = 0) {
  const w = 256, h = 256;
  const height = new Float32Array(w * h);
  const map = toTexture(w, h, (x, y) => {
    const u = x / w, v = y / h;
    const n = fbm(u * 8, v * 8, seed, 5);
    const vein = Math.abs(Math.sin((u * 6 + fbm(u * 3, v * 3, seed + 2) * 4) * Math.PI)) < 0.05 ? -0.18 : 0;
    const speck = noise(u * 160, v * 160, seed + 5) > 0.82 ? 0.14 : 0;
    height[y * w + x] = n * 0.7 + speck;
    const s = 0.72 + n * 0.45 + vein + speck;
    return [tone[0] * s, tone[1] * s, tone[2] * s];
  }, true);
  return { map, normalMap: normalFrom(w, h, height, 2.2) };
}

/** Sombra de contato macia (círculo radial) para "assentar" a cúpula na laje. */
export function contactShadow() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, s * 0.28, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(0,0,0,0.85)");
  grd.addColorStop(0.55, "rgba(0,0,0,0.45)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}
