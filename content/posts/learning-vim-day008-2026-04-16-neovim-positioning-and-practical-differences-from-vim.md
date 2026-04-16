---
title: Vim 学习笔记 Day 008：Neovim 的定位与和 Vim 的实际差异，从“底层语法”过渡到“现代日常工作流”
date: 2026-04-16T00:00:00+08:00
lastmod: 2026-04-16T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
slug: learning-vim-day008-neovim-positioning-and-practical-differences-from-vim
summary: Day 008 聚焦 Neovim 的定位与和 Vim 的实际差异，不把它写成功能百科，而是先建立一个实用判断：哪些编辑语法完全继承自 Vim，哪些现代能力让日常工作更自然地落到 Neovim。
---

## 今日主题

- 主主题：`Neovim 的定位与和 Vim 的实际差异`
- 副主题：从“已经会 Vim 基础语法”平稳过渡到“为什么日常主力常落在 Neovim”

## 学习目标

- 先说清楚一件事：`Neovim` 不是“另一套 Vim 键位”，而是延续 Vim 编辑语法、同时把现代工作流做得更顺的编辑器。
- 建立一个简单判断：
  - 哪些能力在 `vim` 和 `nvim` 里几乎一样
  - 哪些能力会让你日常更愿意用 `nvim`
- 为 Day 009 和后面的 LazyVim 章节打地基：
  - 配置入口
  - 终端
  - `:checkhealth`
  - LSP / Tree-sitter / Lua 这一层现代生态

## 前置回顾

- Day 001 到 Day 007 学的几乎都是 Vim 系编辑器的共同底层：
  - 模式
  - motion
  - `operator + motion`
  - 文本对象
  - 搜索 / 替换 / Visual
  - buffer / window / split
  - Ex 范围
- 这些内容不会因为你切到 `nvim` 就失效。
- Day 008 的重点不是“推翻前面”，而是回答：
  - 既然底层语法已经会了，为什么很多人最后的日常工作流更偏向 `nvim`？

## 典型场景

- 你已经会 `dw`、`ciw`、`:%s/.../.../gc`，但想把终端、代码导航、诊断、配置管理放进同一个编辑器里。
- 你不想再把编辑器配置长期堆在一个越来越大的 `.vimrc` 里。
- 你希望编辑器能更自然地和 LSP、Tree-sitter、provider、外部工具协同。
- 你想在出现环境问题时，直接用 `:checkhealth` 看配置和依赖状态，而不是全靠猜。

## 最小命令集

今天不背很多新命令，只记住最有实际分水岭的那一层。

### 启动与确认

- `nvim --version`
  - 确认本地 Neovim 版本
- `:checkhealth`
  - 查看健康检查
- `:checkhealth vim.lsp vim.treesitter`
  - 只看重点模块

### 配置与路径

- `:echo stdpath('config')`
  - 看配置目录
- `:echo stdpath('data')`
  - 看数据目录
- `:echo stdpath('state')`
  - 看状态目录

### 终端与模式

- `:terminal`
  - 在 Neovim 里开终端 buffer
- 终端模式里 `Ctrl-\ Ctrl-N`
  - 从 terminal-mode 退回普通模式

### LSP / Lua 感知

- `:lua print(vim.fn.stdpath('config'))`
  - 说明 Lua 是一等入口，不只是插件层补丁
- `:lua vim.lsp.enable('lua_ls')`
  - 本地帮助给出的 LSP 启用示例

## 它是怎么用的

### 第一层：编辑语法基本不变

对你现在最重要的事实是：

- `dw`
- `ci"`
- `/pattern`
- `:%s/foo/bar/gc`
- `:vsplit`
- `q:`

这些东西到了 `nvim` 里都还是主工作语言。

所以不要把 Day 008 理解成“从 Vim 毕业，换一套东西重学”，而应该理解成：

- 前 7 天学的是共同底层
- 从今天开始，进入更现代、更工程化的宿主环境

