const { post } = require('./request')

function readFileBase64(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: res => resolve(res.data),
      fail: reject
    })
  })
}

function uploadImageBase64(apiPath, filePath, fileName) {
  return readFileBase64(filePath).then(contentBase64 =>
    post(apiPath, { contentBase64, fileName: fileName || 'image.jpg' }, { showError: true })
  )
}

module.exports = {
  readFileBase64,
  uploadImageBase64
}
