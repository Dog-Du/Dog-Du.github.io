---
title: Vim 学习索引
date: 2026-04-02T00:00:00+08:00
lastmod: 2026-04-16T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
slug: learning-vim-index
summary: Vim / Neovim / LazyVim 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章以及记录薄弱点。
---

## 当前状态

- 当前学习总天数：`8`
- 当前最近一次学习主题：`Day 008：Neovim 的定位与和 Vim 的实际差异，从“底层语法”过渡到“现代日常工作流”`
- 当前主线阶段：`第 8 章：Neovim 的定位与和 Vim 的实际差异`
- 上一篇文章写到：
  - Day 005 已经把搜索、替换和 Visual 选择接进编辑闭环，开始围绕 `/ ? n N * # :s :%s v V Ctrl-V` 组织操作
  - Day 006 已经开始区分 buffer、window、split，并把多文件切换和并排对照接进工作流
  - Day 007 已经开始建立 `:[range]command` 的心智模型，把保存、退出、范围、批量替换、命令行窗口串到一起
  - Day 008 已经开始把前 7 天的 Vim 底层语法，接到 Neovim 的现代宿主能力上：终端、Lua 配置、LSP、Tree-sitter、`:checkhealth`
  - 当前本地事实锚点是 `Vim 9.2` 与 `Neovim 0.12.0`
- 已学过主题：
  - `Day 000：总览与环境准备`
  - `Day 001：编辑心智模型与模式`
  - `Day 002：移动，从“硬挪”到“直接到位”`
  - `Day 003：operator + motion`
  - `Day 004：文本对象`
  - `Day 005：搜索 / 替换 / 可视模式`
  - `Day 006：buffer / window / split`
  - `Day 007：命令行模式与常用 Ex 操作`
  - `Day 008：Neovim 的定位与和 Vim 的实际差异`
- 哪些章节是 `done`
  - `Day 000`
- 哪些章节是 `revisit`
  - `Day 001`
  - `Day 002`
  - `Day 003`
  - `Day 004`
  - `Day 005`
  - `Day 006`
  - `Day 007`
  - `Day 008`
- 当前薄弱点：
  - 还需要把“Vim 语法不变，Neovim 是现代宿主环境”这个判断真正稳定下来
  - `:terminal`、`Ctrl-\ Ctrl-N`、`:checkhealth` 还没有进入第一反应
  - 还没把本地配置入口、终端、health、LSP 这些 Neovim 能力真正接进日常动作
  - 还没进入 LazyVim 章节，当前正处在从 Vim 底层过渡到 Neovim 实际工作流的阶段
- 下一步建议：`先完成 Day 008 的 5-10 分钟练习，再进入 Day 009：Neovim 的终端、剪贴板、配置入口`

## 默认学习主线

0. 总览与环境准备
1. Vim 的工作方式，不再写乱
2. 移动：从“硬挪”到“直接到位”
3. `operator + motion`
4. 文本对象
5. 搜索 / 替换 / 可视模式
6. buffer / window / split
7. 命令行模式与常用 Ex 操作
8. Neovim 的定位与和 Vim 的实际差异
9. Neovim 的终端、剪贴板、配置入口
10. LazyVim 总览与 leader 思维
11. LazyVim 文件 / 搜索 / buffer 工作流
12. LazyVim 代码导航与 LSP 基础操作
13. LazyVim 日常编辑闭环
14. 回顾、巩固与高频扩展

## 每日文章索引

| Day | 日期 | 主题 | 文章文件 | 状态 |
| --- | --- | --- | --- | --- |
| 000 | 2026-04-02 | 总览与环境准备 | `learning-vim-day000-2026-04-02-overview-and-roadmap.md` | `done` |
| 001 | 2026-04-02 | 编辑心智模型与模式 | `learning-vim-day001-2026-04-02-editing-mindset-and-modes.md` | `revisit` |
| 002 | 2026-04-07 | 移动，从“硬挪”到“直接到位” | `learning-vim-day002-2026-04-07-motions-from-drifting-to-direct-navigation.md` | `revisit` |
| 003 | 2026-04-09 | `operator + motion` | `learning-vim-day003-2026-04-09-operator-plus-motion.md` | `revisit` |
| 004 | 2026-04-11 | `文本对象` | `learning-vim-day004-2026-04-11-text-objects.md` | `revisit` |
| 005 | 2026-04-12 | `搜索 / 替换 / 可视模式` | `learning-vim-day005-2026-04-12-search-replace-and-visual-mode.md` | `revisit` |
| 006 | 2026-04-13 | `buffer / window / split` | `learning-vim-day006-2026-04-13-buffers-windows-and-splits.md` | `revisit` |
| 007 | 2026-04-14 | `命令行模式与常用 Ex 操作` | `learning-vim-day007-2026-04-14-command-line-mode-and-common-ex-operations.md` | `revisit` |
| 008 | 2026-04-16 | `Neovim 的定位与和 Vim 的实际差异` | `learning-vim-day008-2026-04-16-neovim-positioning-and-practical-differences-from-vim.md` | `revisit` |
| 009 | TBD | `Neovim 的终端、剪贴板、配置入口` | TBD | `next` |

