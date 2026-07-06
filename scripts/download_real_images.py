"""Download royalty-free stock photos (Unsplash License) for mini program covers."""
import io
import ssl
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'images'
TIMEOUT = 30

# Unsplash direct URLs — free for commercial use under Unsplash License
ASSETS = {
    'banner1.png': ('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=750&h=360&fit=crop', (750, 360)),
    'banner2.png': ('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=750&h=360&fit=crop', (750, 360)),
    'products/product-1.png': ('https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop', (400, 300)),
    'products/product-2.png': ('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', (400, 300)),
    'products/product-3.png': ('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop', (400, 300)),
    'products/product-4.png': ('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', (400, 300)),
    'products/product-5.png': ('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', (400, 300)),
    'products/product-6.png': ('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop', (400, 300)),
    'products/product-7.png': ('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop', (400, 300)),
    'products/product-8.png': ('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', (400, 300)),
    'products/product-9.png': ('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop', (400, 300)),
    'products/product-10.png': ('https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop', (400, 300)),
    'news/news-1.png': ('https://images.unsplash.com/photo-1504711434967-e33886168f5c?w=400&h=260&fit=crop', (400, 260)),
    'news/news-2.png': ('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=260&fit=crop', (400, 260)),
    'news/news-3.png': ('https://images.unsplash.com/photo-1551836022-d5d286e2458b?w=400&h=260&fit=crop', (400, 260)),
    'news/news-4.png': ('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=260&fit=crop', (400, 260)),
    'news/news-5.png': ('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=260&fit=crop', (400, 260)),
    'news/news-6.png': ('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=260&fit=crop', (400, 260)),
    'cars/car-1.png': ('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=280&fit=crop', (400, 280)),
    'cars/car-2.png': ('https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=280&fit=crop', (400, 280)),
    'cars/car-3.png': ('https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=280&fit=crop', (400, 280)),
    'cars/car-4.png': ('https://images.unsplash.com/photo-1614200187526-dc7d5729d992?w=400&h=280&fit=crop', (400, 280)),
    'cars/car-5.png': ('https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=280&fit=crop', (400, 280)),
    'cars/car-6.png': ('https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=280&fit=crop', (400, 280)),
    'knowledge/knowledge-1.png': ('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=260&fit=crop', (400, 260)),
    'knowledge/knowledge-2.png': ('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=260&fit=crop', (400, 260)),
    'knowledge/knowledge-3.png': ('https://images.unsplash.com/photo-1554224155-8d04bc21ae6b?w=400&h=260&fit=crop', (400, 260)),
    'knowledge/knowledge-4.png': ('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=260&fit=crop', (400, 260)),
    'knowledge/knowledge-5.png': ('https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=260&fit=crop', (400, 260)),
    'knowledge/knowledge-6.png': ('https://images.unsplash.com/photo-1556760544-74093570a6bf?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-1.png': ('https://images.unsplash.com/photo-1563013547-824ae1b704d3?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-2.png': ('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-3.png': ('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-4.png': ('https://images.unsplash.com/photo-1579621970795-87f3d5e3e3c6?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-5.png': ('https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=260&fit=crop', (400, 260)),
    'tips/tips-6.png': ('https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=260&fit=crop', (400, 260)),
    'exposure/exposure-1.png': ('https://images.unsplash.com/photo-1556740749-887f6717e7be?w=400&h=260&fit=crop', (400, 260)),
    'exposure/exposure-2.png': ('https://images.unsplash.com/photo-1563013547-824ae1b704d3?w=400&h=260&fit=crop', (400, 260)),
    'exposure/exposure-3.png': ('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=260&fit=crop', (400, 260)),
    'exposure/exposure-4.png': ('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=260&fit=crop', (400, 260)),
    'cases/case-1.png': ('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=260&fit=crop', (400, 260)),
    'cases/case-2.png': ('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=260&fit=crop', (400, 260)),
    'cases/case-3.png': ('https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=400&h=260&fit=crop', (400, 260)),
    'warranty-basic.png': ('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=280&fit=crop', (400, 280)),
    'warranty-premium.png': ('https://images.unsplash.com/photo-1625047509248-ec889cbff653?w=400&h=280&fit=crop', (400, 280)),
    'intake/basic.png': ('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop', (200, 200)),
    'intake/personal.png': ('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', (200, 200)),
    'intake/vehicle.png': ('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop', (200, 200)),
    'intake/finance.png': ('https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200&h=200&fit=crop', (200, 200)),
    'intake/work.png': ('https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=200&h=200&fit=crop', (200, 200)),
    'intake/income.png': ('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop', (200, 200)),
    'intake/upload.png': ('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=200&fit=crop', (200, 200)),
    'intake/contacts.png': ('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop', (200, 200)),
    'intake/audit.png': ('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop', (200, 200)),
    'intake/disburse.png': ('https://images.unsplash.com/photo-1556740749-887f6717e7be?w=200&h=200&fit=crop', (200, 200)),
    'intake/archive.png': ('https://images.unsplash.com/photo-1568667256548-094345857637?w=200&h=200&fit=crop', (200, 200)),
    'intake/collection.png': ('https://images.unsplash.com/photo-1551836022-d5d286e2458b?w=200&h=200&fit=crop', (200, 200)),
}


def download(url):
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
        return resp.read()


def download_with_fallback(url, seed, size):
    try:
        return download(url)
    except Exception:
        w, h = size
        fallback = f'https://picsum.photos/seed/liangye{seed}/{w}/{h}'
        return download(fallback)


def save_image(data, dest, size):
    img = Image.open(io.BytesIO(data)).convert('RGB')
    img = img.resize(size, Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, 'PNG', optimize=True)


def main():
    ok, fail = 0, 0
    for rel, (url, size) in ASSETS.items():
        dest = ROOT / rel
        try:
            save_image(download_with_fallback(url, rel.replace('/', '-'), size), dest, size)
            print(f'OK  {rel}')
            ok += 1
        except Exception as exc:
            print(f'FAIL {rel}: {exc}')
            fail += 1
    print(f'Done: {ok} ok, {fail} failed')


if __name__ == '__main__':
    main()