### 第二层：Neovim 的价值不主要在“改键位”，而在“现代宿主能力”

本地 `vim_diff.txt` 一开始就把主题说得很直接：

- Nvim 和 Vim 在编辑器行为上大量相近
- 但差异文档专门集中列出了配置、默认值、终端、API、Lua、LSP、Tree-sitter、provider、health 这些变化

这说明 Neovim 的核心定位不是“把 Vim 的编辑语法改掉”，而是：

- 保留 Vim 的编辑方式
- 用更现代的方式组织运行时、配置、生态与外部协同

### 第三层：配置入口是非常实际的分水岭

本地 `vim_diff.txt` 和 `lua-guide.txt` 给出的事实很清楚：

- Neovim 使用 `stdpath()` 和 XDG 风格目录
- 配置入口不再默认围绕 `.vimrc`
- 支持 `init.vim` 或 `init.lua`
- `require()` 会在 `runtimepath` 下的 `lua/` 目录找模块并缓存

本机用 `stdpath()` 实测得到：

- config: `C:\Users\86131\AppData\Local\nvim`
- data: `C:\Users\86131\AppData\Local\nvim-data`
- state: `C:\Users\86131\AppData\Local\nvim-data`
- cache: `C:\Users\86131\AppData\Local\Temp\nvim`

这带来的实际变化是：

- 配置不再强依赖一个不断膨胀的单文件
- 更容易按模块拆开
- 更自然地进入 Lua 配置组织方式

### 第四层：`:terminal` 让“编辑器内终端”成为日常工作流的一部分

本地 `terminal.txt` 明确说明：

- 可以用 `:terminal` 创建 terminal buffer
- 进入终端输入时会进入 terminal-mode
- `Ctrl-\ Ctrl-N` 可以退出 terminal-mode
- 还提供单独的 `:tnoremap` 映射空间

这和 Day 006 的 buffer / window / split 正好接上。

你可以把它理解成：

- Vim 时代：编辑器和终端更像两个场所
- Neovim：终端可以直接变成一个 buffer / window 工作流成员

这对真实日常很重要，因为你经常需要：

- 跑测试
- 看构建输出
- 跑 git 命令
- 临时执行脚本

而这些动作不再天然要求你离开当前编辑上下文。

### 第五层：`:checkhealth` 是 Neovim 很实用的“自检入口”

本地 `health.txt` 说明：

- `:checkhealth` 用来检查配置和环境条件
- 可以检查全部，也可以只检查指定模块
- Neovim 自带对配置、性能、provider、clipboard、LSP、Tree-sitter 等的健康检查

这件事的价值很实际：

- 配置有问题时，不再全靠猜
- 插件或语言工具接不上时，有统一排查入口
- 以后进入 LazyVim 章节，`:checkhealth` 会是很高频的排错起点

我本地执行 `nvim --headless "+checkhealth" +qa` 已经确认本机可以正常跑健康检查流程。

### 第六层：LSP / Tree-sitter / Lua 是 Neovim 进入现代代码工作流的关键

本地 `vim_diff.txt` 的 “New Features” 和 `lsp.txt` 表达得很明确：

- Nvim 把 API、job control、LSP、Lua、Tree-sitter、provider、terminal 放在主要能力里
- `lsp.txt` 直接给出 `vim.lsp.enable()` 的启用方式
- `lsp-defaults` 说明 LSP 激活后会自动带上一些默认行为

这里最重要的不是今天就把 LSP 全配好，而是先建立认知：

- Vim 的强项是编辑语法
- Neovim 在此基础上，把“代码编辑器应有的现代协作层”做成原生工作流入口

这也是为什么后面进入 LazyVim 时，会感觉它不是凭空出现的一套快捷键，而是在 Neovim 这层能力上做默认工作流编排。

## 常见操作套路

### 套路 1：写法不变，宿主先切到 Neovim

场景：

- 你已经会前 7 天的内容
- 不想重新学一套编辑器

做法：