说明：

- `状态` 建议使用：
  - `done`
  - `revisit`
  - `next`
- Day 000 作为总览与环境准备，不计入正式推进天数。
- 正式主线从 Day 001 开始。

## 章节掌握快照

### Day 000

- 主题：`总览与环境准备`
- 文件：`learning-vim-day000-2026-04-02-overview-and-roadmap.md`
- understanding_status: `green`
- mastery_score: `4/5`
- weak_points:
  - 当时还未核实本地 `nvim` 的真实安装情况
  - LazyVim 尚未进入本地主线
- source_anchors:
  - `AGENTS-learning-vim.md`
  - `learning-vim-day000-2026-04-02-overview-and-roadmap.md`
  - 默认 `14` 天主线
- ready_for_next: `yes`
- next_review_trigger: `进入 Neovim / LazyVim 章节前回看主线边界`

### Day 001

- 主题：`编辑心智模型与模式`
- 文件：`learning-vim-day001-2026-04-02-editing-mindset-and-modes.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已理解“先操作，再短暂输入”，但还需要靠练习固化
  - `Esc` 作为回到可控状态的反射动作还不够稳
  - 还没进入更高效的移动方式
- source_anchors:
  - `vim --version`
  - `:help`
  - Day 001 文内练习与问题讨论
- ready_for_next: `yes`
- next_review_trigger: `学习 Day 003 的 operator + motion 时回看`

### Day 002

- 主题：`移动，从“硬挪”到“直接到位”`
- 文件：`learning-vim-day002-2026-04-07-motions-from-drifting-to-direct-navigation.md`
- understanding_status: `yellow`
- mastery_score: `2/5`
- weak_points:
  - `w` / `b` / `e` / `ge` 还需要结合真实文本反复练
  - 行首行尾的 `0` / `^` / `$` 容易混
  - `gg` / `G` 还没和“文件级定位”形成手感连接
  - 对软换行场景下的 `gj` / `gk` 还不熟
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `:help motion.txt`
  - `:help word-motions`
  - `:help left-right-motions`
  - `:help up-down-motions`
- ready_for_next: `yes`
- next_review_trigger: `真正开始把移动和删除 / 修改组合到 Day 003 时`

### Day 003

- 主题：`operator + motion`
- 文件：`learning-vim-day003-2026-04-09-operator-plus-motion.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 概念上已经知道“operator 决定做什么，motion 决定做到哪里”，但还需要练成第一反应
  - `d` 和 `c` 在真实替换场景里的选择还需要更多练习
  - `cw`、`ce` 和后续文本对象的边界还没完全打通
  - 行内范围和整行范围之间切换还不够自然
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\motion.txt`
  - `C:\Program Files\Vim\vim92\doc\change.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\change.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 004 文本对象时，发现自己还不能稳定说出“操作 + 范围”`

### Day 004

- 主题：`文本对象`
- 文件：`learning-vim-day004-2026-04-11-text-objects.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - `iw` / `aw` 在真实删词和改词场景里的手感还需要巩固
  - `i` / `a` 在“保留外壳”和“连外壳一起处理”之间还需要更多直觉
  - 引号对象、括号对象和普通 motion 的切换还不够自然
  - 还需要把文本对象真正接到代码编辑里的参数、字符串、列表场景
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\motion.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\motion.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 005 时，发现自己仍然会手工找引号或括号边界`

### Day 005

- 主题：`搜索 / 替换 / 可视模式`
- 文件：`learning-vim-day005-2026-04-12-search-replace-and-visual-mode.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - `/` 发起搜索后继续用 `n` / `N` 维持节奏还需要巩固
  - `:%s/.../.../gc` 的范围感和确认节奏还需要更多练习
  - `v` / `V` / `Ctrl-V` 三种 Visual 场景切换还不够自然
  - 文本对象、Visual 和替换三种方案之间还需要更快做出选择
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\pattern.txt`
  - `C:\Program Files\Vim\vim92\doc\change.txt`
  - `C:\Program Files\Vim\vim92\doc\visual.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 006 时，发现自己还不会稳定地“先找到再改”`

### Day 006

- 主题：`buffer / window / split`
- 文件：`learning-vim-day006-2026-04-13-buffers-windows-and-splits.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - buffer、window、split 的概念已经知道，但在真实编辑里还需要更快做出判断
  - `Ctrl-^`、`:buffer N`、`:bnext` / `:bprevious` 的选择还不够自然
  - `Ctrl-W w` 和 `Ctrl-W h/j/k/l` 的窗口导航还需要练熟
  - 容易一有第二个文件就开 split，而不是先判断是否真的需要并排
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\windows.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 007 时，发现自己仍然在多文件场景里频繁迷路`

### Day 007

- 主题：`命令行模式与常用 Ex 操作`
- 文件：`learning-vim-day007-2026-04-14-command-line-mode-and-common-ex-operations.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已经理解 Ex 的基本句式是“范围 + 命令”，但还需要把 `%`、`.,$`、`'<,'>` 练成第一反应
  - `q:` 和命令行窗口还不够顺手，复杂替换命令出错后容易重输
  - `:g/pattern/cmd` 目前只建立了初步概念，还没有进入稳定使用
  - 仍需要把搜索、Visual 选区、buffer 管理和 Ex 组合成一个连续工作流
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\cmdline.txt`
  - `C:\Program Files\Vim\vim92\doc\index.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Neovim 章节后，发现自己仍然只会用快捷入口，不会用 Ex 明确表达范围和批量动作`

### Day 008

- 主题：`Neovim 的定位与和 Vim 的实际差异`
- 文件：`learning-vim-day008-2026-04-16-neovim-positioning-and-practical-differences-from-vim.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已经知道 Vim 基础语法在 Neovim 里继续有效，但还需要把“现代宿主能力”变成真实体感
  - `:terminal`、`Ctrl-\ Ctrl-N`、`:checkhealth` 还没有形成第一反应
  - Lua 配置、`stdpath()`、LSP / Tree-sitter / provider 目前仍处于定位理解阶段，还没真正纳入日常
  - 容易把 Neovim 和 LazyVim 混为一谈，需要继续保持分层理解
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `nvim --headless "+checkhealth" +qa`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\vim_diff.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\lua-guide.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\terminal.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\health.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\lsp.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 009 或 LazyVim 章节后，发现自己仍然只会把 Neovim 当作“能装插件的 Vim”，而没有把终端、health、Lua 配置当成日常入口`

## 当前薄弱点与回看提示

- 当前薄弱点：
  - 移动仍有退回方向键或逐字符硬挪的风险
  - “先找到目标，再决定怎么改”已经建立，现在要继续扩展成“先判断当前上下文，再决定怎么切换”
  - 还没把 Vim 的移动能力、文本对象、搜索替换、多窗口切换、Ex 范围，与 Neovim 的终端 / health / Lua 配置真正连成一个统一编辑模型
- 回看触发条件：
  - 写文本或改代码时又出现大量手工删改
  - 学 Day 007 时发现自己虽然知道 `:[range]command`、`q:`、`:%s`，但仍然不会顺手用
  - 进入 Neovim / LazyVim 后能用工作流快捷键，却仍然不会顺手落回基础编辑语法，或者不会用 `:terminal` / `:checkhealth`

## 外部资料使用原则

- 优先看本地实际行为和官方帮助。
- 当前会优先以本地 `Vim 9.2` 与 `Neovim 0.12.0` 为事实锚点。
- LazyVim 相关问题优先参考官方文档和默认工作流。

## 文章写作提醒

- 每日文章是知识主文档，练习和问题讨论直接写入当天文章。
- 索引文件只负责导航、状态和薄弱点，不承载长篇正文。
- 主线只保留最常用内容。
- 每篇保留 `扩展内容`，用于收纳低频但有用的能力。

## 最近更新时间

- 2026-04-16T00:00:00+08:00
