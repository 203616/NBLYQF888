function requestSubscribe(tmplIds = []) {
  if (!tmplIds.length || !wx.requestSubscribeMessage) {
    return Promise.resolve({ skipped: true })
  }
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: resolve,
      fail: resolve
    })
  })
}

module.exports = {
  requestSubscribe
}
