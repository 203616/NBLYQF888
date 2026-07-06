# 多端兼容说明（微信小程序）

亮叶企服为 **微信小程序**，通过同一套代码在以下环境运行：

| 环境 | 运行方式 | 适配要点 |
|------|----------|----------|
| **iOS** | 微信 iOS 客户端 | 刘海屏安全区、`env(safe-area-inset-*)` |
| **Android** | 微信 Android 客户端 | 状态栏高度、虚拟导航栏底部 inset |
| **鸿蒙 HarmonyOS** | 微信鸿蒙版（OpenHarmony） | 与 Android 同类 API；`platform` 可能为 `ohos` |
| **开发者工具** | 模拟器 | `platform: devtools`，用于联调 |

## 项目内适配措施

1. **`utils/device.js`**：统一读取 `getWindowInfo` / `getDeviceInfo` / `getAppBaseInfo`，识别 ios / android / harmony
2. **`app.js`**：启动时写入 `globalData.deviceProfile`
3. **`app.wxss`**：全局 CSS 变量 `--safe-top` / `--safe-bottom` / `.page-safe` / `.fixed-bottom-safe`
4. **`app.json`**：`resizable: true` 支持 iPad 大屏
5. **`project.config.json`**：`autoResizable: true`，基础库 `3.8.9`

## 真机调试清单

```bash
pnpm dev:server          # 启动 API
pnpm verify:device       # API 冒烟（需服务运行）
pnpm verify:platform     # 多端配置静态检查
pnpm ci:verify           # CI 全量
```

微信开发者工具 → 预览 → 分别在 **iOS / Android / 鸿蒙** 真机扫码验证：

- [ ] 登录 /  onboarding 流程
- [ ] 五个 Tab 页无底部遮挡
- [ ] 易融圈发布 / 图片上传
- [ ] 进件上传 / OCR（如已配置密钥）
- [ ] 固定底栏页面（详情页提交按钮）不被 Home 条遮挡

## 体验版联调

**我的 → 系统设置 → 体验版联调** 可切换 API 环境，无需改源码。
