# MiniMax 用量监控

桌面悬浮窗工具，实时监控 MiniMax API 调用用量，以直观的方式展示在桌面上。

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 功能特性

- 🖥️ **桌面悬浮窗** — 轻量不挡视线，实时显示用量数据
- ⏱️ **刷新间隔** — 每分钟自动拉取最新用量
- 🎨 **深色主题 UI** — 与开发环境无缝融合
- 💾 **本地存储** — API Key 安全保存在本地
- 🔒 **隐私优先** — 所有数据仅在本地处理，不上传任何信息

## 界面预览

主悬浮窗显示用量概览，支持拖拽定位。

## 配置说明

### 获取 API Key

1. 登录 [MiniMax 开放平台](https://platform.minimaxi.com/)
2. 进入「API Key」管理页面
3. 创建新 Key 并妥善保存

### 使用方法

#### 方式一：直接运行（开发模式）

```bash
# 克隆仓库
git clone https://github.com/hx876298682-tech/minimax-usage.git
cd minimax-usage

# 安装依赖
npm install

# 运行
npm start
```

#### 方式二：使用打包好的 Windows 版本

前往 [Releases](https://github.com/hx876298682-tech/minimax-usage/releases) 页面下载最新版本，双击运行即可。

## 项目结构

```
minimax-usage/
├── index.html          # 悬浮窗主页面
├── input.html          # API Key 输入界面
├── main.js             # Electron 主进程
├── preload.js          # 预加载脚本（安全桥接）
├── package.json        # 项目配置
├── dist/               # 构建输出目录
└── release/            # 打包输出目录
    └── win-unpacked/   # Windows 便携版（无需安装）
```

## 技术栈

- [Electron](https://www.electronjs.org/) 33 — 跨平台桌面框架
- [electron-store](https://www.npmjs.com/package/electron-store) — 本地配置存储
- [electron-builder](https://www.electron.build/) — 应用打包

## License

MIT © hx876298682-tech
