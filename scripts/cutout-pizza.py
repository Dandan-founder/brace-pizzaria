import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32)
# pizza: warm/bright & saturated; flour: bright but grey (low saturation)
mx, mn = a.max(2), a.min(2)
sat = (mx - mn) / (mx + 1e-3)
lum = a.mean(2)
mask = ((sat > 0.22) & (lum > 60)) | ((lum > 150) & (sat > 0.08))
mask = ndi.binary_opening(mask, iterations=3)
lab, n = ndi.label(mask)
sizes = ndi.sum(mask, lab, range(1, n + 1))
m = lab == (np.argmax(sizes) + 1)
m = ndi.binary_closing(m, iterations=25)
m = ndi.binary_fill_holes(m)
m = ndi.binary_erosion(m, iterations=4)
ys, xs = np.where(m)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
pad = 40
y0, x0 = max(0, y0 - pad), max(0, x0 - pad); y1, x1 = min(a.shape[0], y1 + pad), min(a.shape[1], x1 + pad)
alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
rgba = im.copy(); rgba.putalpha(alpha)
rgba = rgba.crop((x0, y0, x1, y1))
s = max(rgba.size); sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(rgba, ((s - rgba.size[0]) // 2, (s - rgba.size[1]) // 2))
sq.save(out); print(out, sq.size, (x0, y0, x1, y1))
