const express = require('express')
const db = require('../db')
const { ok } = require('../utils/response')
const mock = require('../../../../api/mock')

const router = express.Router()

router.get('/', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE status = ? ORDER BY sort ASC, id ASC').all('published')
  const stats = db.prepare('SELECT label, value FROM site_stats ORDER BY sort ASC, id ASC').all()
  const serviceScenes = db.prepare('SELECT scene_id AS id, title, desc, icon, path FROM service_scenes ORDER BY sort ASC, id ASC').all()
  const newsList = db.prepare('SELECT id, category, title, summary, published_at AS date, source, views, cover FROM articles WHERE type = ? AND status = ? ORDER BY published_at DESC LIMIT 4').all('news', 'published')
  const products = db.prepare('SELECT * FROM products WHERE status = ? ORDER BY sort ASC, id ASC LIMIT 8').all('published')
  const demands = db.prepare('SELECT * FROM demands ORDER BY created_at DESC, id DESC LIMIT 3').all()
  const cases = db.prepare('SELECT * FROM success_cases WHERE status = ? ORDER BY sort ASC, id ASC').all('published')
  const categoryProducts = {
    business: mock.products.filter(p => p.category === 'business').slice(0, 3),
    personal: mock.products.filter(p => p.category === 'personal').slice(0, 3),
    property: mock.products.filter(p => p.category === 'property').slice(0, 3),
    auto: mock.products.filter(p => p.category === 'auto').slice(0, 3)
  }
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