1. 继续用你已经会的 Vim 编辑语法
2. 把启动入口逐步从 `vim` 切到 `nvim`
3. 只额外观察：
   - 配置目录
   - 终端
   - `:checkhealth`

这条路线最稳，因为它不会打散前面的手感。

### 套路 2：先把终端纳入 window / buffer 心智模型

场景：

- 你想一边编辑，一边跑命令

做法：

1. `:vsplit`
2. 在一个窗口里执行 `:terminal`
3. 用 `Ctrl-W` 在代码窗口和终端窗口之间切换
4. 在 terminal-mode 里用 `Ctrl-\ Ctrl-N` 退回普通模式

这条路线最能让你体会到：Neovim 不是“另一个 Vim”，而是“把终端工作流接进来了”。

### 套路 3：遇到配置或环境问题，优先 `:checkhealth`

场景：

- 剪贴板不通
- provider 不对
- LSP 没起
- Tree-sitter 表现异常

做法：

1. 先跑 `:checkhealth`
2. 问题缩小后再看具体模块
3. 只在确实需要时再深入插件文档

这能显著减少“出问题先搜半小时”的随机排查。

### 套路 4：配置先接受 Lua 模块化，不急着做大定制

场景：

- 你准备从 Vim 进入 Neovim
- 但还不想直接走进一大堆插件和框架

做法：

1. 先知道 `init.vim` / `init.lua` 二选一
2. 更推荐逐步接受 `init.lua + require(...)`
3. 暂时不急着追求复杂配置

这会让 Day 009 和之后的 LazyVim 章节更顺。

## 环境差异：vim / nvim / LazyVim

### `vim`：底层编辑语法训练场

`vim` 这一层最适合做：

- 模式训练
- motion 训练
- 文本对象训练
- 搜索 / 替换 / Ex 训练

它的价值在于把手感打稳。

### `nvim`：现代宿主环境

`nvim` 这一层最适合做：

- 用同样的 Vim 语法继续编辑
- 接入终端
- 接入 Lua 配置
- 接入 `:checkhealth`
- 接入 LSP / Tree-sitter / provider

所以 Neovim 的定位不是“替代前面的 Vim 学习”，而是“承接前面的 Vim 学习，让它进入现代工程工作流”。

### `nvim + LazyVim`：把现代能力编排成默认工作流

LazyVim 后面会做的是：

- 给出更现成的 leader 工作流
- 组织文件搜索、buffer、LSP、诊断、代码导航
- 减少你自己从零搭配置的负担

但如果 Day 008 这一层没想清楚，到了 LazyVim 很容易只剩下“会按快捷键，不知道底层发生了什么”。

## 今日练习（5-10 分钟）

### 练习任务 A：确认本地 Neovim 基础事实

1. 运行：

```bash
nvim --version
```

2. 打开 `nvim` 后执行：

```vim
:echo stdpath('config')
:echo stdpath('data')
:echo stdpath('state')
```

目标：

- 知道本机 Neovim 配置和数据放在哪里。

### 练习任务 B：把终端纳入窗口工作流

1. 打开任意一个临时文本文件。
2. `:vsplit`
3. 在右侧窗口执行：

```vim
:terminal
```

4. 在终端里输入一个简单命令，例如 `dir` 或 `git status`
5. 用 `Ctrl-\ Ctrl-N` 退出 terminal-mode
6. 用 `Ctrl-W h/l` 在代码窗口和终端窗口之间切换

目标：

- 亲手感受到终端在 Neovim 里就是一个 buffer / window 成员。

### 练习任务 C：跑一次健康检查

1. 在 `nvim` 里执行：

```vim
:checkhealth
```

2. 再试一次：

```vim
:checkhealth vim.lsp vim.treesitter
```

目标：

- 建立“有环境问题先看 health”的第一反应。

## 今日问题与讨论

### 我的问题

- 暂无。本节先把 Neovim 的定位讲清楚，后续具体问答直接补到这里。

