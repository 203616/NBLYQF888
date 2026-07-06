#!/usr/bin/env python3
"""
从 WebP 还原 PNG 回退图（仅新增文件，不删除 WebP）。
主包 banner 的 PNG 回退放在 subpackages/banner/images/，避免主包膨胀。
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

# 主包 WebP → 分包 PNG 回退（主包不放大图 PNG）
MAIN_BANNER_FALLBACKS = {
    'images/banner1.webp': 'subpackages/banner/images/banner1.png',
    'images/banner2.webp': 'subpackages/banner/images/banner2.png',
    'images/banner3.webp': 'subpackages/banner/images/banner3.png',
    'images/logo.webp': 'subpackages/banner/images/logo.png',
    'images/avatar.webp': 'subpackages/banner/images/avatar.png',
}

SKIP_DIRS = {'node_modules', 'apps', '.git', 'dist', 'cloudfunctions'}


def webp_to_png(src: Path, dst: Path) -> dict:
    dst.parent.mkdir(parents=True, exist_ok=True)
    before = src.stat().st_size
    with Image.open(src) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')
        img.save(dst, 'PNG', optimize=True)
    after = dst.stat().st_size
    return {
        'webp': src.relative_to(ROOT).as_posix(),
        'png': dst.relative_to(ROOT).as_posix(),
        'webpSize': before,
        'pngSize': after,
    }


def main():
    created = []
    skipped = []

    for webp_rel, png_rel in MAIN_BANNER_FALLBACKS.items():
        src = ROOT / webp_rel
        dst = ROOT / png_rel
        if not src.exists():
            skipped.append({'webp': webp_rel, 'reason': 'webp missing'})
            continue
        if dst.exists():
            skipped.append({'png': png_rel, 'reason': 'already exists'})
            continue
        created.append(webp_to_png(src, dst))

    for webp in sorted(ROOT.rglob('*.webp')):
        rel = webp.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if rel.as_posix() in MAIN_BANNER_FALLBACKS:
            continue
        png = webp.with_suffix('.png')
        if png.exists():
            continue
        created.append(webp_to_png(webp, png))

    manifest = ROOT / 'scripts' / 'image-fallback-manifest.json'
    manifest.write_text(
        json.dumps({'created': created, 'skipped': skipped}, indent=2, ensure_ascii=False),
        encoding='utf-8',
    )
    print(f'Created {len(created)} PNG fallbacks')
    print(f'Skipped {len(skipped)} entries')
    print(f'Manifest: {manifest.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
