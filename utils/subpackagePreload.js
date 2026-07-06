/**
 * 分包预下载 — 仅下载分包资源，不影响主包编译
 */
const PRELOAD_BY_PAGE = {
  'pages/home/home': ['product', 'intake', 'autoFinance', 'news'],
  'pages/autoService/autoService': ['autoFinance', 'clue', 'cars'],
  'pages/products/products': ['product', 'intake'],
  'pages/financeCircle/financeCircle': ['demand', 'social', 'channel'],
  'pages/profile/profile': ['profile', 'intake', 'service']
}

function preloadSubpackages(names = []) {
  if (!wx.loadSubpackage) return Promise.resolve()
  const unique = [...new Set(names.filter(Boolean))]
  return Promise.all(
    unique.map(name => new Promise(resolve => {
      wx.loadSubpackage({
        name,
        success: () => resolve({ name, ok: true }),
        fail: () => resolve({ name, ok: false })
      })
    }))
  )
}

function preloadForPage(pagePath) {
  const names = PRELOAD_BY_PAGE[pagePath] || []
  return preloadSubpackages(names)
}

module.exports = { preloadSubpackages, preloadForPage, PRELOAD_BY_PAGE }
