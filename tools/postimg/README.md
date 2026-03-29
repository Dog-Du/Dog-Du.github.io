# postimg — 博客图片管理工具

## 概述

`postimg` 是一个用 Rust 编写的命令行工具（v0.2.0），用于博客图片管理。提供两个子命令：

- **`convert`** — 将单篇 Markdown 文章中引用的图片转换为 WebP 格式，并可选地改写引用路径。
- **`clean`** — 扫描整个仓库，查找未被任何内容引用的孤立图片。

## 环境要求

- Rust + Cargo

## 构建

```bash
cargo build --manifest-path tools/postimg/Cargo.toml --release
```

## 使用方法

### convert 子命令

将单篇 Markdown 文章中的图片转换为 WebP 格式，并可选地改写引用。

| 参数 | 说明 |
|------|------|
| `--dry-run` | 预览模式（默认），不做任何修改 |
| `--rewrite` | 将 Markdown 中的图片引用从原格式改写为 `.webp` |
| `--delete-original` | 转换成功后删除原图（需配合 `--rewrite` 使用） |

**示例：**

```bash
# 预览转换
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --dry-run content/posts/my-post.md

# 转换并改写引用
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --rewrite content/posts/my-post.md

# 转换、改写并删除原图
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --rewrite --delete-original content/posts/my-post.md
```

### clean 子命令

扫描整个仓库，查找未被引用的孤立图片。

| 参数 | 说明 |
|------|------|
| `--image-dir` | 图片目录（默认：`static/img`） |
| `--content-dir` | 内容目录（默认：`content`） |
| `--extra-ref-dir` | 额外的引用搜索目录（可指定多个） |
| `--delete` | 实际删除孤立图片（默认仅打印） |
| `--keep` | Glob 模式，匹配的图片始终保留（默认：`favicon-*.png`、`favicon.ico`、`apple-touch-icon*.png`） |

**示例：**

```bash
# 列出孤立图片（dry run）
cargo run --manifest-path tools/postimg/Cargo.toml -- clean

# 同时扫描 layouts/ 目录中的引用
cargo run --manifest-path tools/postimg/Cargo.toml -- clean --extra-ref-dir layouts

# 实际删除孤立图片
cargo run --manifest-path tools/postimg/Cargo.toml -- clean --delete
```

## 检测策略

`clean` 子命令通过以下 5 种策略检测图片引用：

1. **Markdown 图片语法** — `![](path)` 形式的引用
2. **HTML src/href 属性** — `<img src="...">` 等标签中的引用
3. **CSS `url()` 引用** — 样式中 `url(...)` 形式的引用
4. **Hugo frontmatter 图片字段** — 如 `image`、`cover` 等元数据字段
5. **通用引号路径匹配** — 引号内包含图片路径的通用模式

此外，支持 URL 百分号编码，可正确处理中文目录名（如 `%E6%88%91%E7%9A%84%E7%9B%AE%E5%BD%95`）。

## 安全行为

- **默认 dry-run** — 默认仅打印结果，必须显式传入 `--delete` 才会删除文件。
- **Keep 模式保护** — 默认保留 `favicon` 和 `apple-touch-icon` 相关文件。
- **原子 WebP 写入** — 防止转换过程中文件损坏。
- **跳过远程 URL** — 仅处理本地图片，忽略 `http://`/`https://` 开头的引用。
- **基于内容的格式检测** — 通过文件内容而非扩展名判断图片格式。

## 测试

```bash
cargo test --manifest-path tools/postimg/Cargo.toml
```

共 11 个测试（convert 8 个，clean 3 个）。

## 依赖

| crate | 用途 |
|-------|------|
| `anyhow` | 错误处理 |
| `clap` (derive) | 命令行参数解析 |
| `glob` | 文件模式匹配 |
| `image` | 图片读取与 WebP 编码 |
| `regex` | 正则表达式匹配 |
| `urlencoding` | URL 百分号编解码 |
