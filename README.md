# Dog-Du.github.io

基于 Hugo + Blowfish 的个人技术博客，使用 Sakura 配色方案，通过 GitHub Actions 部署到 GitHub Pages。

站点地址：<https://dog-du.github.io/>

## 仓库结构

```text
.
├── .github/workflows/hugo.yaml   # GitHub Pages 部署工作流
├── assets/                       # Hugo 管理的 CSS、配色和站点图片
├── config/_default/              # Hugo 与 Blowfish 配置
├── content/
│   ├── posts/                    # 博客文章
│   ├── tools/                    # 站内工具页
│   ├── archives/                 # 归档入口
│   ├── categories/               # 分类入口
│   ├── series/                   # 系列入口
│   └── tags/                     # 标签入口
├── layouts/                      # 本站覆盖的 Hugo 模板
├── local-repos/                  # 本地参考源码仓库，内容被 Git 忽略
├── static/
│   ├── img/                      # 文章与站点静态图片
│   ├── js/                       # 站点增强脚本与工具页脚本
│   └── wasm/                     # 浏览器端工具使用的 WASM 产物
├── themes/blowfish/              # vendored Blowfish 主题
└── tools/                        # 仓库维护与构建辅助工具
```

## 技术栈

- Hugo `0.145.0` extended，主题为 Blowfish。
- 自定义 Sakura 配色：`assets/css/schemes/sakura.css`。
- 自定义样式入口：`assets/css/custom.css`。
- 评论系统：Giscus，模板在 `layouts/partials/comments.html`。
- 部署：`.github/workflows/hugo.yaml` 构建并发布到 GitHub Pages。

## 本地开发

```bash
# 本地预览
hugo server

# 与部署流程一致的本地构建
hugo --gc --minify
```

环境要求：

- Hugo `0.145.0` extended。
- 修改 Rust 工具或 WASM 工具时需要 Rust + Cargo。

## 本地参考源码仓库

一些学习线会用本地 clone 的开源项目做源码级验证。统一把这些仓库放在 `local-repos/` 下，例如：

```bash
git clone https://github.com/facebook/rocksdb.git local-repos/rocksdb
git clone https://github.com/mysql/mysql-server.git local-repos/mysql-server
```

`local-repos/*` 已加入 `.gitignore`，仓库内容不会提交到本站仓库；只有 `local-repos/README.md` 这类说明文件会被跟踪。

在文章、提示词或工作流里引用外部源码时，优先使用 `local-repos/<repo-name>/...` 这种仓库相对路径。若对应源码仓库不存在，应先 clone；如果因为网络、权限或仓库不可用无法 clone，需要记录阻塞原因，不要把未验证内容写成源码级结论。

## 内容写作

文章放在 `content/posts/`，图片通常放在 `static/img/<文章目录>/`，封面图放在 `assets/images/covers/` 后通过 `featureimage` 引用。

常用 front matter：

```yaml
---
title: "我的新文章"
date: 2026-03-26T12:00:00+08:00
lastmod: 2026-03-26T12:00:00+08:00
tags: [Hugo, Blog]
categories: [工具]
series:
- "某个系列"
series_order: 1
slug: my-new-post
featureimage: "images/covers/cover_01_clouds.webp"
summary: 简短摘要
commentDiscussionNumber: 42
---
```

说明：

- `slug` 会生成 `/posts/<slug>/`，由 `config/_default/hugo.toml` 中的 permalink 控制。
- `featureimage` 对应 `assets/images/` 下的路径。
- `commentDiscussionNumber` 用于绑定固定的 Giscus discussion；重要文章建议填写。
- 新文章提交前至少运行 `hugo --gc --minify`。

## 前端与模板

站点级增强由 `layouts/partials/extend-head.html` 和 `layouts/partials/extend-footer.html` 注入：

- 字体、GLightbox 样式和站点级内联字体设置在 `extend-head.html`。
- GLightbox、Live2D、阅读进度、搜索快捷键、复制提示、文章页增强等脚本在 `extend-footer.html` 加载。
- 文章页布局覆盖在 `layouts/_default/single.html`，包含正文区域和桌面端 TOC 侧栏。
- 工具箱页面使用 `layouts/tools/list.html` 和 `layouts/tools/single.html`。
- 归档、分类、文章卡片、代码块渲染等模板在 `layouts/` 下按 Hugo 约定覆盖。

核心脚本位置：

| 路径 | 用途 |
|------|------|
| `static/js/live2d.js` | Live2D 加载与控制 |
| `static/js/page-enhancements.js` | 页面特效、页脚台词、阅读进度条 |
| `static/js/ui-effects.js` | 复制提示、搜索快捷键 |
| `static/js/article-enhancements.js` | 图片灯箱和文章页交互 |
| `static/js/tools/` | 站内工具页脚本 |

## 工具

仓库内有两类工具：

| 路径 | 用途 |
|------|------|
| `tools/postimg/` | Rust CLI，用于文章图片 WebP 转换和孤立图片检查 |
| `tools/game-of-life/` | Rust/WASM 生命游戏核心，产物发布到 `static/wasm/game-of-life/` |
| `content/tools/` | 站内工具页面入口 |
| `static/js/tools/` | 图片转换、排序可视化、树可视化、生命游戏等浏览器端工具脚本 |

`postimg` 常用命令：

```bash
# 预览单篇文章图片转换
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --dry-run content/posts/my-post.md

# 转换并改写图片引用
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --rewrite content/posts/my-post.md

# 扫描孤立图片
cargo run --manifest-path tools/postimg/Cargo.toml -- clean
```

详见 [tools/README.md](tools/README.md) 和 [tools/postimg/README.md](tools/postimg/README.md)。

## 部署

推送到 `main` 分支后，GitHub Actions 会执行：

```bash
hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"
```

仓库 Pages 设置中 Source 应选择 **GitHub Actions**。

## AI Agent 维护规则

- 不要引入 Jekyll 部署逻辑，本仓库只使用 Hugo + GitHub Actions。
- 不要自动删除源图片；只有用户明确要求时才使用删除类参数。
- 评论稳定绑定优先使用 `commentDiscussionNumber`。
- 图片处理优先使用 `tools/postimg`，避免临时脚本绕过已有工具。
- 修改站点后运行 `hugo --gc --minify`；修改 Rust 工具后运行对应 `cargo test --manifest-path ...`。
- 开始实现前先看 `AGENTS.md` 和 `.trellis/spec/` 中的项目约定。
- 外部开源项目源码统一放在 `local-repos/<repo-name>/`，不要在新规则或新文章中写死本机绝对路径。
