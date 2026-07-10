// ============================================
// 亮叶企服 H5 移动端 - 主应用程序
// ============================================
const API_BASE = '/api/v1'

// ========== 工具函数 ==========
function $(id) { return document.getElementById(id) }
function qs(s, ctx) { return (ctx||document).querySelector(s) }
function qsa(s, ctx) { return (ctx||document).querySelectorAll(s) }

function formatMoney(v) { return '¥' + Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
function el(tag, cls, html) { const e=document.createElement(tag); if(cls)e.className=cls; if(html)e.innerHTML=html; return e }

function api(path, opts) {
  return fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers||{}) },
    ...opts
  }).then(r => r.json()).catch(() => ({ code: -1, message: '网络错误', data: null }))
}

// ========== 导航系统 ==========
const PAGES = {
  home: 'tpl-home', products: 'tpl-products', calculator: 'tpl-calculator',
  cars: 'tpl-cars', valuation: 'tpl-valuation', fuel: 'tpl-fuel',
  news: 'tpl-news', knowledge: 'tpl-knowledge', tips: 'tpl-tips',
  financeCircle: 'tpl-financeCircle', service: 'tpl-service', channel: 'tpl-channel'
}

let currentPage = 'home'

function navigateTo(page) {
  currentPage = page
  const main = $('mainContent')
  const tpl = $(PAGES[page])
  if (!tpl) return
  main.innerHTML = tpl.innerHTML

  // 更新 tab 高亮
  qsa('.tab-item').forEach(t => { t.classList.toggle('active', t.dataset.page === page) })

  // 加载页面数据
  switch(page) {
    case 'home': loadHome(); break
    case 'products': loadProducts('all'); break
    case 'cars': loadCars(); break
    case 'calculator': initCalc(); break
    case 'valuation': initValuation(); break
    case 'fuel': loadFuel(); break
    case 'news': loadArticles('news', 'newsFullList'); break
    case 'knowledge': loadArticles('knowledge', 'knowledgeList'); break
    case 'tips': loadArticles('tips', 'tipsList'); break
    case 'financeCircle': loadFC(); break
    case 'channel': loadChannel(); break
  }

  // 滚动到顶部
  window.scrollTo(0, 0)
}

function toggleMenu() {
  document.getElementById('sideMenu').classList.toggle('open')
  document.getElementById('menuOverlay').classList.toggle('open')
}

// ========== 首页 ==========
const SERVICE_GRID = [
  { icon:'🏢', name:'经营贷', cat:'business' }, { icon:'👤', name:'消费贷', cat:'personal' },
  { icon:'🏠', name:'抵押贷', cat:'property' }, { icon:'⚙️', name:'融资租赁', cat:'lease' },
  { icon:'🚗', name:'新车按揭', cat:'newCar' }, { icon:'🔄', name:'二手车贷', cat:'usedCar' },
  { icon:'🔑', name:'车辆抵押', cat:'mortgage' }, { icon:'🛡️', name:'汽车延保', cat:'warranty' }
]

function loadHome() {
  // 服务网格
  const grid = $('serviceGrid')
  grid.innerHTML = SERVICE_GRID.map(s => `<div class="service-item" onclick="navigateTo('products')">
    <span class="svc-icon">${s.icon}</span><span class="svc-name">${s.name}</span>
  </div>`).join('')

  // 资讯
  api('/content/news').then(d => {
    const list = (d.data || d || []).slice(0, 4)
    if (!list.length) { $('newsSection').style.display = 'none'; return }
    $('newsList').innerHTML = list.map(n => `<div class="article-card" onclick="showArticleDetail('news',${n.id})">
      <span class="art-cat">${n.category||'资讯'}</span>
      <span class="art-title">${n.title||''}</span>
      <span class="art-meta">${n.date||''}${n.views ? ' · '+n.views+'次阅读' : ''}</span>
    </div>`).join('')
  })

  // 合作机构
  api('/home/').then(d => {
    const data = d.data || d
    const insts = (data.institutions || []).slice(0, 4)
    if (!insts.length) { $('instSection').style.display = 'none'; return }
    $('instGrid').innerHTML = insts.map(i => `<div class="inst-card">
      <div class="inst-name">${i.name||''}</div>
      <span class="inst-type">${i.type||''}</span>
      <span class="inst-prods">${i.products||''}</span>
    </div>`).join('')
  })
}

