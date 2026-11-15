"""Bake the shared background plate (warm radial gradient + fine grain) used by both engines."""
import numpy as np
from PIL import Image
W, H = 1920, 1080
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = W * 0.5, H * 0.46
d = np.sqrt(((x - cx) / (W * 0.62)) ** 2 + ((y - cy) / (H * 0.78)) ** 2)
t = np.clip(d, 0, 1) ** 1.35
inner = np.array([0x26, 0x11, 0x16], np.float32)
outer = np.array([0x0B, 0x06, 0x08], np.float32)
img = inner[None, None, :] * (1 - t[..., None]) + outer[None, None, :] * t[..., None]
rng = np.random.default_rng(7)
grain = rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)
img = np.clip(img + grain, 0, 255).astype(np.uint8)
Image.fromarray(img).save("remotion/public/ground.png", optimize=True)
Image.fromarray(img).save("hyperframes/assets/ground.png", optimize=True)
print("ok")
