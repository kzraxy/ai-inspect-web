# AI-inspect

## 📦 安装依赖

## Project setup
``` bash
npm install
```

## 🧪 本地开发模式（支持热更新）
``` bash
npm run serve 
# 或者
npm run dev
```
说明：使用rspack server启动开发环境，配置文件位于build/rspack.dev.config.mjs，网络请求代理配置文件位于：👇
``` javascript
// build/rspack.proxy.config.mjs。

export default {
  "^/api": {
    target: "https://pbnissan.hik-cloud.com/v1/",
    changeOrigin: true,
    pathRewrite: { "^/api": "" }
  },
  "^/lsapi": {
    target: "https://pbchain.hik-cloud.com/v1/",
    changeOrigin: true,
    pathRewrite: { "^/lsapi": "" }
  }
};

```
请按需进行配置

## 🔧 构建生产版本
``` bash
npm run build
```
说明：使用rspack打包生产环境代码，环境变量为 MODE=production，配置文件为 build/rspack.prod.config.mjs。其中：```splitChunks```根据项目实际情况进行最优配置。

## 🧪 构建开发环境产物并发布到开发环境
``` bash
npm run build:dev
```
说明：使用 MODE=dev 环境构建生产代码，构建完成后执行 node publish/pubToDev.js，自动发布产物到开发环境。

## 📦 构建 PB 环境版本
``` bash
npm run build:pb
```
说明：使用 MODE=pb 环境变量，生成 PB 版本产物，适用于特定部署场景。

## 🧩 构建并启用性能分析（配合 Rsdoctor）
``` bash
npm run build:profile
```
说明：设置 RSDOCTOR=true，启用Rsdoctor分析工具，构建完成后可查看构建性能报告，协助进行体积优化与依赖分析。