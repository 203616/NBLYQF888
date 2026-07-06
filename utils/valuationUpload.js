const { readFileBase64 } = require('../utils/intakeUpload')

function uploadValuationPhoto({ docKey, filePath }) {
  const { post } = require('../utils/request')
  const { getConfig } = require('../utils/config')
  if (getConfig().useMockFallback) {
    return Promise.resolve({ docKey, local: true, filePath })
  }
  return readFileBase64(filePath).then(contentBase64 =>
    post('/tools/valuation/upload', { docKey, contentBase64 }, { showError: false })
  )
}

function ocrValuationPhoto({ docKey, filePath }) {
  const { post } = require('../utils/request')
  const { getConfig } = require('../utils/config')
  if (getConfig().useMockFallback) {
    return Promise.resolve({
      vehicleFields: {
        vin: 'LVGBPB9E8KG' + String(Date.now()).slice(-6),
        brand: '比亚迪',
        model: '汉EV',
        plateNo: '浙B·D8888',
        registerDate: '2022-03-15'
      },
      ocr: { provider: 'mock' }
    })
  }
  return readFileBase64(filePath).then(contentBase64 =>
    post('/tools/valuation/ocr', { docKey, contentBase64 }, { showError: false })
  )
}

module.exports = {
  uploadValuationPhoto,
  ocrValuationPhoto
}
