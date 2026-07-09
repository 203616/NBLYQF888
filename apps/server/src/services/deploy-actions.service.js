const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '../../../../')

const ACTIONS = {
  'sync-prod': {
    label: '同步生产配置',
    cmd: ['node', 'scripts/sync-prod-config.js']
  },
  'prepare-cdn': {
    label: '打包 CDN staging',
    cmd: ['node', 'scripts/prepare-cdn-bundle.js']
  },
  'cdn-dry-run': {
    label: 'OSS 上传预演',
    cmd: ['node', 'scripts/upload-cdn-oss.js', '--dry-run']
  },
  'cdn-upload': {
    label: 'OSS 正式上传',
    cmd: ['node', 'scripts/upload-cdn-oss.js'],
    requiresOss: true,
    notifyOnComplete: true
  },
  'mp-dry-run': {
    label: '小程序上传预检',
    cmd: ['node', 'scripts/upload-miniprogram-ci.js', '--dry-run']
  },
  'mp-upload': {
    label: '小程序代码上传',
    cmd: ['node', 'scripts/upload-miniprogram-ci.js'],
    requiresMpKey: true,
    notifyOnComplete: true
  },
  'mp-preview': {
    label: '生成体验版预览码',
    cmd: ['node', 'scripts/upload-miniprogram-ci.js', '--preview'],
    requiresMpKey: true,
    notifyOnComplete: true
  }
}

function readDeployConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'deploy', 'deploy.config.json'), 'utf8'))
  } catch {
    return {}
  }
}

function ossConfigured() {
  return !!(
    process.env.OSS_REGION &&
    process.env.OSS_BUCKET &&
    process.env.OSS_ACCESS_KEY_ID &&
    process.env.OSS_ACCESS_KEY_SECRET
  )
}

function mpKeyConfigured() {
  if (process.env.WECHAT_UPLOAD_PRIVATE_KEY) return true
  const keyPath = process.env.WECHAT_UPLOAD_PRIVATE_KEY_PATH
  if (!keyPath) return false
  return [path.resolve(root, keyPath), keyPath].some(p => fs.existsSync(p))
}

function listActions() {
  return Object.entries(ACTIONS).map(([id, meta]) => ({
    id,
    label: meta.label,
    requiresOss: !!meta.requiresOss,
    requiresMpKey: !!meta.requiresMpKey,
    available: meta.requiresOss
      ? ossConfigured()
      : meta.requiresMpKey
        ? mpKeyConfigured()
        : true
  }))
}

function validateAction(actionId) {
  const meta = ACTIONS[actionId]
  if (!meta) {
    const err = new Error(`未知操作: ${actionId}`)
    err.status = 400
    throw err
  }
  if (meta.requiresOss && !ossConfigured()) {
    const err = new Error('OSS 未配置，请在 .env 设置 OSS_* 变量')
    err.status = 400
    throw err
  }
  if (meta.requiresMpKey && !mpKeyConfigured()) {
    const err = new Error('小程序上传密钥未配置 WECHAT_UPLOAD_PRIVATE_KEY*')
    err.status = 400
    throw err
  }
  return meta
}

function buildCommand(actionId, options = {}) {
  const meta = validateAction(actionId)
  const cmd = [...meta.cmd]
  const execEnv = { ...process.env, FORCE_COLOR: '0' }
  const deployConfig = readDeployConfig()

  if (actionId === 'mp-upload' || actionId === 'mp-dry-run' || actionId === 'mp-preview') {
    const robot = options.robot || process.env.MINIPROGRAM_ROBOT || deployConfig.miniprogramRobot || 1
    cmd.push('--robot', String(robot))
    if (options.setTrial || deployConfig.miniprogramAutoTrial) cmd.push('--set-trial')
  }

  if (actionId === 'mp-preview') {
    const robot = options.robot || process.env.MINIPROGRAM_ROBOT || deployConfig.miniprogramRobot || 1
    cmd.push('--robot', String(robot))
    const desc = options.desc || process.env.MINIPROGRAM_DESC || '管理后台预览'
    cmd.push('--desc', desc)
  }

  if (actionId === 'mp-upload') {
    const desc = options.desc || process.env.MINIPROGRAM_DESC || '管理后台触发上传'
    cmd.push('--desc', desc)
    if (options.version) execEnv.MINIPROGRAM_VERSION = String(options.version)
  }

  return { meta, cmd, execEnv }
}

