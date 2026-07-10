const express = require('express')
const db = require('../db')
const { ok } = require('../utils/response')
const mock = require('../../../../api/mock')

const router = express.Router()

function fixCoverPath(cover) {
  if (!cover || typeof cover !== 'string') return cover
  if (cover.startsWith('/images/products/')) {
    return cover.replace('/images/products/', '/subpackages/product/images/products/')
  }
  if (cover.startsWith('/images/news/')) {
    return cover.replace('/images/news/', '/subpackages/news/images/news/')
  }
  return cover
}

function mapRow(row) {
  if (!row || typeof row !== 'object') return row
  const out = { ...row }
  if (out.cover) out.cover = fixCoverPath(out.cover)
  if (out.img) out.img = fixCoverPath(out.img)
  return out
}

router.get('/', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE status = ? ORDER BY sort ASC, id ASC').all('published').map(mapRow)
  const stats = db.prepare('SELECT label, value FROM site_stats ORDER BY sort ASC, id ASC').all()
  const serviceScenes = db.prepare('SELECT scene_id AS id, title, desc, icon, path FROM service_scenes ORDER BY sort ASC, id ASC').all()
  const newsList = db.prepare('SELECT id, category, title, summary, published_at AS date, source, views, cover FROM articles WHERE type = ? AND status = ? ORDER BY published_at DESC LIMIT 4').all('news', 'published').map(mapRow)
  const products = db.prepare('SELECT * FROM products WHERE status = ? ORDER BY sort ASC, id ASC LIMIT 8').all('published').map(mapRow)
  const demands = db.prepare('SELECT * FROM demands ORDER BY created_at DESC, id DESC LIMIT 3').all().map(mapRow)
  const cases = db.prepare('SELECT * FROM success_cases WHERE status = ? ORDER BY sort ASC, id ASC').all('published').map(mapRow)
  const categoryProducts = {};
  ['business', 'personal', 'property', 'auto'].forEach(cat => {
    const rows = db.prepare('SELECT * FROM products WHERE status = ? AND category = ? ORDER BY sort ASC, id ASC LIMIT 3').all('published', cat).map(mapRow);
    categoryProducts[cat] = rows;
  });
  ok(res, {
    banners,
    stats,
    serviceScenes,
    newsList,
    products,
    demands,
    cases,
    categoryNav: mock.homeCategoryNav,
    institutions: mock.ningboInstitutions,
    categoryProducts
  })
})

router.get('/banners/:id', (req, res) => {
  const banner = db.prepare('SELECT id, img, title, desc, link FROM banners WHERE id = ? AND status = ?').get(Number(req.params.id), 'published')
  if (!banner) return ok(res, null)
  ok(res, {
    title: banner.title,
    content: banner.desc,
    image: banner.img,
    link: banner.link
  })
})

module.exports = router
