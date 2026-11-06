import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
p = np.asarray(Image.open(src)).astype(np.float32)
alpha = p[..., 3] > 128
H, W = alpha.shape
cy, cx = ndi.center_of_mass(alpha)
ang = np.linspace(0, 2*np.pi, 720, endpoint=False)
rmax = np.zeros_like(ang)
for i, t in enumerate(ang):
    rs = np.arange(0, W)
    ys = (cy + rs*np.sin(t)).astype(int); xs = (cx + rs*np.cos(t)).astype(int)
    ok = (ys >= 0) & (ys < H) & (xs >= 0) & (xs < W)
    v = alpha[ys[ok], xs[ok]]
    # first gap of >=6 px from center outward
    r = 0; gap = 0
    for k, b in enumerate(v):
        if b: r = k; gap = 0
        else:
            gap += 1
            if gap >= 6 and k > 50: break
    rmax[i] = r
med = ndi.median_filter(rmax, size=61, mode='wrap')
r = np.minimum(rmax, med * 1.02)   # clip spikes outward
r = ndi.gaussian_filter1d(r, 3, mode='wrap') - 6
yy, xx = np.mgrid[0:H, 0:W]
th = (np.arctan2(yy - cy, xx - cx)) % (2*np.pi)
rr = np.hypot(yy - cy, xx - cx)
idx = (th / (2*np.pi) * len(ang)).astype(int) % len(ang)
m = rr <= r[idx]
a = Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))
img = Image.fromarray(p[..., :3].astype(np.uint8)); img.putalpha(a)
# recentre on pizza
R = int(r.max()) + 20
box = (int(cx-R), int(cy-R), int(cx+R), int(cy+R))
img.crop(box).save(out); print(out, 2*R)
