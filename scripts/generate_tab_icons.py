"""Generate TabBar and brand icons for 亮叶企服 mini program."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / 'images' / 'icon'
SIZE = 81
INACTIVE = (153, 153, 153, 255)
ACTIVE = (15, 61, 46, 255)
BRAND = (15, 61, 46, 255)


def blank(color=(0, 0, 0, 0)):
    return Image.new('RGBA', (SIZE, SIZE), color)


def save(img, name):
    ROOT.mkdir(parents=True, exist_ok=True)
    img.save(ROOT / name, 'PNG')


def draw_home(draw, color):
    draw.polygon([(40, 18), (62, 34), (62, 58), (18, 58), (18, 34)], outline=color, width=4)
    draw.rectangle([34, 42, 46, 58], fill=color)


def draw_car(draw, color):
    draw.rounded_rectangle([16, 38, 65, 52], radius=8, outline=color, width=4)
    draw.ellipse([20, 50, 34, 64], outline=color, width=4)
    draw.ellipse([47, 50, 61, 64], outline=color, width=4)
    draw.line([(24, 38), (32, 28), (49, 28), (57, 38)], fill=color, width=4)


def draw_product(draw, color):
    for x, y in [(18, 18), (44, 18), (18, 44), (44, 44)]:
        draw.rounded_rectangle([x, y, x + 20, y + 20], radius=4, outline=color, width=3)


def draw_finance(draw, color):
    draw.ellipse([18, 18, 63, 63], outline=color, width=4)
    draw.line([(28, 42), (40, 30), (52, 46), (58, 36)], fill=color, width=4)


def draw_user(draw, color):
    draw.ellipse([30, 16, 51, 37], outline=color, width=4)
    draw.arc([20, 34, 61, 70], start=200, end=340, fill=color, width=4)


def make_pair(name, drawer):
    for suffix, color in [('.png', INACTIVE), ('_active.png', ACTIVE)]:
        img = blank()
        d = ImageDraw.Draw(img)
        drawer(d, color)
        save(img, f'{name}{suffix}')


def main():
    make_pair('home', draw_home)
    make_pair('car', draw_car)
    make_pair('product', draw_product)
    make_pair('finance', draw_finance)
    make_pair('user', draw_user)

    loc = blank()
    d = ImageDraw.Draw(loc)
    d.ellipse([28, 18, 53, 43], outline=BRAND, width=4)
    d.ellipse([18, 18, 28, 28], fill=BRAND)
    save(loc, 'location.png')

    logo_src = Path(__file__).resolve().parents[1] / 'images' / 'logo.webp'
    logo_dst = Path(__file__).resolve().parents[1] / 'images' / 'logo.png'
    if logo_src.exists():
        Image.open(logo_src).convert('RGBA').save(logo_dst, 'PNG')

    print('icons generated')


if __name__ == '__main__':
    main()
