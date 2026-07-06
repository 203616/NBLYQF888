const fs = require('fs')
const https = require('https')
const crypto = require('crypto')
const { ocrProvider } = require('../config')

function recognizeIdCard(imagePath, side = 'front') {
  if (!fs.existsSync(imagePath)) throw new Error('图片文件不存在')

  if (ocrProvider === 'aliyun' && process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET) {
    return recognizeAliyunIdCard(imagePath, side)
  }
  return Promise.resolve(recognizeMockIdCard(side))
}

function percentEncode(str) {
  return encodeURIComponent(str).replace(/\+/g, '%20').replace(/\*/g, '%2A').replace(/%7E/g, '~')
}

function signAliyun(params, secret) {
  const sorted = Object.keys(params).sort().map(k => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&')
  const stringToSign = `POST&${percentEncode('/')}&${percentEncode(sorted)}`
  const hmac = crypto.createHmac('sha1', `${secret}&`)
  hmac.update(stringToSign)
  return hmac.digest('base64')
}

function recognizeAliyunIdCard(imagePath, side) {
  const imageBase64 = fs.readFileSync(imagePath).toString('base64')
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET
  const endpoint = process.env.ALIYUN_OCR_ENDPOINT || 'ocr-api.cn-hangzhou.aliyuncs.com'

  const params = {
    Action: 'RecognizeIdcard',
    Format: 'JSON',
    Version: '2021-07-07',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    SignatureVersion: '1.0',
    SignatureNonce: `${Date.now()}${Math.random().toString(36).slice(2)}`,
    Side: side === 'back' ? 'back' : 'face',
    ImageBase64: imageBase64
  }
  params.Signature = signAliyun(params, accessKeySecret)

  const body = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: endpoint,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let raw = ''
      res.on('data', chunk => { raw += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(raw)
          if (json.Code || json.code) {
            return reject(new Error(json.Message || json.message || '阿里云OCR识别失败'))
          }
          const data = json.Data ? JSON.parse(json.Data) : json
          resolve(mapAliyunResult(data, side))
        } catch (err) {
          reject(err)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function mapAliyunResult(data, side) {
  if (side === 'back') {
    return {
      provider: 'aliyun',
      confidence: 0.95,
      side: 'back',
      fields: {
        issueAuthority: data.issueAuthority || data.IssueAuthority || '',
        validPeriod: data.validPeriod || data.ValidPeriod || data.startDate && data.endDate ? `${data.startDate}-${data.endDate}` : ''
      },
      raw: data
    }
  }
  return {
    provider: 'aliyun',
    confidence: 0.95,
    side: 'front',
    fields: {
      realName: data.name || data.Name || '',
      idCard: data.idNumber || data.IdNumber || data.num || '',
      gender: data.sex || data.Sex || data.gender || '',
      birthDate: formatBirth(data.birthDate || data.BirthDate || data.birth),
      address: data.address || data.Address || ''
    },
    raw: data
  }
}

function formatBirth(v) {
  if (!v) return ''
  const s = String(v).replace(/[年月日]/g, '-').replace(/-+$/, '')
  const parts = s.split('-').filter(Boolean)
  if (parts.length >= 3) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
  return v
}

function recognizeMockIdCard(side) {
  if (side === 'back') {
    return {
      provider: 'mock',
      confidence: 0.9,
      side: 'back',
      fields: { issueAuthority: '宁波市公安局鄞州分局', validPeriod: '2020.01.01-2040.01.01' },
      raw: { note: '配置 ALIYUN_ACCESS_KEY_ID 后启用阿里云OCR' }
    }
  }
  return {
    provider: 'mock',
    confidence: 0.93,
    side: 'front',
    fields: {
      realName: '演示用户',
      idCard: '330212199001011234',
      gender: '男',
      birthDate: '1990-01-01',
      address: '浙江省宁波市鄞州区示例路88号'
    },
    raw: { note: '配置 ALIYUN_ACCESS_KEY_ID 后启用阿里云OCR' }
  }
}

function mapOcrToPersonalFields(ocrResult) {
  if (!ocrResult || !ocrResult.fields) return {}
  const f = ocrResult.fields
  const mapped = {}
  if (f.realName) mapped.realName = f.realName
  if (f.idCard) mapped.idCard = f.idCard
  if (f.gender) mapped.gender = f.gender
  if (f.birthDate) mapped.birthDate = f.birthDate
  if (f.address) mapped.address = f.address
  return mapped
}

function recognizeVehicleLicense(imagePath) {
  if (!fs.existsSync(imagePath)) throw new Error('图片文件不存在')
  return Promise.resolve({
    provider: process.env.ALIYUN_ACCESS_KEY_ID ? 'aliyun-mock' : 'mock',
    confidence: 0.9,
    fields: {
      plateNo: '浙B·A12345',
      vin: 'L' + Date.now().toString().slice(-16),
      brand: '比亚迪',
      model: '汉EV',
      registerDate: '2022-06-15',
      owner: '演示用户'
    },
    raw: { note: '行驶证OCR演示数据，配置阿里云密钥后可对接 RecognizeVehicleLicense' }
  })
}

function mapOcrToVehicleFields(ocrResult) {
  if (!ocrResult || !ocrResult.fields) return {}
  const f = ocrResult.fields
  return {
    vin: f.vin || '',
    brand: f.brand || '',
    model: f.model || '',
    plateNo: f.plateNo || '',
    registerDate: f.registerDate || '',
    owner: f.owner || ''
  }
}

module.exports = { recognizeIdCard, recognizeVehicleLicense, mapOcrToPersonalFields, mapOcrToVehicleFields }
