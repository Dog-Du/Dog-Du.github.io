---
title: Vim 扩展：Zed is all you need
date: 2026-05-25T12:00:00+08:00
lastmod: 2026-05-25T15:00:00+08:00
tags: [Vim, Neovim, LazyVim, Zed, Editor]
categories: [工具学习]
series: 
- "Vim 14 天"
series_order: 15
slug: learning-vim-extension-zed-vim-lazyvim-workflow
featureimage: "images/covers/cover_06_city.webp"
summary: 这篇扩展文章把 Zed 放到 Vim / Neovim / LazyVim 学习主线之后理解：Zed 不是替代 Vim 基础，而是一个更 GUI 化、更集成的编辑宿主；重点介绍如何用 Vim mode、leader 风格键位、项目搜索、代码导航、诊断、Git 和终端组织一条日常编辑闭环。
---

## 扩展主题

- 主主题：`把 LazyVim 手感迁移到 Zed, 常用命令罗列`
- 副主题：理解 Zed 在当前编辑器体系里的位置，并把已有 Vim / LazyVim 工作流迁移成一套 GUI 编辑闭环; 罗列常用的 Zed 的命令。

Zed 应该作为主线之后的扩展工具来理解：它不是让你放弃 Vim 手感，而是把已经建立的编辑选择器放进一个 GUI、项目面板、Git、终端、AI 面板和任务运行都更集成的环境里。

## Why Zed

Zed 是一个现代化的编辑。有以下我认为非常重要的优势：

- `Rust` 编写，极其迅速，即使大型 C++ 项目也可以快速响应和快速的渲染。相比之下 `Vscode` 在大型 `C++` 经常出现跳转卡顿的问题，而且渲染 bug、按键冲突、终端渲染问题等，难以接受。
- 内置 `C++`, `Rust` 等语言的语法高亮和代码补全，简单的配置，完美符合我的日常开发。而 `Vscode` 则需要你查看好几篇博客。
- 内置 `Vim` 支持，而不是像 `Vscode` 一样的插件，这让他支持的更好，反应快速，可以更友好的进行自定义。
- Agent Thread 的支持，可以在侧栏方便的查看多个 Agent，以及友好的图形界面。

然而，有两个我认为比较大的缺点：

- remote 开发中，暂时还不支持 zed 命令打开远程文件。
- 虽然已经支持 git graph 但是查看的体验不如 vscode 的插件。

## 典型场景

- 你想用 GUI 编辑器写代码，但不想丢掉 Vim 的普通模式、移动和文本对象。
- 你已经习惯 LazyVim 的 `<leader>` 分组，希望 Zed 里也能用 `space` 作为工作流入口。
- 你希望项目面板、Git 面板、outline、terminal、diagnostics 都能用键盘打开，而不是频繁伸手点鼠标。
- 你写 Markdown 或代码时，希望一轮动作能稳定走完：
  - 找文件
  - 搜内容
  - 修改
  - 看 diff
  - 跑命令
- 你需要 Zed 的 AI / Agent 面板，但又不希望它污染基本编辑主线。

## 最小配置集