### 外部高价值问题

#### 问题 1：Neovim 到底是不是“Vim 加插件”？

- 问题：
  - 很多人会把 Neovim 理解成“就是 Vim 再多装点插件”。
- 简答：
  - 不准确。Neovim 保留 Vim 编辑语法，但它的配置模型、Lua、API、terminal、health、LSP、Tree-sitter 等已经让它成为更现代的宿主环境。
- 场景：
  - 你在普通文本编辑层面几乎感受不到大变化，但一进入工程工作流，差异会迅速放大。
- 依据：
  - 本地 `vim_diff.txt` 的配置、New Features、terminal、provider、LSP 等章节。
- 当前结论：
  - 把 Neovim 理解为“继承 Vim 语法的现代宿主环境”更准确。
- 是否需要后续回看：
  - 需要。进入 Day 009 和 LazyVim 章节后会越来越明显。

#### 问题 2：既然编辑动作差不多，为什么不一直用 Vim？

- 问题：
  - 如果 `dw`、`ciw`、`:%s` 这些都一样，为什么还要过渡到 `nvim`？
- 简答：
  - 因为日常主力编辑器不只负责“改文本”，还要负责终端、配置组织、健康检查、代码能力接入。
- 场景：
  - 真实工作里你会频繁遇到：
    - 跑命令
    - 看诊断
    - 接语言服务器
    - 配置多个模块
- 依据：
  - 本地 `terminal.txt`
  - 本地 `health.txt`
  - 本地 `lsp.txt`
- 当前结论：
  - Vim 语法负责高效编辑，Neovim 负责把高效编辑带入现代日常工作流。
- 是否需要后续回看：
  - 需要。尤其在 Day 009 后会更具体。

## 常见误区或易混点

- 误区 1：到了 Neovim 就要重新学一套键位。
  - 不是。前 7 天学的内容基本都继续可用。
- 误区 2：Neovim 的价值就是“能装更多插件”。
  - 更关键的是它把现代配置、终端、Lua、health、LSP 等做成了一等公民。
- 误区 3：一切都应该立刻迁移到复杂 Lua 配置。
  - 今天先理解定位，不急着大改配置。
- 误区 4：出现环境问题就先搜插件 issue。
  - 先看 `:checkhealth`。
- 误区 5：LazyVim 等于 Neovim。
  - LazyVim 是 Neovim 上的一套工作流组织，不是 Neovim 本身。

## 扩展内容

- `shada` 替代 `viminfo`
  - 本地 `vim_diff.txt` 明确记录了这个变化。
- Nvim 默认值与 Vim 不完全一致
  - 例如默认启用的一些选项、状态目录与运行时行为。
- UI 与核心解耦、API 更完整
  - 对后续理解插件生态和远程 UI 有帮助，但今天不展开。
- 缺失或移除的部分 Vim 传统特性
  - `vim_diff.txt` 也有专门章节，等需要时再查。

## 今日小结

- Day 008 的关键结论不是“Neovim 命令更多”，而是：
  - 编辑语法大体延续 Vim
  - 宿主能力明显更现代
- 所以前 7 天不是前置负担，而是进入 Neovim 的真正地基。
- 从今天开始，学习主线正式从“纯 Vim 底层”过渡到“Neovim 的日常实际能力”。

## 明日衔接

- 下一天进入 `Neovim 的终端、剪贴板、配置入口`。
- 到那时会把今天的定位进一步落到可直接上手的三个入口上：
  - `:terminal`
  - 剪贴板 provider
  - `init.lua` / 配置目录

## 复习题

1. Day 001 到 Day 007 学的内容，到了 Neovim 里哪些仍然继续有效？
2. Neovim 最值得你先感知的三类现代能力是什么？
3. `stdpath('config')` 解决的是哪类实际问题？
4. `:terminal` 和 Day 006 的 buffer / window / split 是怎么接起来的？
5. 出现环境或配置问题时，Neovim 最该先看的入口是什么？
