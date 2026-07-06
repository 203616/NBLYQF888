# CDN 静态资源镜像目录

此目录由 `pnpm prepare:cdn` **复制**生成，不会删除小程序源码中的原图。

- 上传：将本目录内文件按相对路径同步至 CDN 根目录
- 本地测试：先 `pnpm prepare:cdn`，再 `pnpm dev:server`，访问 `http://localhost:3000/mp-assets/images/banner1.webp`
- 启用 CDN：在 `deploy/deploy.config.json` 设 `useCdnImages: true`，然后 `pnpm sync:prod`

默认 `useCdnImages: false`，小程序继续使用本地分包 WebP/PNG。
