# tools/

此目录存放博客仓库的本地辅助工具。站内浏览器工具的页面入口在 `content/tools/`，前端脚本在 `static/js/tools/`。

## 工具列表

| 目录 | 说明 |
|------|------|
| `postimg/` | Rust CLI，用于文章图片 WebP 转换与孤立图片检查 |
| `game-of-life/` | Rust/WASM 生命游戏核心，构建产物位于 `static/wasm/game-of-life/` |

## 常用命令

```bash
# 检查 postimg
cargo test --manifest-path tools/postimg/Cargo.toml

# 预览文章图片转换
cargo run --manifest-path tools/postimg/Cargo.toml -- convert --dry-run content/posts/my-post.md

# 检查 game-of-life
cargo test --manifest-path tools/game-of-life/Cargo.toml
```
