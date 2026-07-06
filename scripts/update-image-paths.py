#!/usr/bin/env python3
"""Update image path references after subpackage migration."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'node_modules', '.git', 'apps', 'dist', 'image-optimize-manifest.json'}

REPLACEMENTS = [
    ('/images/products/', '/subpackages/product/images/products/'),
    ('/images/news/', '/subpackages/news/images/news/'),
    ('/images/cars/', '/subpackages/cars/images/cars/'),
    ('/images/knowledge/', '/subpackages/knowledge/images/knowledge/'),
    ('/images/tips/', '/subpackages/tips/images/tips/'),
    ('/images/exposure/', '/subpackages/exposure/images/exposure/'),
    ('/images/channel/', '/subpackages/channel/images/channel/'),
    ('/images/cases/', '/subpackages/cases/images/cases/'),
    ('/images/intake/', '/subpackages/intake/images/intake/'),
    ('/images/warranty-basic.png', '/subpackages/autoFinance/images/warranty-basic.webp'),
    ('/images/warranty-premium.png', '/subpackages/autoFinance/images/warranty-premium.webp'),
    ('/images/banner1.png', '/images/banner1.webp'),
    ('/images/banner2.png', '/images/banner2.webp'),
    ('/images/banner3.png', '/images/banner3.webp'),
    ('/images/avatar.png', '/images/avatar.webp'),
]

EXTS = {'.js', '.wxml', '.wxss', '.json', '.md', '.py'}
SKIP_FILES = {'utils/assets.js'}


def should_process(path: Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP:
        return False
    rel = path.relative_to(ROOT).as_posix()
    if rel in SKIP_FILES:
        return False
    return path.suffix in EXTS and path.name != 'update-image-paths.py'


def migrate_text(text: str) -> str:
    out = text
    for old, new in REPLACEMENTS:
        out = out.replace(old, new)
    # png/jpeg -> webp for migrated subpackage assets (not tab icons)
    for prefix in [
        '/subpackages/product/images/products/',
        '/subpackages/news/images/news/',
        '/subpackages/cars/images/cars/',
        '/subpackages/knowledge/images/knowledge/',
        '/subpackages/tips/images/tips/',
        '/subpackages/exposure/images/exposure/',
        '/subpackages/channel/images/channel/',
        '/subpackages/cases/images/cases/',
        '/subpackages/intake/images/intake/',
    ]:
        if prefix in out:
            import re
            out = re.sub(re.escape(prefix) + r'([^"\']+)\.(png|jpe?g)', lambda m: f'{prefix}{m.group(1)}.webp', out)
    return out


def main():
    changed = []
    for path in ROOT.rglob('*'):
        if not path.is_file() or not should_process(path):
            continue
        text = path.read_text(encoding='utf-8')
        new_text = migrate_text(text)
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            changed.append(path.relative_to(ROOT))
    print(f'Updated {len(changed)} files')
    for p in changed[:30]:
        print(f'  {p}')
    if len(changed) > 30:
        print(f'  ... and {len(changed) - 30} more')


if __name__ == '__main__':
    main()
