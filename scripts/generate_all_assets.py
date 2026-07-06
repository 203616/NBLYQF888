"""Generate all commercial-use image assets for 亮叶企服 mini program."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / 'images'
ICON = ROOT / 'icon'
BRAND = (15, 61, 46)
BRAND_LIGHT = (26, 92, 68)
GOLD = (212, 168, 75)
WHITE = (255, 255, 255)
GRAY = (153, 153, 153)
INACTIVE = (153, 153, 153, 255)
ACTIVE = (15, 61, 46, 255)
TAB_SIZE = 81


def ensure_dirs():
    ROOT.mkdir(parents=True, exist_ok=True)
    ICON.mkdir(parents=True, exist_ok=True)
    for sub in ['products', 'news', 'cars', 'covers', 'knowledge', 'tips', 'exposure', 'channel', 'cases']:
        (ROOT / sub).mkdir(parents=True, exist_ok=True)


def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix.lower() == '.webp':
        img.save(path, 'WEBP', quality=90)
    else:
        img.save(path, 'PNG', optimize=True)


def gradient(w, h, c1, c2, direction='h'):
    img = Image.new('RGB', (w, h))
    draw = ImageDraw.Draw(img)
    for i in range(w if direction == 'h' else h):
        t = i / max((w if direction == 'h' else h) - 1, 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        if direction == 'h':
            draw.line([(i, 0), (i, h)], fill=(r, g, b))
        else:
            draw.line([(0, i), (w, i)], fill=(r, g, b))
    return img


def draw_text_centered(draw, text, y, w, color=WHITE, size=28):
    try:
        font = ImageFont.truetype('arial.ttf', size)
    except OSError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, y), text, fill=color, font=font)


def make_banner(filename, title, subtitle, c1, c2, accent=None):
    w, h = 750, 360
    img = gradient(w, h, c1, c2)
    draw = ImageDraw.Draw(img)
    accent = accent or GOLD
    draw.rounded_rectangle([40, 40, 120, 120], radius=16, fill=accent)
    draw.ellipse([60, 60, 100, 100], fill=WHITE)
    draw_text_centered(draw, title, 150, w, WHITE, 34)
    draw_text_centered(draw, subtitle, 210, w, (230, 240, 235), 22)
    draw.rounded_rectangle([40, 280, 220, 320], radius=20, fill=accent)
    draw_text_centered(draw, '亮叶企服', 288, 260, BRAND, 20)
    save(img, ROOT / filename)


def make_product_cover(idx, name, c1, c2):
    w, h = 400, 300
    img = gradient(w, h, c1, c2, 'v')
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([20, 20, 80, 80], radius=12, fill=(*GOLD, 200) if len(GOLD) == 3 else GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 18)
        font_sm = ImageFont.truetype('arial.ttf', 14)
    except OSError:
        font = ImageFont.load_default()
        font_sm = font
    draw.text((20, 100), name[:12], fill=WHITE, font=font)
    draw.text((20, 130), f'方案 {idx:02d}', fill=(220, 230, 225), font=font_sm)
    save(img, ROOT / 'products' / f'product-{idx}.png')


def make_news_cover(idx, category, c1, c2):
    w, h = 400, 260
    img = gradient(w, h, c1, c2)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([16, 16, 120, 44], radius=8, fill=GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 14)
        font_lg = ImageFont.truetype('arial.ttf', 20)
    except OSError:
        font = font_lg = ImageFont.load_default()
    draw.text((24, 22), category[:6], fill=BRAND, font=font)
    draw.text((16, 80), f'资讯 #{idx}', fill=WHITE, font=font_lg)
    save(img, ROOT / 'news' / f'news-{idx}.png')


def make_car_cover(idx, brand, c1, c2):
    w, h = 500, 340
    img = gradient(w, h, c1, c2)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([40, 180, 460, 250], radius=30, outline=WHITE, width=4)
    draw.ellipse([80, 230, 140, 290], outline=WHITE, width=4)
    draw.ellipse([360, 230, 420, 290], outline=WHITE, width=4)
    draw.rounded_rectangle([120, 150, 380, 210], radius=20, outline=WHITE, width=3)
    try:
        font = ImageFont.truetype('arial.ttf', 26)
    except OSError:
        font = ImageFont.load_default()
    draw.text((40, 40), brand, fill=WHITE, font=font)
    save(img, ROOT / 'cars' / f'car-{idx}.png')


def make_logo():
    size = 256
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([8, 8, size - 8, size - 8], fill=BRAND)
    draw.ellipse([48, 48, size - 48, size - 48], fill=BRAND_LIGHT)
    draw.polygon([(size // 2, 70), (size - 70, size // 2 + 10), (size // 2, size - 60), (70, size // 2 + 10)], fill=GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 36)
    except OSError:
        font = ImageFont.load_default()
    draw.text((size // 2 - 40, size // 2 - 18), '亮叶', fill=WHITE, font=font)
    save(img, ROOT / 'logo.webp')
    save(img, ROOT / 'logo.png')


def make_avatar():
    size = 200
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([0, 0, size, size], fill=(230, 238, 234))
    draw.ellipse([60, 40, 140, 120], fill=BRAND_LIGHT)
    draw.arc([30, 90, 170, 220], start=200, end=340, fill=BRAND, width=12)
    save(img, ROOT / 'avatar.png')


def make_fingerprint():
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for i, r in enumerate([28, 22, 16, 10]):
        draw.arc([size // 2 - r, size // 2 - r, size // 2 + r, size // 2 + r],
                 start=200 + i * 10, end=340 - i * 10, fill=BRAND, width=3)
    save(img, ROOT / 'fingerprint.png')


def make_warranty(name, level, c1, c2):
    w, h = 400, 280
    img = gradient(w, h, c1, c2, 'v')
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([20, 20, 180, 60], radius=10, fill=GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 22)
    except OSError:
        font = ImageFont.load_default()
    draw.text((30, 28), level, fill=BRAND, font=font)
    draw.text((20, 100), name, fill=WHITE, font=font)
    draw.rounded_rectangle([20, 200, 380, 250], radius=12, outline=WHITE, width=2)
    save(img, ROOT / name)


def blank_tab(color=(0, 0, 0, 0)):
    return Image.new('RGBA', (TAB_SIZE, TAB_SIZE), color)


def save_icon(img, name):
    save(img, ICON / name)


def draw_home(draw, color):
    draw.polygon([(40, 18), (62, 34), (62, 58), (18, 58), (18, 34)], outline=color, width=4)
    draw.rectangle([34, 42, 46, 58], fill=color)


def draw_car_icon(draw, color):
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


def make_tab_pair(name, drawer):
    for suffix, color in [('.png', INACTIVE), ('_active.png', ACTIVE)]:
        img = blank_tab()
        d = ImageDraw.Draw(img)
        drawer(d, color)
        save_icon(img, f'{name}{suffix}')


def make_feature_icon(name, drawer):
    img = blank_tab()
    d = ImageDraw.Draw(img)
    drawer(d, ACTIVE)
    save_icon(img, name)


def icon_calculator(d, c):
    d.rounded_rectangle([20, 20, 61, 61], radius=6, outline=c, width=3)
    for i, y in enumerate([30, 42, 54]):
        d.line([(28, y), (53, y)], fill=c, width=3)


def icon_car_new(d, c):
    draw_car_icon(d, c)
    d.text((58, 14), 'N', fill=c)


def icon_car_used(d, c):
    draw_car_icon(d, c)
    d.text((54, 14), 'U', fill=c)


def icon_car_loan(d, c):
    draw_car_icon(d, c)
    d.ellipse([54, 12, 68, 26], outline=c, width=2)


def icon_car_clue(d, c):
    d.rounded_rectangle([22, 22, 59, 59], radius=8, outline=c, width=3)
    d.line([(30, 36), (51, 36)], fill=c, width=3)
    d.line([(30, 46), (51, 46)], fill=c, width=3)


def icon_car_finance(d, c):
    draw_car_icon(d, c)
    d.line([(18, 18), (28, 28)], fill=c, width=3)


def icon_tip(d, c):
    d.polygon([(40, 16), (62, 58), (18, 58)], outline=c, width=3)
    d.line([(40, 30), (40, 44)], fill=c, width=3)
    d.ellipse([38, 48, 42, 52], fill=c)


def icon_knowledge(d, c):
    d.rounded_rectangle([22, 18, 58, 62], radius=4, outline=c, width=3)
    d.line([(28, 30), (52, 30)], fill=c, width=2)
    d.line([(28, 40), (52, 40)], fill=c, width=2)
    d.line([(28, 50), (44, 50)], fill=c, width=2)


def icon_finance(d, c):
    draw_finance(d, c)


def icon_alipay(d, c):
    d.ellipse([18, 18, 63, 63], outline=c, width=4)
    d.text((30, 28), '支', fill=c)


def icon_default(d, c):
    d.rounded_rectangle([24, 24, 57, 57], radius=8, outline=c, width=3)


def icon_fuel(d, c):
    d.rounded_rectangle([24, 28, 57, 58], radius=6, outline=c, width=3)
    d.line([(32, 22), (49, 22)], fill=c, width=4)
    d.line([(40, 22), (40, 30)], fill=c, width=3)


def make_content_cover(folder, idx, label, badge, c1, c2, w=400, h=260):
    img = gradient(w, h, c1, c2)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([16, 16, 16 + len(badge) * 18 + 20, 48], radius=8, fill=GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 14)
        font_lg = ImageFont.truetype('arial.ttf', 22)
    except OSError:
        font = font_lg = ImageFont.load_default()
    draw.text((24, 24), badge[:8], fill=BRAND, font=font)
    draw.text((16, 80), label[:14], fill=WHITE, font=font_lg)
    save(img, ROOT / folder / f'{folder.split("/")[-1] if "/" in folder else folder}-{idx}.png')


def make_partner_avatar(name, idx, c1, c2):
    size = 160
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([0, 0, size, size], fill=c1)
    draw.ellipse([20, 20, size - 20, size - 20], fill=c2)
    try:
        font = ImageFont.truetype('arial.ttf', 48)
    except OSError:
        font = ImageFont.load_default()
    initial = name[0] if name else '亮'
    draw.text((size // 2 - 24, size // 2 - 28), initial, fill=WHITE, font=font)
    save(img, ROOT / 'channel' / f'avatar-{idx}.png')


def make_case_cover(idx, title, c1, c2):
    w, h = 400, 220
    img = gradient(w, h, c1, c2, 'v')
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([16, 16, 120, 48], radius=8, fill=GOLD)
    try:
        font = ImageFont.truetype('arial.ttf', 14)
        font_lg = ImageFont.truetype('arial.ttf', 20)
    except OSError:
        font = font_lg = ImageFont.load_default()
    draw.text((24, 24), '服务案例', fill=BRAND, font=font)
    draw.text((16, 70), title[:12], fill=WHITE, font=font_lg)
    save(img, ROOT / 'cases' / f'case-{idx}.png')


def icon_location(d, c):
    d.ellipse([28, 18, 53, 43], outline=c, width=4)
    d.ellipse([18, 18, 28, 28], fill=c)


def main():
    ensure_dirs()
    make_logo()
    make_avatar()
    make_fingerprint()

    # Content covers (products, news, cars, banners, etc.) are provided by
    # scripts/download_real_images.py — only generate if missing.
    def skip_if_exists(rel):
        return (ROOT / rel).exists()

    if not skip_if_exists('banner1.webp'):
        make_banner('banner1.webp', '新能源汽车金融服务', '新车 · 二手车 · 车抵贷一站式', (10, 50, 38), (26, 92, 68))
    if not skip_if_exists('banner2.webp'):
        make_banner('banner2.webp', '专精特新企业融资计划', '围绕企业成长周期定制资金方案', (20, 45, 70), (15, 61, 46))

    products = [
        ('新能源车购车', (12, 55, 42), (26, 100, 72)),
        ('二手车按揭', (30, 60, 50), (15, 61, 46)),
        ('车辆抵押咨询', (45, 55, 35), (80, 60, 40)),
        ('小微企业经营贷', (25, 70, 55), (10, 45, 35)),
        ('抵押类经营周转', (35, 50, 65), (20, 40, 60)),
        ('个人消费贷', (50, 45, 55), (25, 65, 50)),
        ('设备融资租赁', (40, 55, 45), (15, 55, 40)),
        ('民间借贷风险识别', (55, 40, 40), (30, 30, 35)),
        ('汽车延保服务', (20, 65, 55), (10, 50, 42)),
        ('金融进件系统', (30, 45, 60), (15, 61, 46)),
    ]
    for i, (name, c1, c2) in enumerate(products, 1):
        if not skip_if_exists(f'products/product-{i}.png'):
            make_product_cover(i, name, c1, c2)

    news_items = [
        ('行业新闻', (15, 61, 46), (26, 92, 68)),
        ('避坑常识', (60, 45, 35), (90, 55, 40)),
        ('行业知识', (25, 55, 50), (15, 61, 46)),
        ('政策分析', (20, 50, 70), (35, 70, 55)),
        ('汽车金融', (10, 45, 40), (26, 75, 60)),
        ('服务公告', (40, 60, 45), (15, 61, 46)),
    ]
    for i, (cat, c1, c2) in enumerate(news_items, 1):
        if not skip_if_exists(f'news/news-{i}.png'):
            make_news_cover(i, cat, c1, c2)

    cars = [
        ('比亚迪', (12, 55, 42), (26, 92, 68)),
        ('丰田', (30, 50, 45), (15, 61, 46)),
        ('特斯拉', (20, 40, 55), (10, 30, 45)),
        ('大众', (35, 45, 50), (20, 55, 40)),
        ('理想', (25, 60, 55), (15, 61, 46)),
        ('本田', (40, 55, 45), (25, 70, 55)),
    ]
    for i, (brand, c1, c2) in enumerate(cars, 1):
        if not skip_if_exists(f'cars/car-{i}.png'):
            make_car_cover(i, brand, c1, c2)

    if not skip_if_exists('warranty-basic.png'):
        make_warranty('warranty-basic.png', '基础延保', (30, 70, 55), (15, 61, 46))
    if not skip_if_exists('warranty-premium.png'):
        make_warranty('warranty-premium.png', '尊享延保', (50, 40, 35), (80, 55, 30))

    make_tab_pair('home', draw_home)
    make_tab_pair('car', draw_car_icon)
    make_tab_pair('product', draw_product)
    make_tab_pair('finance', draw_finance)
    make_tab_pair('user', draw_user)

    make_feature_icon('location.png', icon_location)
    make_feature_icon('calculator.png', icon_calculator)
    make_feature_icon('car-new.png', icon_car_new)
    make_feature_icon('car-used.png', icon_car_used)
    make_feature_icon('car-loan.png', icon_car_loan)
    make_feature_icon('car-clue.png', icon_car_clue)
    make_feature_icon('car-finance.png', icon_car_finance)
    make_feature_icon('tip.png', icon_tip)
    make_feature_icon('knowledge.png', icon_knowledge)
    make_feature_icon('finance.png', icon_finance)
    make_feature_icon('alipay.png', icon_alipay)
    make_feature_icon('default.png', icon_default)
    make_feature_icon('fuel.png', icon_fuel)

    knowledge_items = [
        ('融资课堂', '入门', (15, 61, 46), (26, 92, 68)),
        ('信用贷款', '进阶', (25, 55, 50), (15, 61, 46)),
        ('融资成本', '进阶', (30, 50, 65), (20, 40, 60)),
        ('供应链金融', '高级', (20, 45, 70), (35, 70, 55)),
        ('绿色金融', '政策', (12, 55, 42), (26, 100, 72)),
        ('车抵评估', '进阶', (40, 55, 45), (15, 61, 46)),
    ]
    for i, (label, badge, c1, c2) in enumerate(knowledge_items, 1):
        if not skip_if_exists(f'knowledge/knowledge-{i}.png'):
            make_content_cover('knowledge', i, label, badge, c1, c2)

    tips_items = [
        ('非法集资', '高风险', (180, 40, 40), (120, 20, 20)),
        ('贷款诈骗', '高风险', (170, 50, 35), (110, 30, 25)),
        ('合同条款', '中风险', (180, 120, 30), (140, 90, 20)),
        ('高利贷', '高风险', (160, 35, 50), (100, 20, 35)),
        ('税务风险', '中风险', (50, 70, 55), (30, 50, 40)),
        ('提前还款', '低风险', (40, 100, 60), (25, 70, 45)),
    ]
    for i, (label, badge, c1, c2) in enumerate(tips_items, 1):
        if not skip_if_exists(f'tips/tips-{i}.png'):
            make_content_cover('tips', i, label, badge, c1, c2)

    exposure_items = [
        ('虚假低息', '诈骗', (180, 40, 40), (100, 20, 20)),
        ('违规收费', '违规', (170, 90, 30), (120, 60, 15)),
        ('冒充银行', '虚假', (60, 45, 55), (35, 30, 40)),
        ('征信修复', '诈骗', (150, 50, 45), (90, 30, 30)),
    ]
    for i, (label, badge, c1, c2) in enumerate(exposure_items, 1):
        if not skip_if_exists(f'exposure/exposure-{i}.png'):
            make_content_cover('exposure', i, label, badge, c1, c2)

    partners = ['甬江助贷', '钱塘车贷', '绍兴产融', '亮叶官方']
    colors = [((15, 61, 46), (26, 92, 68)), ((30, 60, 50), (15, 61, 46)),
              ((40, 55, 45), (25, 70, 55)), ((50, 40, 35), (80, 55, 30))]
    for i, (name, (c1, c2)) in enumerate(zip(partners, colors), 1):
        make_partner_avatar(name, i, c1, c2)

    case_titles = ['餐饮经营贷', '车商周转', '车抵咨询']
    case_colors = [((25, 70, 55), (15, 61, 46)), ((12, 55, 42), (26, 92, 68)), ((30, 50, 65), (20, 40, 60))]
    for i, (title, (c1, c2)) in enumerate(zip(case_titles, case_colors), 1):
        if not skip_if_exists(f'cases/case-{i}.png'):
            make_case_cover(i, title, c1, c2)

    print('All assets generated successfully.')


if __name__ == '__main__':
    main()
