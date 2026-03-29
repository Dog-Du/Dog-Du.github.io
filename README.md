# Dog-Du.github.io

基于 Hugo + Blowfish 主题的个人博客，采用 Sakura 配色方案。

站点地址：<https://dog-du.github.io/>

---

## 仓库结构

```text
.
├── .github/workflows/hugo.yaml   # GitHub Actions 部署工作流
├── assets/
│   ├── css/custom.css            # 自定义样式（~24 个模块段落）
│   ├── css/schemes/sakura.css    # Sakura 配色方案
│   └── images/                   # 站点级图片资源
├── config/_default/              # Hugo 配置文件
│   ├── hugo.toml
│   ├── params.toml
│   ├── markup.toml
│   ├── languages.*.toml
│   └── menus.zh-cn.toml
├── content/
│   ├── posts/                    # 博客文章
│   ├── archives/                 # 归档页
│   ├── series/                   # 系列页
│   ├── tags/ & categories/       # 分类/标签页
│   └── _index.md
├── layouts/
│   ├── partials/
│   │   ├── extend-head.html      # 自定义 <head> 注入
│   │   ├── extend-footer.html    # 自定义页脚注入
│   │   └── comments.html         # Giscus 评论
│   ├── archives/list.html        # 增强版归档页
│   ├── _default/terms.html       # 增强版分类页
│   └── 404.html                  # 自定义 404 页面
├── static/
│   ├── js/                       # 前端 JS（见下文）
│   ├── img/                      # 文章图片
│   └── cursors/                  # 自定义光标资源
├── themes/blowfish/              # Blowfish 主题（子模块）
└── tools/                        # 辅助工具
    └── postimg/                  # Rust CLI 图片管理工具
```

---

## 技术栈

- **Hugo** 0.145.0 extended + **Blowfish** 主题
- **Sakura 配色方案** + 薰衣草辅助色
- **前端增强功能**：
  - 樱花花瓣飘落动画
  - Live2D 看板娘
  - GLightbox 图片灯箱
  - 阅读进度条
  - 移动端 TOC 抽屉
  - 自定义光标 & 点击特效
  - 复制成功 Toast 提示
  - 搜索快捷键（Ctrl+K）
  - 代码块折叠
  - 增强版归档 / 分类页面
- **Giscus** 评论系统
- **GitHub Actions** 自动部署到 GitHub Pages
- **tools/postimg**：Rust CLI（v0.2.0），支持 `convert` 和 `clean` 子命令

---

## 本地开发

```bash
# 本地预览（含热重载）
hugo server

# 构建
hugo --gc --minify
```

环境要求：Hugo 0.145.0 extended。使用图片工具时还需 Rust + Cargo。

---

## 新建文章

1. 在 `content/posts/` 下创建 Markdown 文件
2. 添加 front matter（title / date / slug / summary / draft: false）
3. 将图片放入 `static/img/<文章目录>/`
4. 用 `tools/postimg convert` 转换图片为 WebP
5. 如需评论稳定绑定，添加 `commentDiscussionNumber: <number>`
6. `hugo --gc --minify` 本地验证后提交推送

**front matter 示例：**

```yaml
---
title: "我的新文章"
date: 2026-03-26T12:00:00+08:00
draft: false
slug: my-new-post
summary: 简短摘要
commentDiscussionNumber: 42
---
```

> `commentDiscussionNumber` 可确保评论绑定不受标题修改影响，对重要文章建议使用。

---

## 前端架构

### CSS

`assets/css/custom.css`（~1750 行，24 个模块段落），涵盖：排版、代码块折叠、布局宽度、
文章列表卡片、TOC、页脚、评论区、阅读进度条、动画效果等。

配色方案定义在 `assets/css/schemes/sakura.css`。

### JS

`static/js/` 下 4 个源文件，打包为 `bundle.js`：

| 文件 | 职责 |
|------|------|
| `live2d.js` | Live2D 看板娘加载与控制 |
| `page-enhancements.js` | 阅读进度条、移动端 TOC 抽屉、搜索快捷键 |
| `ui-effects.js` | 樱花动画、自定义光标、点击特效、复制 Toast |
| `article-enhancements.js` | 代码块折叠、灯箱初始化、文章页增强 |

### HTML 模板

- `layouts/partials/extend-head.html` — 字体、CSS、预加载注入
- `layouts/partials/extend-footer.html` — JS 加载与初始化
- `layouts/404.html` — 自定义 404 页面
- `layouts/archives/list.html` — 增强版归档页（按年分组 + 统计）
- `layouts/_default/terms.html` — 增强版分类/标签列表

---

## 工具

`tools/` 目录存放博客辅助工具，详见 [tools/README.md](tools/README.md)。

当前工具：**postimg**（Rust CLI v0.2.0）— 博客图片格式转换与孤立图片清理。

---

## 部署

推送到 `main` 分支 → GitHub Actions（`.github/workflows/hugo.yaml`）自动构建 → 部署到 GitHub Pages。

> **注意**：GitHub 仓库 Pages 设置中 Source 应选择 **GitHub Actions**，不要使用旧版 Jekyll 模式。

---

## AI Agent 说明

本节供 AI 代理 / 自动化工具参考。

### 仓库性质

Hugo 静态博客，GitHub Actions 部署，Giscus 评论。文章在 `content/posts/`，图片在 `static/img/`。

### 关键规则

1. **不要引入 Jekyll 部署逻辑**——本仓库仅使用 Hugo + GitHub Actions
2. **不要自动删除源图片**——除非明确要求
3. **评论绑定优先使用 `commentDiscussionNumber`**——不要依赖标题映射
4. **图片处理优先使用 `tools/postimg`**——不要写临时脚本替代
5. **提交前验证**——`hugo --gc --minify` 和 `cargo test`（如涉及工具改动）

### 代理新建文章检查清单

1. `content/posts/` 下创建 Markdown
2. 图片放入 `static/img/<folder>/`
3. `cargo run --manifest-path tools/postimg/Cargo.toml -- convert <post>.md`
4. `hugo --gc --minify` 验证
5. 重要文章补充 `commentDiscussionNumber`