// ========== 产品大全 ==========
let allProducts = []

function loadProducts(cat) {
  api('/products').then(d => {
    const list = d.data || d || []
    allProducts = Array.isArray(list) ? list : []
    renderProducts(cat)
  })
}

function renderProducts(cat) {
  const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat)
  const grid = $('productGrid')
  if (!filtered.length) { grid.innerHTML = '<div style="grid-column:span 2;text-align:center;padding:40px;color:#999">暂无产品</div>'; return }
  grid.innerHTML = filtered.map(p => `<div class="product-card" onclick="showProductDetail(${p.id})">
    ${p.cover ? `<img class="p-cover" src="${p.cover}" alt="${p.name||''}" onerror="this.style.display='none'" />` : ''}
    <div class="p-name">${p.name||''}</div>
    <span class="p-rate">${p.rate||''}</span>
    <span class="p-desc">${(p.description||'').slice(0,30)}</span>
  </div>`).join('')
}

function filterProducts(cat, el) {
  qsa('.filter-tab').forEach(t => t.classList.remove('active'))
  el.classList.add('active')
  renderProducts(cat)
}

function showProductDetail(id) {
  api(`/products/${id}`).then(d => {
    const p = d.data || d
    if (!p || !p.id) return alert('加载产品详情失败')
    const main = $('mainContent')
    main.innerHTML = `<div class="page-content">
      <span class="back-link" onclick="navigateTo('products')" style="display:inline-block;margin-bottom:12px;color:var(--primary);cursor:pointer">← 返回产品列表</span>
      <div class="card"><h3>${p.name||''}</h3>
        <div class="result-row"><span class="label">利率</span><span class="value">${p.rate||'—'}</span></div>
        <div class="result-row"><span class="label">额度范围</span><span class="value">${p.amountRange||'—'}</span></div>
        <div class="result-row"><span class="label">期限范围</span><span class="value">${p.termRange||'—'}</span></div>
        <p style="margin-top:12px;font-size:14px;color:var(--text-secondary);line-height:1.7">${p.description||''}</p>
      </div>
      ${(p.materials||[]).length ? `<div class="card"><h3>申请材料</h3>${p.materials.map(m => '<div style="font-size:14px;color:var(--text-secondary);padding:4px 0">• '+m+'</div>').join('')}</div>` : ''}
      ${(p.process||[]).length ? `<div class="card"><h3>办理流程</h3>${p.process.map((s,i) => '<div style="font-size:14px;padding:6px 0"><strong>'+(i+1)+'.</strong> '+s+'</div>').join('')}</div>` : ''}
    </div>`
    window.scrollTo(0, 0)
  })
}

function showArticleDetail(type, id) {
  api(`/content/articles/${type}/${id}`).then(d => {
    const a = d.data || d
    if (!a) return alert('加载失败')
    const main = $('mainContent')
    main.innerHTML = `<div class="page-content">
      <span class="back-link" onclick="navigateTo('${type}')" style="display:inline-block;margin-bottom:12px;color:var(--primary);cursor:pointer">← 返回列表</span>
      <div class="card"><h3>${a.title||''}</h3>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">${a.category||''}${a.date ? ' · '+a.date : ''}</div>
        <div style="font-size:15px;color:var(--text);line-height:1.8">${(a.content||a.body||'<p style="color:#999">内容加载中...</p>').replace(/\n/g,'<br/>')}</div>
      </div>
    </div>`
    window.scrollTo(0, 0)
  }).catch(() => alert('加载失败'))
}

