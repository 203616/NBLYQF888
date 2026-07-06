#!/usr/bin/env python3
"""Move heavy image folders from main package to subpackages."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

MOVES = [
    ('images/products', 'subpackages/product/images/products'),
    ('images/news', 'subpackages/news/images/news'),
    ('images/cars', 'subpackages/cars/images/cars'),
    ('images/knowledge', 'subpackages/knowledge/images/knowledge'),
    ('images/tips', 'subpackages/tips/images/tips'),
    ('images/exposure', 'subpackages/exposure/images/exposure'),
    ('images/channel', 'subpackages/channel/images/channel'),
    ('images/cases', 'subpackages/cases/images/cases'),
    ('images/intake', 'subpackages/intake/images/intake'),
    ('images/warranty-basic.png', 'subpackages/autoFinance/subpackages/autoFinance/images/warranty-basic.webp'),
    ('images/warranty-premium.png', 'subpackages/autoFinance/subpackages/autoFinance/images/warranty-premium.webp'),
]


def move_all():
    for src_rel, dst_rel in MOVES:
        src = ROOT / src_rel
        dst = ROOT / dst_rel
        if not src.exists():
            print(f'SKIP missing: {src_rel}')
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            if dst.is_dir():
                shutil.rmtree(dst)
            else:
                dst.unlink()
        shutil.move(str(src), str(dst))
        print(f'MOVED {src_rel} -> {dst_rel}')


if __name__ == '__main__':
    move_all()
    print('Done. Update path references in utils/assets.js and mock data.')
