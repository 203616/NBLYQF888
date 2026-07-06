function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const hour = `${d.getHours()}`.padStart(2, '0')
  const minute = `${d.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

function showError(message) {
  wx.showToast({ title: message || '操作失败', icon: 'none' })
}

module.exports = {
  formatTime,
  formatDate,
  debounce,
  validatePhone,
  showError
}
