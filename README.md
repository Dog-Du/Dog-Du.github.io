# Dog-Du.github.io

这是 `https://dog-du.github.io/` 的 Hugo 博客仓库。

仓库包含：
- Hugo 站点内容与配置
- 用于部署 GitHub Pages 的 GitHub Actions 工作流
- 基于 Giscus 的评论映射配置
- 一个将文章图片转换为 WebP 的本地 Rust CLI 工具

---

## 仓库结构

```text
.
├── .github/workflows/hugo.yaml      # GitHub Pages 部署工作流
├── config/                          # Hugo 配置
├── content/posts/                   # 博客文章（Markdown）
├── layouts/partials/comments.html   # Giscus 评论集成
├── static/img/                      # 本地文章图片
├── themes/blowfish/                 # Hugo 主题
└── tools/postimg/                   # 将文章图片转为 WebP 的 Rust CLI
```

---

## 事实来源

- **站点生成器**：Hugo
- **部署路径**：GitHub Actions（`Deploy Hugo site`）
- **评论系统**：Giscus
- **推荐的稳定评论绑定方式**：`commentDiscussionNumber`

不要依赖 GitHub Pages 旧版的 Jekyll 行为。  
本仓库的预期部署方式是 `.github/workflows/hugo.yaml` 中定义的 Hugo 工作流。

---

## 本地开发

### 环境要求

- Hugo `0.145.0` extended
- Rust + Cargo（仅在使用 `tools/postimg` 时需要）

### 本地构建

```bash
hugo --gc --minify
```

### 本地预览

```bash
hugo server
```

---

## 新建文章

### 最小流程

1. 在 `content/posts/` 下创建 Markdown 文件
2. 添加 front matter
3. 将本地图片放到 `static/img/<文章相关目录>/`
4. 在文章中引用本地图片
5. 运行 WebP 转换工具
6. 本地用 Hugo 构建验证
7. 提交并推送

### 推荐的 front matter 字段

示例：

```yaml
---
title: "我的新文章"
date: 2026-03-26T12:00:00+08:00
lastmod: 2026-03-26T12:00:00+08:00
draft: false
slug: my-new-post
summary: 这里写一段简短摘要
---
```

### 评论绑定建议

如果你希望评论绑定稳定，建议额外加上：

```yaml
commentDiscussionNumber: <discussion-number>
```

原因：
- `commentDiscussionNumber` 是稳定的
- 基于标题或 term 的讨论映射比较脆弱
- 改文章标题时，可能导致评论被拆到不同 discussion

### 实用建议

- 如果文章是临时内容，不在意长期评论历史，可以接受 fallback 映射
- 如果文章较重要，建议提前创建 GitHub discussion 并写入 `commentDiscussionNumber`

---

## 图片处理流程

### 目标

将文章中的本地图片转换为 `.webp`，并重写 Markdown 引用；源图片在人工确认安全前不自动删除。

### 工具位置

Rust CLI：

```text
tools/postimg/
```

### 构建 / 运行

在仓库根目录执行：

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --dry-run content/posts/your-post.md
```

### 转换单篇文章并重写引用

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite content/posts/your-post.md
```

### 转换、重写并删除原图

只在你确认生成的 WebP 没问题后再使用：

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite --delete-original content/posts/your-post.md
```

### 安全行为

这个工具会：
- 一次只扫描一篇 Markdown 文件
- 支持 Markdown 图片语法和 `<img src="...">`
- 处理本地 `/img/...` 路径和相对路径
- 跳过远程 URL
- 跳过已经存在且有效的 `.webp` 文件
- 通过文件内容判断图片格式，而不只依赖扩展名
- 以原子方式写入 WebP，避免编码失败时留下空文件
- 对不支持的图片安全跳过，不重写相关引用
- 使用 `--delete-original` 时，必须同时加 `--rewrite`

### 当前已知限制

某些特别大的图片或特殊格式图片，当前 Rust WebP 编码器可能不支持。  
遇到这种情况时，工具会：
- 保留原图
- 保留原始 Markdown 引用
- 继续处理文章中其他图片

这是故意设计的保护行为。  
不要手动强行重写这些不支持的图片，除非你已经确认生成结果有效。

---

## 现有博客批量迁移状态

仓库中大多数本地引用图片已经完成批量迁移。  
剩余的非 WebP 引用一般只会出现在以下情况：
- 图片是远程链接
- 当前编码器不支持该图片

---

## 部署

### 正常部署流程

1. 修改内容
2. 本地构建：

```bash
hugo --gc --minify
```

3. 推送到 `main`
4. GitHub Actions 执行 `.github/workflows/hugo.yaml`
5. 站点部署到 GitHub Pages

### 部署工作流文件

```text
.github/workflows/hugo.yaml
```

### 重要的 Pages 设置

GitHub 仓库 Pages 设置应使用：
- **Source: GitHub Actions**

不要切回旧版 source 模式。  
那样可能重新引入基于 Jekyll 的失败和部署冲突。

---

## 评论 / Giscus

评论集成位置：

```text
layouts/partials/comments.html
```

行为：
- 如果存在 `commentDiscussionNumber`，则按 discussion number 绑定评论
- 否则使用 fallback 映射

### 推荐做法

如果希望历史评论稳定，优先使用：

```yaml
commentDiscussionNumber: <number>
```

---

## AI Agent 说明

这一节是给代理或自动化工具看的。

### 仓库性质

- Hugo 静态博客
- 通过 GitHub Actions 部署
- 使用 Giscus 作为评论系统
- 本地图片通常放在 `static/img/`
- 文章文件放在 `content/posts/`

### 代理应优先遵守的规则

1. **不要引入基于 Jekyll 的部署逻辑**
2. **除非明确要求，否则不要自动删除源图片**
3. **优先使用 `commentDiscussionNumber`，不要依赖标题映射**
4. **文章图片转换优先使用 `tools/postimg`，不要随手写临时脚本替代**
5. **涉及图片工具或内容流程改动时，提交前先验证 `cargo test` 和 `hugo --gc --minify`**

### 如果要新增文章

代理检查清单：

1. 在 `content/posts/` 下创建或编辑 Markdown
2. 将本地图片放到 `static/img/<folder>/`
3. 执行：

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite content/posts/<post>.md
```

4. 本地验证：

```bash
hugo --gc --minify
```

5. 如果评论需要长期稳定，补充：

```yaml
commentDiscussionNumber: <number>
```

### 如果要处理图片

不要直接假设扩展名是可信的。  
优先使用已有工具，而不是自己写一个一次性的替代版本。

---

## 维护建议

- 内容改动后优先跑 `hugo --gc --minify`
- 图片相关改动后优先跑 `cargo test`（如果涉及工具逻辑）
- 评论稳定性优先靠 `commentDiscussionNumber`
- GitHub Pages 的正确部署入口是 GitHub Actions，而不是旧式 Pages Source