function maybeNotifyDeploy(actionId, ok, output = '', options = {}) {
  const meta = ACTIONS[actionId]
  if (!meta?.notifyOnComplete) return null
  try {
    if (ok && actionId === 'mp-upload') {
      const { setTrialVersionMeta } = require('./trial-version.service')
      setTrialVersionMeta({
        version: options.version || process.env.MINIPROGRAM_VERSION || '1.0.0',
        desc: options.desc || process.env.MINIPROGRAM_DESC || '体验版'
      })
    }
    const { notifyDeployResult } = require('./deploy-notification.service')
    const summary = String(output || '').split('\n').slice(-6).join('\n').trim()
    return notifyDeployResult({ action: actionId, ok, label: meta.label, summary })
  } catch (err) {
    console.warn('deploy notification failed', err.message)
    return null
  }
}

function runDeployAction(actionId, options = {}) {
  const { meta, cmd, execEnv } = buildCommand(actionId, options)
  const startedAt = Date.now()
  try {
    const output = execSync(cmd.join(' '), {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: execEnv,
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024
    })
    const trimmed = output.trim()
    maybeNotifyDeploy(actionId, true, trimmed, options)
    return {
      action: actionId,
      label: meta.label,
      ok: true,
      durationMs: Date.now() - startedAt,
      output: trimmed
    }
  } catch (e) {
    const output = [e.stdout, e.stderr].filter(Boolean).join('\n').trim()
    maybeNotifyDeploy(actionId, false, output || e.message, options)
    const err = new Error(`${meta.label}失败: ${e.message}`)
    err.status = 500
    err.result = {
      action: actionId,
      label: meta.label,
      ok: false,
      durationMs: Date.now() - startedAt,
      output: output || e.message
    }
    throw err
  }
}

function runDeployActionStream(actionId, options = {}, emit) {
  const { meta, cmd, execEnv } = buildCommand(actionId, options)
  const startedAt = Date.now()
  let logBuffer = ''
  let lineBuffer = ''

  return new Promise((resolve, reject) => {
    emit({ type: 'start', action: actionId, label: meta.label })

    const child = spawn(cmd.join(' '), {
      cwd: root,
      env: execEnv,
      shell: true,
      windowsHide: true
    })

    const append = chunk => {
      const message = chunk.toString()
      if (!message) return
      logBuffer += message
      emit({ type: 'log', message })

      lineBuffer += message
      const lines = lineBuffer.split(/\r?\n/)
      lineBuffer = lines.pop() || ''
      for (const line of lines) {
        const m = line.match(/\[progress\]\s*(\d+)\/(\d+)\s*(\d+)%/)
        if (!m) continue
        const current = Number(m[1])
        const total = Number(m[2])
        const percent = Number(m[3]) || Math.round((current * 100) / total)
        emit({ type: 'progress', current, total, percent })
      }
    }

    child.stdout.on('data', append)
    child.stderr.on('data', append)

    child.on('error', err => {
      emit({ type: 'done', ok: false, message: err.message, durationMs: Date.now() - startedAt })
      reject(err)
    })

    child.on('close', code => {
      const result = {
        action: actionId,
        label: meta.label,
        ok: code === 0,
        durationMs: Date.now() - startedAt,
        exitCode: code
      }
      maybeNotifyDeploy(actionId, code === 0, logBuffer, options)
      emit({ type: 'done', ...result })
      if (code === 0) resolve(result)
      else reject(Object.assign(new Error(`${meta.label}失败 (exit ${code})`), { result }))
    })
  })
}

module.exports = {
  ACTIONS,
  listActions,
  buildCommand,
  runDeployAction,
  runDeployActionStream,
  ossConfigured,
  mpKeyConfigured
}
