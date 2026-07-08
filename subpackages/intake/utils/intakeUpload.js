const { getConfig } = require('../../../utils/config')
const { post } = require('../../../utils/request')

function useIntakeApi() {
  const { useMockFallback, apiBaseUrl } = getConfig()
  return !useMockFallback && !!apiBaseUrl
}

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

function uploadIntakeFile({ applicationNo, docKey, filePath }) {
  if (!useIntakeApi()) {
    return Promise.resolve({ local: true, filePath, id: `local-${Date.now()}` })
  }
  const ext = (filePath.match(/\.(\w+)$/) || [])[1] || 'jpg'
  return readFileBase64(filePath).then(contentBase64 => post('/intake/upload', {
    applicationNo,
    docKey,
    fileName: `${docKey}.${ext}`,
    contentBase64
  }, { showError: false }))
}

function runIdCardOcr({ applicationNo, docKey, documentId, side }) {
  if (!useIntakeApi()) {
    const mockFront = {
      realName: '张亮叶',
      idCard: '330212199001011234',
      gender: '男',
      address: '浙江省宁波市鄞州区'
    }
    const mockBack = { issueAuthority: '宁波市公安局鄞州分局', validDate: '2020.01.01-2040.01.01' }
    return Promise.resolve({
      ocr: { provider: 'mock', side, success: true },
      personalFields: side === 'back' ? {} : mockFront,
      ocrDetail: side === 'back' ? mockBack : mockFront,
      docKey
    })
  }
  return post('/intake/ocr', { applicationNo, docKey, documentId, side }, { showError: false })
}

module.exports = {
  useIntakeApi,
  uploadIntakeFile,
  runIdCardOcr,
  readFileBase64
}
