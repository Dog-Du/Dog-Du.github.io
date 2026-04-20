---
title: Vim 学习索引
date: 2026-04-02T08:00:00+08:00
lastmod: 2026-04-20T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
series:
- "Vim 14 天"
series_order: -1
slug: learning-vim-index
summary: Vim / Neovim / LazyVim 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章以及记录薄弱点。
---

## 当前状态

- 当前学习总天数：`14`
- 当前最近一次学习主题：`Day 014：回顾、巩固与高频扩展，把 14 天主线压成一个真正可用的编辑选择器`
- 当前主线阶段：`第 14 章：回顾、巩固与高频扩展`
- 当前系列：`Vim 14 天`
- 系列整理状态：
  - `Vim 学习索引`、`Day 000`、`Day 001` 到 `Day 014` 已整理进同一系列
  - 其中 `Vim 学习索引` 和 `Day 000` 作为前导文档加入系列，但不计入正式 `14` 天 part 编号
  - 同日文章的 `date` 时间已按先后顺序拆开，避免站点列表中顺序不稳定
- 上一篇文章写到：
  - Day 005 已经把搜索、替换和 Visual 选择接进编辑闭环，开始围绕 `/ ? n N * # :s :%s v V Ctrl-V` 组织操作
  - Day 006 已经开始区分 buffer、window、split，并把多文件切换和并排对照接进工作流
  - Day 007 已经开始建立 `:[range]command` 的心智模型，把保存、退出、范围、批量替换、命令行窗口串到一起
  - Day 008 现在重新定义为 `Vim 高频进阶整合`，把插入模式高频入口、`.`、撤销、寄存器、宏、`:global`、多文件批处理系统收束起来
  - Day 009 现在已经正式推进，重点落在 `:terminal`、`"+`、`stdpath()`、`:checkhealth` 和 `vim.provider`
  - 当前本机额外确认到：`stdpath('config') = C:\Users\86131\AppData\Local\nvim`，`has('clipboard') = 1`，当前 `'clipboard'` 选项为空值
  - Day 010 现在已经开始进入 LazyVim 主线，重点落在 `<leader> = <space>`、`<localleader> = \`、which-key、`:Lazy`，以及 `lua/config/*.lua` 和 `lua/plugins/*.lua` 的职责边界
  - 当前本机确认是 LazyVim starter 结构：`init.lua` 只做 `require("config.lazy")`，`lua/config/lazy.lua` 负责引入 `LazyVim/LazyVim` 和 `plugins`
  - Day 011 现在已经正式推进，重点落在 LazyVim 默认的 `Snacks picker + buffer` 工作流：`<leader><space>`、`<leader>/`、`<leader>,`、`<leader>e`、`<S-h>` / `<S-l>`，以及 `Root Dir` 和 `cwd` 的区别
  - 当前本机通过 `maparg()` 已经实测到：`<leader><space>` / `<leader>ff` 对应 `Find Files (Root Dir)`，`<leader>fF` 对应 `Find Files (cwd)`，`<leader>/` / `<leader>sg` 对应 `Grep (Root Dir)`，`<leader>,` 对应 `Buffers`
  - 当前本机额外确认到：`rg 15.1.0` 与 `fd 10.4.2` 都可用，且 `nvim` 中 `executable('fd') = 1`，`:checkhealth snacks` 可以运行；Day 011 主线先以已经确认可用的默认入口为准
  - Day 012 现在已经正式推进，重点落在 LazyVim 默认的 LSP 导航入口：`gd`、`gr`、`gI`、`gy`、`gD`、`K`、`<leader>ca`、`<leader>cr`、`<leader>ss`
  - 当前本机额外确认到：这些 LSP 键位不是全局永远存在；空会话里 `maparg()` 会得到 `<none>`，但在 `C:\Users\86131\AppData\Local\nvim\lua\config\lazy.lua` 这种挂上 `lua-language-server` 的 Lua buffer 里，会实际出现 `Goto Definition`、`References`、`Hover`、`Rename`、`LSP Symbols`
  - 当前本机 Mason 已安装 `lua-language-server`，因此 Day 012 的最稳练习场景就是本机 `lua/config/*.lua` 这些 Lua 配置文件
  - Day 013 现在已经正式推进，重点落在把 `files / grep / buffers`、`gd / gr / K / rename`、`diagnostics / Trouble / quickfix`、`<C-o> / <C-i>` 和 `.` / `<leader>cf` 串成一条真实可重复的编辑闭环
  - 当前本机额外确认到：`nvim --headless "+checkhealth vim.lsp" +qa` 可以跑通；`nvim --headless` 里 `]d` / `[d` 的 desc 分别是 `Jump to the next diagnostic in the current buffer` 与 `Jump to the previous diagnostic in the current buffer`
  - Day 014 现在已经正式推进，重点落在把 `motion / text object / search / Ex / quickfix / LSP / diagnostics / health` 压成一个统一编辑模型，并明确后续不再按天机械推进，而是转入项目驱动复训
  - 当前本机额外确认到：`quickfix.txt` 里可以直接定位到 `:cdo` / `:cfdo`；`repeat.txt` 里可直接定位到 `.`；`motion.txt` 里可直接定位到 `text-objects`、`CTRL-O`、`CTRL-I`、`jumplist`
  - 本次额外回补了 Day 001 / 002 / 003 / 004 / 005 / 006 / 007 的实用缺口：撤销、count 与行内找字符、`.`、文本对象扩展、tab / hidden / bdelete、块选择里的 `I / A`、命令行编辑键与历史
  - 当前本地事实锚点是 `Vim 9.2` 与 `Neovim 0.12.0`
  - 默认 `14` 天主线已经走完，后续更适合按真实项目和薄弱点回看
- 已学过主题：
  - `Day 000：总览与环境准备`
  - `Day 001：编辑心智模型与模式`
  - `Day 002：移动，从“硬挪”到“直接到位”`
  - `Day 003：operator + motion`
  - `Day 004：文本对象`
  - `Day 005：搜索 / 替换 / 可视模式`
  - `Day 006：buffer / window / split`
  - `Day 007：命令行模式与常用 Ex 操作`
  - `Day 008：Vim 高频进阶整合`
  - `Day 009：Neovim 的定位 + 终端 / 剪贴板 / 配置 / health`
  - `Day 010：LazyVim 总览与 leader 思维`
  - `Day 011：LazyVim 文件 / 搜索 / buffer 工作流`
  - `Day 012：LazyVim 代码导航与 LSP 基础操作`
  - `Day 013：LazyVim 日常编辑闭环`
  - `Day 014：回顾、巩固与高频扩展`
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
  - `Day 009`
  - `Day 010`
  - `Day 011`
  - `Day 012`
  - `Day 013`
  - `Day 014`
- 当前薄弱点：
  - 真实项目里仍然容易在压力下退回手工删改，而不是先判断该用 `motion`、文本对象、`.`、替换、quickfix 还是 rename
  - `gd` / `gr` 之后的 `<C-o>` / `<C-i>` 还需要继续练，避免跳出去以后只靠 buffer 来回找
  - diagnostics、Trouble、quickfix、location list 这几个结果层虽然已经拆开，但还没有完全固化成第一反应
  - 遇到环境异常时，还需要更稳定地先想到 `:checkhealth`、`stdpath()`、provider / server / filetype，而不是先怀疑自己按错键
- 下一步建议：`不再新增 Day 015；直接进入项目驱动复训，并按薄弱点回看 Day 002 / 005 / 008 / 009 / 011 / 012 / 013 / 014`

## 默认学习主线

0. 总览与环境准备
1. Vim 的工作方式，不再写乱
2. 移动：从“硬挪”到“直接到位”
3. `operator + motion`
4. 文本对象
5. 搜索 / 替换 / 可视模式
6. buffer / window / split
7. 命令行模式与常用 Ex 操作
8. Vim 高频进阶整合
9. Neovim 的定位 + 终端 / 剪贴板 / 配置 / health
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
| 008 | 2026-04-16 | `Vim 高频进阶整合` | `learning-vim-day008-2026-04-16-vim-high-frequency-advanced-integration.md` | `revisit` |
| 009 | 2026-04-17 | `Neovim 的定位 + 终端 / 剪贴板 / 配置 / health` | `learning-vim-day009-2026-04-17-neovim-positioning-terminal-clipboard-config-and-health.md` | `revisit` |
| 010 | 2026-04-18 | `LazyVim 总览与 leader 思维` | `learning-vim-day010-2026-04-18-lazyvim-overview-and-leader-thinking.md` | `revisit` |
| 011 | 2026-04-18 | `LazyVim 文件 / 搜索 / buffer 工作流` | `learning-vim-day011-2026-04-18-lazyvim-file-search-and-buffer-workflow.md` | `revisit` |
| 012 | 2026-04-19 | `LazyVim 代码导航与 LSP 基础操作` | `learning-vim-day012-2026-04-19-lazyvim-code-navigation-and-lsp-basics.md` | `revisit` |
| 013 | 2026-04-20 | `LazyVim 日常编辑闭环` | `learning-vim-day013-2026-04-20-lazyvim-daily-editing-loop.md` | `revisit` |
| 014 | 2026-04-20 | `回顾、巩固与高频扩展` | `learning-vim-day014-2026-04-20-review-consolidation-and-high-frequency-extensions.md` | `revisit` |

说明：

- `状态` 建议使用：
  - `done`
  - `revisit`
  - `next`
- Day 000 作为总览与环境准备，不计入正式推进天数。
- 正式主线从 Day 001 开始。
- 系列显示使用 `series = Vim 14 天`。
- `series_order = -1` 用于 `Vim 学习索引`，`series_order = 0` 用于 `Day 000`，`Day 001` 到 `Day 014` 固定为 `1-14`。

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
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\undo.txt`
  - `D:\program\Learn-Vim\ch10_undo.md`
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
  - `D:\program\Learn-Vim\ch05_moving_in_file.md`
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
  - `C:\Program Files\Vim\vim92\doc\repeat.txt`
  - `D:\program\Learn-Vim\ch07_the_dot_command.md`
  - `D:\program\Learn-Vim\ch08_registers.md`
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
  - `D:\program\Learn-Vim\ch04_vim_grammar.md`
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
  - `D:\program\Learn-Vim\ch11_visual_mode.md`
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
  - `C:\Program Files\Vim\vim92\doc\tabpage.txt`
  - `D:\program\Learn-Vim\ch02_buffers_windows_tabs.md`
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
  - `C:\Program Files\Vim\vim92\doc\repeat.txt`
  - `D:\program\Learn-Vim\ch15_command-line_mode.md`
- ready_for_next: `yes`
- next_review_trigger: `进入 Neovim 章节后，发现自己仍然只会用快捷入口，不会用 Ex 明确表达范围和批量动作`

### Day 008

- 主题：`Vim 高频进阶整合`
- 文件：`learning-vim-day008-2026-04-16-vim-high-frequency-advanced-integration.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已经知道要把 `.`、寄存器、宏、`:global`、多文件批处理串起来，但判断切换还不够快
  - `gi`、`Ctrl-O`、`Ctrl-R {register}` 这些插入模式高频入口还没有变成第一反应
  - `cfdo` / `cdo`、`argdo` / `bufdo` 的使用边界还需要通过练习巩固
  - 删除时是否保留寄存器内容、批量修改时是否升级到宏或 `:global`，还需要更稳定的判断
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Program Files\Vim\vim92\doc\undo.txt`
  - `C:\Program Files\Vim\vim92\doc\repeat.txt`
  - `C:\Program Files\Vim\vim92\doc\cmdline.txt`
  - `C:\Program Files\Vim\vim92\doc\editing.txt`
  - `D:\program\Learn-Vim\ch06_insert_mode.md`
  - `D:\program\Learn-Vim\ch08_registers.md`
  - `D:\program\Learn-Vim\ch09_macros.md`
  - `D:\program\Learn-Vim\ch13_the_global_command.md`
  - `D:\program\Learn-Vim\ch21_multiple_file_operations.md`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 009 或 LazyVim 章节后，发现自己仍然不会稳定判断“单次修改 / 宏 / :global / 多文件批处理”`

### Day 009

- 主题：`Neovim 的定位 + 终端 / 剪贴板 / 配置 / health`
- 文件：`learning-vim-day009-2026-04-17-neovim-positioning-terminal-clipboard-config-and-health.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已经知道 Neovim 不是新语法，但还需要把“现代宿主环境”变成真实操作手感
  - `:terminal`、`Ctrl-\ Ctrl-N`、`:!` 的边界还需要通过真实场景巩固
  - `"+`、`'clipboard'`、`vim.provider` 三层还需要更清楚地分开
  - `stdpath()`、`:checkhealth vim.provider` 目前还是“知道入口”，还没完全进入排查第一反应
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `nvim --headless "+checkhealth" +qa`
  - `nvim --headless "+lua print(vim.fn.stdpath('config'))" +qa`
  - `nvim --headless "+lua print(vim.fn.stdpath('data'))" +qa`
  - `nvim --headless "+lua print(vim.fn.stdpath('state'))" +qa`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\vim_diff.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\terminal.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\health.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\lua-guide.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\provider.txt`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 010 或 LazyVim 章节后，发现自己仍然把 Neovim 混成“插件版 Vim”，或者不会先用 terminal / provider / health 入口定位问题`

### Day 010

- 主题：`LazyVim 总览与 leader 思维`
- 文件：`learning-vim-day010-2026-04-18-lazyvim-overview-and-leader-thinking.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - 已经知道 LazyVim 是默认工作流，但还需要把“分组优先”真的变成 leader 使用习惯
  - `lua/config/*.lua` 和 `lua/plugins/*.lua` 的职责边界虽然已经知道，但还没通过实际修改巩固
  - 还没把 `<leader>l`、`<leader>?`、which-key 弹窗这些入口真正接进第一反应
  - 还没正式进入 Day 011 的文件 / 搜索 / buffer 高频工作流
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `C:\Users\86131\AppData\Local\nvim\init.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\config\lazy.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\config\keymaps.lua`
  - `C:\Users\86131\AppData\Local\nvim\lazy-lock.json`
  - `nvim --headless "+lua print(vim.g.mapleader == ' ' and '<space>' or vim.inspect(vim.g.mapleader))" +qa`
  - `nvim --headless "+lua print(vim.g.maplocalleader == '\\' and '<backslash>' or vim.inspect(vim.g.maplocalleader))" +qa`
  - `nvim --headless "+lua print(vim.fn.exists(':Lazy'))" +qa`
  - `https://www.lazyvim.org/`
  - `https://www.lazyvim.org/keymaps`
  - `https://www.lazyvim.org/configuration`
  - `https://www.lazyvim.org/configuration/general`
  - `https://www.lazyvim.org/installation`
  - `https://www.nerdfonts.com/`
  - `https://github.com/ryanoasis/nerd-fonts/releases/tag/v3.4.0`
  - `C:\Users\86131\AppData\Roaming\Zed\settings.json`
  - `C:\Users\86131\AppData\Local\Microsoft\Windows\Fonts\Caskaydia Cove Nerd Font Complete Mono.ttf`
  - `C:\Users\86131\AppData\Local\Microsoft\Windows\Fonts\CaskaydiaCoveNerdFontMono-Regular.ttf`
  - `https://zed.dev/docs/configuring-zed`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 011 或真实项目编辑时，发现自己仍然不会先按 leader 分组思考，而是继续把 LazyVim 当成随机快捷键集合`

### Day 011

- 主题：`LazyVim 文件 / 搜索 / buffer 工作流`
- 文件：`learning-vim-day011-2026-04-18-lazyvim-file-search-and-buffer-workflow.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - `Root Dir` 和 `cwd` 的区别已经知道，但还没在真实项目里练成第一反应
  - `files`、`buffers`、`recent`、`explorer` 的职责虽然已经拆开，但切换判断还需要再巩固
  - 仍然容易在多 buffer 场景里只会 `<S-l>` / `<S-h>` 小步轮，而不是主动切回 `<leader>,`
  - 还没进入 Day 012 的代码导航与 LSP 工作流，当前主要还是“找得到、切得回”
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `rg --version`
  - `fd --version`
  - `nvim --headless "+lua print(vim.fn.executable('fd'))" +qa`
  - `nvim --headless "+checkhealth snacks" +qa`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\config\keymaps.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\extras\editor\snacks_picker.lua`
  - `https://www.lazyvim.org/`
  - `https://www.lazyvim.org/keymaps`
  - `https://www.lazyvim.org/configuration`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 012 或真实项目编码时，发现自己仍然分不清“找文件”和“找内容”，或者在多文件上下文里继续只靠 buffer 轮切`

### Day 012

- 主题：`LazyVim 代码导航与 LSP 基础操作`
- 文件：`learning-vim-day012-2026-04-19-lazyvim-code-navigation-and-lsp-basics.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - `grep` 和 `LSP` 的边界已经知道，但还需要在真实代码里练成第一反应
  - `gd`、`gD`、`gI`、`gy` 这组跳转还没有完全拆开
  - 仍然需要把“LSP 键位是 buffer / server 能力动态挂载”的事实练熟
  - 还没进入 Day 013 的日常编辑闭环，当前主要还是“会找、会跳、会看引用”
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `nvim --headless "+checkhealth vim.lsp" +qa`
  - `nvim --headless "+checkhealth mason" +qa`
  - `clang --version`
  - `clangd --version`
  - `nvim --headless "+lua print(vim.fn.executable('clangd'))" +qa`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\lsp.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\diagnostic.txt`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\lsp\init.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\lsp\keymaps.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\extras\lang\clangd.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\config\lazy.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\plugins\example.lua`
  - `https://www.lazyvim.org/`
  - `https://www.lazyvim.org/keymaps`
  - `https://www.lazyvim.org/configuration`
  - `https://www.lazyvim.org/extras/lang/clangd`
  - `https://clangd.llvm.org/design/compile-commands`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 013 或真实项目改代码时，发现自己仍然只会文本搜索，不会先按语义层去做 gd / gr / rename / symbols`

### Day 013

- 主题：`LazyVim 日常编辑闭环`
- 文件：`learning-vim-day013-2026-04-20-lazyvim-daily-editing-loop.md`
- understanding_status: `yellow`
- mastery_score: `3/5`
- weak_points:
  - `gd` / `gr` 跳出去以后，`<C-o>` / `<C-i>` 还需要练成稳定反射
  - `.`、`<leader>cr`、`:%s`、`grep + quickfix` 的切换虽然已经分层，但还没有在真实编辑里练熟
  - `Line Diagnostics`、`Buffer Diagnostics`、`Workspace Diagnostics`、`Trouble`、`quickfix` 的层级刚刚建立，还需要更多实战
  - 还需要把 Day 011 的入口判断、Day 012 的语义导航和更早的 Vim 编辑动作真正走成一条默认回路
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `nvim --headless "+checkhealth vim.lsp" +qa`
  - `nvim --headless "+lua local a=vim.fn.maparg(']d','n',false,true); local b=vim.fn.maparg('[d','n',false,true); print(']d='..(a.desc or '<none>')); print('[d='..(b.desc or '<none>'))" +qa`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\motion.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\repeat.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\diagnostic.txt`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\config\keymaps.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\editor.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\extras\editor\snacks_picker.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\config\lazy.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\plugins\example.lua`
- ready_for_next: `yes`
- next_review_trigger: `进入 Day 014 或真实项目改代码时，发现自己仍然只会找和跳，不会稳定完成“跳转 -> 修改 -> 诊断 -> 回跳”整轮动作`

### Day 014

- 主题：`回顾、巩固与高频扩展`
- 文件：`learning-vim-day014-2026-04-20-review-consolidation-and-high-frequency-extensions.md`
- understanding_status: `yellow`
- mastery_score: `4/5`
- weak_points:
  - 已经能把主线压成一个统一模型，但在真实项目压力下仍可能退回手工删改
  - `.`、`:%s`、`:global`、quickfix / `:cdo`、`<leader>cr` 这些“升级工具”的边界仍需更多实战
  - diagnostics、Trouble、quickfix、location list 的结果层虽然已拆开，但还没有完全自动化
  - 环境异常时，仍需要持续训练“先查 health / provider / server / filetype”的排查反射
- source_anchors:
  - `vim --version`
  - `nvim --version`
  - `nvim --headless "+checkhealth vim.lsp" +qa`
  - `C:\Program Files\Vim\vim92\doc\motion.txt`
  - `C:\Program Files\Vim\vim92\doc\repeat.txt`
  - `C:\Program Files\Vim\vim92\doc\cmdline.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\quickfix.txt`
  - `C:\Program Files\Neovim\share\nvim\runtime\doc\diagnostic.txt`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\config\keymaps.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\editor.lua`
  - `C:\Users\86131\AppData\Local\nvim-data\lazy\LazyVim\lua\lazyvim\plugins\extras\editor\snacks_picker.lua`
  - `C:\Users\86131\AppData\Local\nvim\lua\config\lazy.lua`
- ready_for_next: `yes`
- next_review_trigger: `进入真实项目后，发现自己仍然不会稳定判断“现在该用 motion / text object / search / LSP / quickfix / health 中的哪一层”`

## 当前薄弱点与回看提示

- 当前薄弱点：
  - 移动仍有退回方向键或逐字符硬挪的风险
  - “先找到目标，再决定怎么改”已经建立，现在要继续扩展成“先判断这次该用 `motion`、文本对象、`.`、`:s`、`:global`、quickfix、rename、宏还是多文件命令”
  - 还需要把 Vim 的移动能力、文本对象、搜索替换、多窗口切换、Ex 范围、寄存器、宏，与 Neovim 的 `terminal / provider / health / stdpath()` 和 LazyVim 的默认入口真正压成一个统一编辑模型
  - LazyVim 的 leader 分组、which-key、文件 / 搜索 / buffer / LSP / diagnostics 虽然已经接成闭环，但还需要在真实项目里跑顺
  - `gd` / `gr` 之后的 jumplist 回跳，以及 diagnostics / Trouble / quickfix / location list 的结果集切换还没有完全固化
- 回看触发条件：
  - 写文本或改代码时又出现大量手工删改
  - 学 Day 007 时发现自己虽然知道 `:[range]command`、`q:`、`:%s`，但仍然不会顺手用
  - 进入 Neovim / LazyVim 后能用工作流快捷键，却仍然不会顺手落回 `.`、寄存器、宏、`:global`、quickfix 这些底层动作，或者不会先用 `:terminal` / `:checkhealth vim.provider`
  - 进入 Day 012 之后，发现自己还分不清“找文件”“找内容”“切 buffer”“回最近文件”这几种入口
  - 进入真实项目之后，发现自己还是只会“找和跳”，不会稳定完成 `定位 -> 修改 -> diagnostics / quickfix -> 回跳 / 继续` 这一整轮动作

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

- 2026-04-20T00:00:00+08:00