// ========== 文章列表 ==========
function loadArticles(type, containerId) {
  const endpoints = { news: '/content/news', knowledge: '/content/knowledge', tips: '/content/tips' }
  api(endpoints[type]).then(d => {
    const list = d.data || d || []
    const container = $(containerId)
    if (!Array.isArray(list) || !list.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:#999">暂无内容</div>'; return }
    container.innerHTML = list.map(a => `<div class="article-card" onclick="showArticleDetail('${type}',${a.id})">
      ${a.cover || a.img ? `<img class="art-img" src="${a.cover || a.img}" alt="${a.title||''}" onerror="this.style.display='none'" />` : ''}
      <div class="art-body">
        <span class="art-cat">${a.category||type}</span>
        <span class="art-title">${a.title||''}</span>
        <span class="art-meta">${a.date||''}${a.views ? ' · '+a.views+'次阅读' : ''}</span>
        ${a.summary ? '<span class="art-summary">'+a.summary.slice(0,80)+'</span>' : ''}
      </div>
    </div>`).join('')
  })
}

// ========== 金融计算器 ==========
const VEHICLE_BRANDS = ['大众','丰田','本田','日产','宝马','奔驰','奥迪','保时捷','沃尔沃','凯迪拉克','雷克萨斯','别克','福特','雪佛兰','现代','起亚','马自达','斯巴鲁','比亚迪','蔚来','小鹏','理想','特斯拉','吉利','长城','长安','奇瑞','五菱','红旗','领克','WEY','捷途','星途','哪吒','零跑','高合','极氪','阿维塔','问界','小米']

function initCalc() {
  const sel = $('cCarBrand')
  sel.innerHTML = '<option value="">请选择品牌</option>' + VEHICLE_BRANDS.map(b => `<option value="${b}">${b}</option>`).join('')
}

function switchCalcTab(tab, el) {
  qsa('.calc-nav-item').forEach(t => t.classList.remove('active'))
  el.classList.add('active')
  $('calcLoan').style.display = tab === 'loan' ? 'block' : 'none'
  $('calcCar').style.display = tab === 'car' ? 'block' : 'none'
  $('calcResult').style.display = 'none'
  $('calcSchedule').style.display = 'none'
}

function calcLoan() {
  const amount = parseFloat($('cLoanAmount').value) || 0
  const term = parseInt($('cLoanTerm').value) || 1
  const rate = parseFloat($('cAnnualRate').value) || 0
  const method = $('cMethod').value
  if (!amount || amount <= 0) return alert('请输入有效的贷款金额')
  showCalcResult(computeLoan(amount, term, rate, method))
}

function calcCarLoan() {
  const amount = parseFloat($('cCarLoanAmount').value) || parseFloat($('cInvoicePrice').value) * (1 - (parseFloat($('cDownRate').value)||30)/100) || 0
  const term = parseInt($('cCarTerm').value) || 60
  const rate = parseFloat($('cCarRate').value) || 3
  const paidMonths = parseInt($('cPaidMonths').value) || 0
  if (!amount || amount <= 0) return alert('请输入有效的贷款金额或开票价格')

  // 等本等息（车贷默认）
  const monthlyRate = rate / 100 / 12
  const monthlyPrincipal = amount / term
  const monthlyInterest = amount * monthlyRate
  const monthlyPayment = monthlyPrincipal + monthlyInterest
  const totalInterest = monthlyInterest * term
  const totalPayment = amount + totalInterest

  // 提前还款
  const penaltyRate = paidMonths <= 24 ? 5 : 0
  const paidPrincipal = monthlyPrincipal * paidMonths
  const remainingPrincipal = Math.max(0, amount - paidPrincipal)
  const penaltyAmount = remainingPrincipal * penaltyRate / 100
  const prepayTotal = remainingPrincipal + penaltyAmount

  const schedule = []
  for (let i = 1; i <= term; i++) {
    const remain = Math.max(0, amount - monthlyPrincipal * i)
    schedule.push({ period: i, payment: monthlyPayment, principal: monthlyPrincipal, interest: monthlyInterest, remaining: remain })
  }

  showCalcResult({
    monthlyPayment, monthlyPrincipal, monthlyInterest, totalInterest, totalPayment,
    methodLabel: '等本等息',
    prepay: { paidMonths, paidPrincipal, remainingPrincipal, penaltyRate, penaltyAmount, prepayTotal }
  }, schedule)
}

function computeLoan(amount, term, rate, method) {
  const monthlyRate = rate / 100 / 12
  let result = {}, schedule = []

  if (method === 'equal_payment') {
    if (rate === 0) {
      const mp = amount / term
      result = { monthlyPayment: mp, totalInterest: 0, totalPayment: amount, methodLabel: '等额本息' }
      for (let i=1; i<=term; i++) schedule.push({period:i, payment:mp, principal:mp, interest:0, remaining: amount-mp*i})
    } else {
      const factor = Math.pow(1+monthlyRate, term)
      const mp = amount * monthlyRate * factor / (factor - 1)
      let remain = amount, ti = 0
      for (let i=1; i<=term; i++) {
        const int = remain * monthlyRate
        const prin = mp - int
        remain = Math.max(0, remain - prin)
        ti += int
        schedule.push({period:i, payment:mp, principal:prin, interest:int, remaining: remain})
      }
      result = { monthlyPayment: mp, totalInterest: ti, totalPayment: amount+ti, methodLabel: '等额本息' }
    }
  } else if (method === 'equal_principal') {
    const mp = amount / term
    let ti = 0, remain = amount
    for (let i=1; i<=term; i++) {
      const int = remain * monthlyRate
      const pmt = mp + int
      remain -= mp
      ti += int
      schedule.push({period:i, payment:pmt, principal:mp, interest:int, remaining: Math.max(0, remain)})
    }
    result = { monthlyPrincipal: mp, firstPayment: schedule[0].payment, lastPayment: schedule[schedule.length-1].payment, totalInterest: ti, totalPayment: amount+ti, monthlyDecline: schedule.length>1 ? schedule[0].payment-schedule[1].payment : 0, methodLabel: '等额本金' }
  } else if (method === 'interest_first') {
    const mi = amount * monthlyRate
    let ti = 0
    for (let i=1; i<=term; i++) {
      const int = mi
      const prin = i===term ? amount : 0
      ti += int
      schedule.push({period:i, payment:int+prin, principal:prin, interest:int, remaining: i===term ? 0 : amount})
    }
    result = { monthlyInterest: mi, lastPayment: amount+mi, totalInterest: ti, totalPayment: amount+ti, methodLabel: '先息后本' }
  } else if (method === 'lump_sum') {
    const ti = amount * rate/100 * term/12
    const tp = amount + ti
    schedule.push({period:1, payment:tp, principal:amount, interest:ti, remaining:0})
    result = { totalInterest: ti, totalPayment: tp, monthlyEquivalent: tp/term, methodLabel: '一次性还本付息' }
  }
  return result
}

function showCalcResult(result, schedule) {
  $('calcResult').style.display = 'block'
  const list = $('calcResultList')
  const rows = []
  if (result.monthlyPayment !== undefined) rows.push({label:'每月还款', value: formatMoney(result.monthlyPayment), highlight:true})
  if (result.monthlyPrincipal !== undefined) rows.push({label:'每月本金', value: formatMoney(result.monthlyPrincipal)})
  if (result.monthlyInterest !== undefined) rows.push({label:'每月利息', value: formatMoney(result.monthlyInterest)})
  if (result.firstPayment !== undefined) rows.push({label:'首月还款', value: formatMoney(result.firstPayment)})
  if (result.lastPayment !== undefined) rows.push({label:'末月还款', value: formatMoney(result.lastPayment)})
  if (result.monthlyDecline !== undefined) rows.push({label:'月供递减', value: formatMoney(result.monthlyDecline)})
  if (result.monthlyEquivalent !== undefined) rows.push({label:'月均还款', value: formatMoney(result.monthlyEquivalent)})
  rows.push({label:'总利息', value: formatMoney(result.totalInterest), highlight:true})
  rows.push({label:'还款总额', value: formatMoney(result.totalPayment), highlight:true})
  list.innerHTML = rows.map(r => `<div class="result-row${r.highlight?' highlight':''}"><span class="label">${r.label}</span><span class="value">${r.value}</span></div>`).join('')

  // 提前还款
  if (result.prepay) {
    const p = result.prepay
    list.innerHTML += `<div style="border-top:1px dashed #ddd;margin:12px 0;padding-top:12px">
      <div style="font-size:15px;font-weight:600;color:var(--primary);margin-bottom:8px">📌 提前还款测算</div>
      <div class="result-row"><span class="label">已还期数</span><span class="value">${p.paidMonths}期</span></div>
      <div class="result-row"><span class="label">已还本金</span><span class="value">${formatMoney(p.paidPrincipal)}</span></div>
      <div class="result-row"><span class="label">剩余本金</span><span class="value">${formatMoney(p.remainingPrincipal)}</span></div>
      <div class="result-row"><span class="label">违约金比例</span><span class="value">${p.penaltyRate}%</span></div>
      <div class="result-row"><span class="label">违约金</span><span class="value">${formatMoney(p.penaltyAmount)}</span></div>
      <div class="result-row highlight"><span class="label">提前还款总额</span><span class="value">${formatMoney(p.prepayTotal)}</span></div>
    </div>`
  }

  if (schedule && schedule.length) {
    $('calcSchedule').style.display = 'block'
    $('scheduleCount').textContent = schedule.length + '期'
    $('scheduleList').innerHTML = '<div class="result-row" style="font-weight:bold;color:var(--primary);position:sticky;top:0;background:#fff;border-bottom:2px solid var(--primary)"><span>期次</span><span>月供</span><span>本金</span><span>利息</span></div>' +
      schedule.map(r => `<div class="result-row" style="font-size:13px"><span>${r.period}</span><span>${formatMoney(r.payment)}</span><span>${formatMoney(r.principal)}</span><span>${formatMoney(r.interest)}</span></div>`).join('')
  }

  $('calcResult').scrollIntoView({ behavior: 'smooth' })
}

function resetCalc() {
  if ($('calcResult')) $('calcResult').style.display = 'none'
  if ($('calcSchedule')) $('calcSchedule').style.display = 'none'
}

// ========== 车辆估值 ==========
function initValuation() {
  const sel = $('vBrand')
  sel.innerHTML = '<option value="">请选择品牌</option>' + VEHICLE_BRANDS.map(b => `<option value="${b}">${b}</option>`).join('')
  const yearSel = $('vYear')
  const y = new Date().getFullYear()
  yearSel.innerHTML = Array.from({length: 20}, (_,i) => `<option value="${y-i}">${y-i}年</option>`).join('')
}

function estimateValue() {
  const brand = $('vBrand').value
  const model = $('vModel').value
  const year = parseInt($('vYear').value) || 0
  const mileage = parseFloat($('vMileage').value) || 0
  if (!brand) return alert('请选择车辆品牌')
  if (!model) return alert('请输入车型')

  // 模拟估值（对接真实API）
  const basePrice = { '宝马':250000, '奔驰':280000, '奥迪':220000, '大众':150000, '丰田':180000, '本田':160000, '比亚迪':150000, '特斯拉':260000, '理想':300000, '蔚来':350000, '小鹏':200000, '问界':280000 }
  const base = basePrice[brand] || 150000
  const age = Math.max(1, new Date().getFullYear() - year)
  const dep = Math.min(0.8, age * 0.08 + mileage * 0.02)
  const estimate = Math.round(base * (1 - dep) / 1000) * 1000
  const rangeLow = Math.round(estimate * 0.9 / 1000) * 1000
  const rangeHigh = Math.round(estimate * 1.1 / 1000) * 1000

  $('valuationResult').style.display = 'block'
  $('valuationBody').innerHTML = `
    <div class="result-row highlight"><span class="label">参考估值</span><span class="value">¥${(estimate/10000).toFixed(1)}万</span></div>
    <div class="result-row"><span class="label">估值范围</span><span class="value">¥${(rangeLow/10000).toFixed(1)}万 ~ ¥${(rangeHigh/10000).toFixed(1)}万</span></div>
    <div class="result-row"><span class="label">车辆信息</span><span class="value">${brand} ${model} ${year}年</span></div>
    <div class="result-row"><span class="label">行驶里程</span><span class="value">${mileage}万公里</span></div>
    <div style="margin-top:12px;padding:10px;background:var(--primary-bg);border-radius:8px;font-size:13px;color:var(--text-secondary);line-height:1.7">
      💡 本估值为参考价格，实际成交价以车况检测和市场行情为准。<br/>如需精准估值，建议联系评估师实地验车。
    </div>
  `
  $('valuationResult').scrollIntoView({ behavior: 'smooth' })
  // 调用真实API
  api('/tools/valuation', { method:'POST', body:JSON.stringify({brand, model, year, mileage}) }).catch(() => {})
}

// ========== 油价查询 ==========
function loadFuel() {
  $('fuelList').innerHTML = '<div class="loading-spinner"></div>'
  api('/tools/fuel?city=宁波市').then(json => {
    const prices = json.data?.current?.prices || json.prices || []
    if (!prices.length) { $('fuelList').innerHTML = '<p style="color:#999;font-size:14px;text-align:center">暂无可用的油价数据</p>'; return }
    $('fuelList').innerHTML = prices.map(p => `<div class="result-row"><span class="label">${p.name||'—'}</span><span class="value">${p.price||'—'} 元/L</span></div>`).join('')
  })
}

// ========== 亮叶好车 ==========
function loadCars() {
  $('carsLoading').style.display = 'block'
  const grid = $('carGrid')
  grid.innerHTML = ''
  api('/cars').then(d => {
    const list = d.data || d || []
    if (!Array.isArray(list) || !list.length) { $('carsLoading').textContent = '暂无车源信息'; return }
    $('carsLoading').style.display = 'none'
    grid.innerHTML = list.map(c => `<div class="car-card" onclick="showCarDetail(${c.id})">
      <div class="car-name">${c.name||c.title||''}</div>
      <span class="car-price">${c.price||''}</span>
      <span class="car-meta">${c.year||''}${c.mileage ? ' · '+c.mileage+'万公里' : ''}</span>
    </div>`).join('')
  }).catch(() => { $('carsLoading').textContent = '加载失败，请稍后重试' })
}

function showCarDetail(id) {
  api(`/cars/${id}`).then(d => {
    const c = d.data || d
    if (!c) return alert('加载车源详情失败')
    const main = $('mainContent')
    main.innerHTML = `<div class="page-content">
      <span class="back-link" onclick="navigateTo('cars')" style="display:inline-block;margin-bottom:12px;color:var(--primary);cursor:pointer">← 返回车源列表</span>
      <div class="card"><h3>${c.name||c.title||''}</h3>
        <div class="result-row highlight"><span class="label">价格</span><span class="value">${c.price||'面议'}</span></div>
        ${c.year ? `<div class="result-row"><span class="label">上牌年份</span><span class="value">${c.year}年</span></div>` : ''}
        ${c.mileage ? `<div class="result-row"><span class="label">行驶里程</span><span class="value">${c.mileage}万公里</span></div>` : ''}
        ${c.color ? `<div class="result-row"><span class="label">车身颜色</span><span class="value">${c.color}</span></div>` : ''}
        ${c.description ? `<p style="margin-top:12px;font-size:14px;color:var(--text-secondary);line-height:1.7">${c.description}</p>` : ''}
        <div style="margin-top:16px"><button class="btn btn-accent" onclick="navigateTo('service')">💬 咨询客服</button></div>
      </div>
    </div>`
    window.scrollTo(0, 0)
  })
}

// ========== 易融圈 ==========
let fcData = []

function loadFC() {
  $('fcLoading').style.display = 'block'
  api('/demands').then(d => {
    const list = d.data || d || []
    fcData = Array.isArray(list) ? list : []
    $('fcLoading').style.display = 'none'
    renderFC('all')
  }).catch(() => { $('fcLoading').textContent = '加载失败' })
}

function filterFC(type, el) {
  qsa('#fcTabs .filter-tab').forEach(t => t.classList.remove('active'))
  el.classList.add('active')
  renderFC(type)
}

function renderFC(type) {
  const filtered = type === 'all' ? fcData : fcData.filter(d => d.type === type)
  const list = $('fcList')
  if (!filtered.length) { list.innerHTML = '<div style="text-align:center;padding:40px;color:#999">暂无需求</div>'; return }
  list.innerHTML = filtered.map(d => `<div class="demand-card">
    <div class="d-top"><span class="d-type">${d.type==='funding'?'找资金':'供资金'}</span><span style="font-size:12px;color:var(--text-muted)">${d.status||''}</span></div>
    <span class="d-title">${d.title||''}</span>
    <div class="d-meta">${d.amount||''}${d.period ? ' · '+d.period : ''}${d.city ? ' · '+d.city : ''}</div>
  </div>`).join('')
}

// ========== 智能客服 ==========
function sendChat() {
  const input = $('chatInput')
  const text = input.value.trim()
  if (!text) return
  input.value = ''

  const box = $('chatBox')
  box.appendChild(el('div', 'chat-msg user-msg', `<div class="msg-avatar">👤</div><div class="msg-content">${text.replace(/\n/g,'<br/>')}</div>`))
  box.scrollTop = box.scrollHeight

  const loadingDiv = el('div', 'chat-msg bot-msg', '<div class="msg-avatar">🤖</div><div class="msg-content" style="color:#999">思考中...</div>')
  box.appendChild(loadingDiv)

  // 本地 FAQ 匹配（API 离线备用）
  const faqMatch = localFAQs.find(f => text.includes(f.keyword))
  if (faqMatch) {
    setTimeout(() => {
      loadingDiv.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content">${faqMatch.answer.replace(/\n/g,'<br/>')}</div>`
      box.scrollTop = box.scrollHeight
    }, 300)
    return
  }

  api('/service/chat', { method:'POST', body:JSON.stringify({ message: text, source: 'mobile' }) }).then(d => {
    const answer = d.data?.reply || d.data?.answer || d.reply || d.answer || '抱歉，我暂时无法回答这个问题，请稍后重试。'
    loadingDiv.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content">${answer.replace(/\n/g,'<br/>')}</div>`
    box.scrollTop = box.scrollHeight
  }).catch(() => {
    loadingDiv.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-content">网络异常，请稍后重试。您可以拨打客服热线 400-xxx-xxxx 获取帮助。</div>'
  })
}

// 本地 FAQ 库（API 不可用时自动匹配）
const localFAQs = [
  { keyword: '利率', answer: '亮叶企服产品年化利率范围约 3.6%–24%，具体以持牌机构审批结果为准。' },
  { keyword: '额度', answer: '贷款额度根据个人/企业资质、收入、抵押物等综合评估，一般 1 万–500 万元不等。' },
  { keyword: '材料', answer: '通常需要身份证明、收入/经营流水、征信授权书、用途证明等，具体以机构要求为准。' },
  { keyword: '期限', answer: '贷款期限灵活可选，短至 3 期（3 个月），长至 60 期（5 年）。' },
  { keyword: '还款', answer: '支持等额本息、等额本金、先息后本、一次性还本付息等多种还款方式。' },
  { keyword: '征信', answer: '大部分合作机构需要查询个人征信，良好的征信记录有助于获得更优的利率和额度。' },
  { keyword: '保证', answer: '亮叶企服不收取任何前置费用，不发放贷款，仅提供信息咨询与撮合服务。' },
  { keyword: '客服', answer: '如需人工帮助，请在公众号留言或拨打客服热线，工作日 9:00-18:00 在线。' },
  { keyword: '经营', answer: '企业经营贷通常需要营业执照满 1 年、有开票纳税记录、经营流水等材料。' },
  { keyword: '车', answer: '汽车金融产品包括新车分期、二手车分期、车抵贷等，支持等本等息还款方式。' }
]

function quickAsk(text) {
  $('chatInput').value = text
  sendChat()
}

// ========== 助融渠道 ==========
function loadChannel() {
  $('channelLoading').textContent = '加载渠道列表...'
  api('/channels').then(d => {
    const list = d.data || d || []
    if (!Array.isArray(list) || !list.length) { $('channelLoading').textContent = '暂无可用的助融渠道'; return }
    $('channelLoading').style.display = 'none'
    $('channelList').innerHTML = list.map(ch => `<div class="card" style="cursor:default">
      <h3>${ch.name||''}</h3>
      <div style="font-size:14px;color:var(--text-secondary)">${ch.description||''}</div>
      ${ch.products ? '<div style="margin-top:8px;font-size:13px;color:var(--primary)">产品: '+ch.products+'</div>' : ''}
      ${ch.contact ? '<div style="margin-top:4px;font-size:13px;color:var(--text-muted)">📞 '+ch.contact+'</div>' : ''}
    </div>`).join('')
  }).catch(() => { $('channelLoading').textContent = '加载失败' })
}

// ========== 启动 ==========
document.addEventListener('DOMContentLoaded', () => navigateTo('home'))
