/**
 * 进件离线同步重试队列（API 不可达时暂存，恢复后自动 flush）
 */
const STORAGE_KEY = 'intake_sync_queue_v1'
const MAX_ITEMS = 20

function loadQueue() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function saveQueue(list) {
  wx.setStorageSync(STORAGE_KEY, list.slice(0, MAX_ITEMS))
}

function enqueue(payload, reason = '') {
  if (!payload || !payload.meta?.applicationNo) return false
  const list = loadQueue().filter(item => item.payload?.meta?.applicationNo !== payload.meta.applicationNo)
  list.unshift({
    payload,
    reason: reason || 'sync_failed',
    queuedAt: new Date().toISOString(),
    retries: 0
  })
  saveQueue(list)
  return true
}

function getPendingCount() {
  return loadQueue().length
}

function flushSyncQueue(syncFn) {
  const list = loadQueue()
  if (!list.length || typeof syncFn !== 'function') {
    return Promise.resolve({ flushed: 0, remaining: list.length })
  }

  let flushed = 0
  const remain = []

  const chain = list.reduce((p, item) => {
    return p.then(() => syncFn(item.payload))
      .then(() => { flushed += 1 })
      .catch(() => {
        remain.push({ ...item, retries: (item.retries || 0) + 1 })
      })
  }, Promise.resolve())

  return chain.then(() => {
    saveQueue(remain)
    return { flushed, remaining: remain.length }
  })
}

module.exports = {
  enqueue,
  flushSyncQueue,
  getPendingCount,
  loadQueue
}
