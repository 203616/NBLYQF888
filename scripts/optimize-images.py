#!/usr/bin/env python3
"""Batch compress PNG/JPEG to WebP and optionally remove originals."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DIRS = [
    ROOT / 'images',
    ROOT / 'subpackages' / 'product' / 'images',
    ROOT / 'subpackages' / 'news' / 'images',
    ROOT / 'subpackages' / 'cars' / 'images',
    ROOT / 'subpackages' / 'knowledge' / 'images',
    ROOT / 'subpackages' / 'tips' / 'images',
    ROOT / 'subpackages' / 'exposure' / 'images',
    ROOT / 'subpackages' / 'channel' / 'images',
    ROOT / 'subpackages' / 'cases' / 'images',
    ROOT / 'subpackages' / 'intake' / 'images',
    ROOT / 'subpackages' / 'autoFinance' / 'images',
]

SKIP_REMOVE = {'images/icon'}  # tabBar icons must stay PNG


def should_skip(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if rel.endswith('.webp'):
        return True
    if '/icon/' in rel and path.parent.name == 'icon':
        return False  # still convert, but do not remove png
    return False


def convert_file(src: Path, quality: int, max_width: int) -> dict | None:
    if src.suffix.lower() not in {'.png', '.jpg', '.jpeg'}:
        return None
    dst = src.with_suffix('.webp')
    before = src.stat().st_size
    with Image.open(src) as img:
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if 'A' in img.getbands() else 'RGB')
        w, h = img.size
        if max_width and w > max_width:
            ratio = max_width / w
            img = img.resize((max_width, int(h * ratio)), Image.Resampling.LANCZOS)
        save_kwargs = {'quality': quality, 'method': 6}
        if img.mode == 'RGBA':
            img.save(dst, 'WEBP', lossless=False, **save_kwargs)
        else:
            img.save(dst, 'WEBP', **save_kwargs)
    after = dst.stat().st_size
    return {
        'src': src.relative_to(ROOT).as_posix(),
        'webp': dst.relative_to(ROOT).as_posix(),
        'before': before,
        'after': after,
        'saved': before - after,
    }


def main():
    parser = argparse.ArgumentParser(description='Optimize mini program images to WebP')
    parser.add_argument('--quality', type=int, default=82)
    parser.add_argument('--max-width', type=int, default=750)
    parser.add_argument('--remove-original', action='store_true', help='仅当 WebP 更小时删除 PNG/JPG（默认保留原文件）')
    args = parser.parse_args()

    report = []
    total_before = 0
    total_after = 0
    removed = []

    for base in DEFAULT_DIRS:
        if not base.exists():
            continue
        for src in sorted(base.rglob('*')):
            if not src.is_file() or should_skip(src):
                continue
            row = convert_file(src, args.quality, args.max_width)
            if not row:
                continue
            report.append(row)
            total_before += row['before']
            total_after += row['after']
            rel_dir = src.parent.relative_to(ROOT).as_posix()
            can_remove = args.remove_original and row['after'] < row['before']
            if any(rel_dir.startswith(s) for s in SKIP_REMOVE):
                can_remove = False
            if can_remove:
                src.unlink()
                removed.append(row['src'])

    manifest = ROOT / 'scripts' / 'image-optimize-manifest.json'
    manifest.write_text(json.dumps({'items': report, 'removed': removed}, indent=2), encoding='utf-8')

    saved = total_before - total_after
    print(f'Converted {len(report)} files')
    print(f'Before: {total_before / 1024:.1f} KB')
    print(f'After:  {total_after / 1024:.1f} KB')
    print(f'Saved:  {saved / 1024:.1f} KB ({(saved / total_before * 100) if total_before else 0:.1f}%)')
    if removed:
        print(f'Removed {len(removed)} original files')
    print(f'Manifest: {manifest.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