这篇文章参考的是当前本机 [Dog-Du/My-Zed-Setup](https://github.com/Dog-Du/My-Zed-Setup) 仓库里的公开工作流部分。

### `settings.json` 里的主线配置

最值得理解的是这些设置：

```json
{
  "base_keymap": "VSCode",
  "vim_mode": true,
  "which_key": {
    "enabled": true,
    "delay_ms": 0
  },
  "relative_line_numbers": "enabled",
  "diff_view_style": "split",
  "colorize_brackets": true,
  "code_lens": "on",
  "inlay_hints": {
    "enabled": true,
    "show_value_hints": true
  },
  "diagnostics": {
    "inline": {
      "enabled": true
    }
  },
  "terminal": {
    "shell": {
      "program": "。。。"
    },
    "show_count_badge": true
  }
}
```

| 配置 | 作用 |
| --- | --- |
| `vim_mode` | 让 Zed 进入 Vim 风格的 modal editing |
| `base_keymap: VSCode` | 保留 GUI 编辑器常见的基础快捷键语义 |
| `which_key` | 让 `space` 这类多键序列有提示入口 |
| `relative_line_numbers` | 服务于 Vim 的相对移动和跳转习惯 |
| `diff_view_style: split` | 让代码审阅和修改前后对照更直接 |
| `code_lens` / `inlay_hints` | 增强代码理解，不替代编辑动作 |
| `diagnostics.inline` | 把问题尽早暴露在编辑位置 |
| `terminal.shell.program` | 明确 Zed 内置终端使用 PowerShell |


### `keymap.json` 里的主线键位

当前 Zed 键位最核心的思路是：

- 保留 Vim mode。
- 用 `space` 模拟 LazyVim 的 leader 入口。
- 把文件、搜索、代码、Git、diagnostics、terminal、agent 都放到可记忆的分组里。

| 键位 | Zed 动作 | 类比 LazyVim 思路 |
| --- | --- | --- |
| `space space` | `file_finder::Toggle` | 找文件 |
| `space /` | `pane::DeploySearch` | 项目内搜索 |
| `space e` | `pane::RevealInProjectPanel` | 在项目面板定位当前文件 |
| `space s b` | `buffer_search::Deploy` | 当前 buffer 内搜索 |
| `space c f` | `editor::Format` | format |
| `space c r` | `editor::Rename` | rename |
| `space c a` / `space .` | `editor::ToggleCodeActions` | code action |
| `space c s` | `outline_panel::ToggleFocus` | 当前文件结构 |
| `space x x` | `diagnostics::Deploy` | diagnostics |
| `space g g` | `git_panel::ToggleFocus` | Git 面板 |
| `space g d` | `git::Diff` | 查看 diff |
| `space g h d` | `editor::ToggleSelectedDiffHunks` | 展开 / 收起 diff hunk |
| `ctrl-\` | `terminal_panel::ToggleFocus` | 终端 |
| `ctrl-shift-j` | `agent::Toggle` | Agent 面板 |

窗口和 pane 导航则保留成一组肌肉记忆：

| 键位 | 作用 |
| --- | --- |
| `ctrl-h` | 到左侧 pane |
| `ctrl-j` | 到下方 pane |
| `ctrl-k` | 到上方 pane |
| `ctrl-l` | 到右侧 pane |

### 第一层：Zed 仍然要先靠 Vim 手感落刀

开了 `vim_mode` 以后，普通模式、插入模式、Visual 模式这套底层思维仍然成立。

所以 Zed 里的第一反应不应该变成“所有事情都找按钮”。

1. 用 Zed 找到上下文。
2. 用 Vim 的移动、文本对象和 operator 完成局部修改。
3. 再用 Zed 的 diagnostics、Git、terminal 去检查结果。

### 第二层：`space` 不是某个快捷键，而是工作流入口

在 LazyVim 里，`<leader>` 的意义不是“空格键很神奇”，而是：

- `f` 偏文件
- `s` 偏搜索 / 符号
- `c` 偏代码动作
- `g` 偏 Git
- `x` 偏问题列表

Zed 配置可以延续这个思路。

- `space g g`：Git / 面板
- `space g d`：Git / diff
- `space x x`：问题 / diagnostics
- `space c s`：代码 / symbols 或 outline

### 第三层：Zed 的 GUI 面板要服务于键盘流

Zed 的项目面板、outline 面板、Git 面板、terminal 面板都很强，但它们不应该把你带回鼠标流。因为 Zed 可以轻松的把这些按键修改成你想要的快捷键。

| 目标 | 入口 |
| --- | --- |
| 当前文件在项目树里哪里 | `space e` |
| 看当前文件结构 | `space c s` |
| 看 Git 变化 | `space g g` |
| 看当前 diff | `space g d` |
| 打开终端 | `ctrl-\` |
| pane 间移动 | `ctrl-h/j/k/l` |


## 环境差异：Vim / Neovim / LazyVim / Zed

| 层次 | 主要角色 | 该留下的能力 |
| --- | --- | --- |
| Vim | 编辑语言本体 | mode、motion、operator、text object、search、substitute |
| Neovim | 现代终端宿主 | LSP、diagnostics、terminal、health、配置入口 |
| LazyVim | 终端里的默认工作流 | leader 分组、文件查找、grep、buffer、LSP、diagnostics |
| Zed | GUI 集成编辑宿主 | Vim mode、项目面板、outline、Git、terminal、agent、任务视图 |

## 常用命令罗列

持续更新....

- ctrl + alt + j: 打开 Agent Thread 左侧栏
- ctrl + shift + j: 打开 Agent Thread 右侧栏
- ctrl + ~: 打开终端
- ctrl + shift + n: 新开 Agent Thread
- ctrl + shift + ~: 新开终端
- ctrl + TAB: 切换 pane
- shift + I：回到行首，然后进入插入模式
- shift + A：回到行尾，然后进入插入模式
