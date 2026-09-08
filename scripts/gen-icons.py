"""
Regenerates public/icons/*.png from the brand mark used in
src/components/Logo.tsx and public/icons/icon.svg (rounded gradient square +
white play triangle + faint orbit ring), so the installed PWA icon matches
the in-app branding.

Run with: python scripts/gen-icons.py
"""
from PIL import Image, ImageDraw
import math
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')

GRAD_START = (10, 132, 255)   # #0a84ff
GRAD_END = (108, 92, 231)     # #6c5ce7
WHITE = (255, 255, 255)

SS = 4  # supersampling factor for anti-aliasing


def lerp(a, b, t):
    return a + (b - a) * t


def draw_mark(size, corner_radius_frac=13 / 48, margin_frac=2 / 48, padding_frac=0.0):
    """Draws the brand mark centered in a `size`x`size` canvas.
    padding_frac shrinks the mark to leave safe-zone padding (for maskable icons)."""
    hi = size * SS
    img = Image.new('RGBA', (hi, hi), (0, 0, 0, 0))

    usable = hi * (1 - 2 * padding_frac)
    offset = hi * padding_frac
    margin = usable * margin_frac
    x0 = offset + margin
    y0 = offset + margin
    x1 = offset + usable - margin
    y1 = offset + usable - margin
    radius = usable * corner_radius_frac

    # Gradient-filled rounded square background (diagonal gradient via per-pixel lerp,
    # masked to a rounded-rect shape for a clean anti-aliased edge after downscale).
    grad = Image.new('RGB', (hi, hi), GRAD_START)
    px = grad.load()
    w = x1 - x0
    h = y1 - y0
    for yy in range(hi):
        for xx in range(hi):
            t = ((xx - x0) / w + (yy - y0) / h) / 2 if w and h else 0
            t = max(0.0, min(1.0, t))
            px[xx, yy] = (
                int(lerp(GRAD_START[0], GRAD_END[0], t)),
                int(lerp(GRAD_START[1], GRAD_END[1], t)),
                int(lerp(GRAD_START[2], GRAD_END[2], t)),
            )

    mask = Image.new('L', (hi, hi), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=255)

    img.paste(grad, (0, 0), mask)
    draw = ImageDraw.Draw(img)

    # Faint orbit ring (matches the SVG's partial-circle stroke, ~300 degrees).
    ring_cx = offset + usable * 0.5
    ring_cy = offset + usable * (16 / 48 + 0 / 48) if False else offset + usable * (24 / 48)
    ring_r = usable * (16 / 48)
    ring_w = usable * (2.5 / 48)
    ring_color = (255, 255, 255, 100)
    draw.arc(
        [ring_cx - ring_r, ring_cy - ring_r, ring_cx + ring_r, ring_cy + ring_r],
        start=-90 + 12, end=180,
        fill=ring_color, width=max(1, int(ring_w)),
    )

    # Play triangle, matching path "M20 15.5v17l14.5-8.5z" in a 48x48 viewBox.
    def pt(px_, py_):
        return (offset + usable * px_ / 48, offset + usable * py_ / 48)

    draw.polygon([pt(20, 15.5), pt(20, 32.5), pt(34.5, 24)], fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)


def save_flat(img, path):
    bg = Image.new('RGB', img.size, (0, 0, 0))
    bg.paste(img, (0, 0), img)
    bg.save(path)


if __name__ == '__main__':
    # web.dev's PWA icon guidance: avoid transparent PNGs, since some OS
    # install surfaces fill transparent areas unpredictably (white/black).
    # Flatten onto the manifest's background_color (#000000) instead.
    icon_192 = draw_mark(192)
    save_flat(icon_192, os.path.join(OUT_DIR, 'icon-192.png'))

    icon_512 = draw_mark(512)
    save_flat(icon_512, os.path.join(OUT_DIR, 'icon-512.png'))

    # Maskable variant needs extra safe-zone padding so OS masks (circle/squircle)
    # don't clip the mark -- reuse icon-512.png's slot in the manifest but make
    # the artwork itself safe by baking in the padding.
    icon_512_maskable = draw_mark(512, padding_frac=0.12)
    save_flat(icon_512_maskable, os.path.join(OUT_DIR, 'icon-512-maskable.png'))

    # iOS applies its own corner rounding to apple-touch-icon, so fill the
    # square edge-to-edge (margin_frac=0) -- otherwise the un-rounded gradient
    # square would leave the surrounding transparent corners visible as a
    # black frame once flattened.
    apple_touch = draw_mark(180, margin_frac=0)
    save_flat(apple_touch, os.path.join(OUT_DIR, 'apple-touch-icon.png'))

    print('Generated icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png')
