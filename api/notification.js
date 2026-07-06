const { get, post } = require('../utils/request')

const { getConfig } = require('../utils/config')

const mock = require('./mock')



function contactPhone() {

  const phone = wx.getStorageSync('userPhone') || ''

  return String(phone).replace(/\D/g, '')

}



function getNotifications() {

  const phone = contactPhone()

  if (getConfig().useMockFallback) {

    return Promise.resolve(mock.notifications)

  }

  return get('/notifications/mine', { phone }, { showError: false })

    .then(rows => rows || [])

    .catch(() => get('/notifications', {}, { showError: false }).then(rows => rows || []))

}



function getUnreadCount() {

  const phone = contactPhone()

  if (getConfig().useMockFallback) {

    return Promise.resolve(mock.notifications.filter(n => n.status === 'unread').length)

  }

  return get('/notifications/unread-count', { phone }, { showError: false })

    .then(res => Number(res?.count || 0))

    .catch(() => 0)

}



function markNotificationRead(id) {

  if (getConfig().useMockFallback) {

    return Promise.resolve(true)

  }

  return post(`/notifications/${id}/read`, {})

}



function markAllNotificationsRead() {

  if (getConfig().useMockFallback) {

    return Promise.resolve(true)

  }

  return post('/notifications/read-all', {})

}



module.exports = {

  getNotifications,

  getUnreadCount,

  markNotificationRead,

  markAllNotificationsRead

}

