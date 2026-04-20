---
title: Vim 学习笔记 Day 011：LazyVim 文件 / 搜索 / buffer 工作流，把“会看 leader 分组”推进到“会在项目里快速找、切、回”
date: 2026-04-18T12:00:00+08:00
lastmod: 2026-04-18T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
series:
- "Vim 14 天"
series_order: 11
slug: learning-vim-day011-lazyvim-file-search-and-buffer-workflow
featureimage: "images/covers/vim/day011-files-w5qo2x.webp"
summary: Day 011 聚焦 LazyVim 默认的文件、搜索和 buffer 工作流，围绕 Snacks picker 与 buffer 切换建立 root dir / cwd / files / recent / buffers 的判断，让“找文件、搜内容、切上下文”真正形成默认动作。
---

## 今日主题

- 主主题：`LazyVim 文件 / 搜索 / buffer 工作流`
- 副主题：把 Day 006 的 `buffer` 概念和 Day 010 的 `leader` 分组，接进真实项目内的“找文件 / 搜内容 / 回上下文”流程

## 学习目标

- 先建立一个核心判断：
  - `files`
  - `grep`
  - `recent`
  - `buffers`
  - `explorer`
  这 5 个入口不是一回事。
- 把 Day 011 最常用的默认键位练成第一反应：
  - `<leader><space>`
  - `<leader>/`
  - `<leader>,`
  - `<leader>e`
  - `<S-h>` / `<S-l>`
- 把 `Root Dir` 和 `cwd` 的区别说清楚，不再把两者混成一个范围。
- 为 Day 012 的代码导航与 LSP 工作流打底，避免“找文件”和“跳代码”还没分层就继续往前推。

## 前置回顾

- Day 006 里你已经学过：
  - `buffer` 是文件内容载体
  - `window` 是显示口
  - `split` 是并排布局
- Day 007 和 Day 008 里你已经学过：
  - 搜索和批量处理先判断范围
  - `grep` / `quickfix` 属于“先找到结果集，再处理”
- Day 010 里你已经学过：
  - LazyVim 不是插件列表，而是一套默认工作流
  - `<leader>` 是命令空间前缀
  - which-key 是工作流提示器

今天要做的，就是把这些分散能力真正接起来。

## 典型场景

- 你大概知道文件名，想直接把项目里的某个文件找出来。
- 你不知道文件名，但知道里面有某个词，比如 `learning-vim-day010`、`mapleader`、`Snacks.picker`。
- 你刚刚在几个文件之间来回切换，现在想快速回到上一个上下文。
- 你已经开了很多 buffer，不想再靠 `<S-l>` 一路轮着找。
- 你当前正在某个子目录里工作，希望搜索只落在这个局部目录，而不是整个项目根目录。

## 最小命令集

这些是我这次直接用本机 `nvim --headless` 实测出来的高频入口：

### 找文件

- `<leader><space>`
  - `Find Files (Root Dir)`
- `<leader>ff`
  - `Find Files (Root Dir)`
- `<leader>fF`
  - `Find Files (cwd)`
- `<leader>fg`
  - `Find Files (git-files)`
- `<leader>fc`
  - `Find Config File`

### 搜内容

- `<leader>/`
  - `Grep (Root Dir)`
- `<leader>sg`
  - `Grep (Root Dir)`
- `<leader>sG`
  - `Grep (cwd)`
- `<leader>sw`
  - `Visual selection or word (Root Dir)`
- `<leader>sB`
  - `Grep Open Buffers`

### 切上下文

- `<leader>,`
  - `Buffers`
- `<leader>fb`
  - `Buffers`
- `<leader>fB`
  - `Buffers (all)`
- `<leader>fr`
  - `Recent`
- `<leader>fR`
  - `Recent (cwd)`

### 看目录结构

- `<leader>e`
  - `Explorer Snacks (root dir)`
- `<leader>E`
  - `Explorer Snacks (cwd)`
- `<leader>fe`
  - `Explorer Snacks (root dir)`
- `<leader>fE`
  - `Explorer Snacks (cwd)`

### 小范围 buffer 切换

- `<S-h>`
  - `Prev Buffer`
- `<S-l>`
  - `Next Buffer`
- `[b`
  - `Prev Buffer`
- `]b`
  - `Next Buffer`

## 它是怎么用的

### 第一层：`Root Dir` 和 `cwd` 不一样

这次本机实测到的默认键位已经直接把这个区别写在描述里了：

- `<leader>ff`
  - `Find Files (Root Dir)`
- `<leader>fF`
  - `Find Files (cwd)`
- `<leader>sg`
  - `Grep (Root Dir)`
- `<leader>sG`
  - `Grep (cwd)`

先按实用层理解就够了：

- `Root Dir`
  - LazyVim 识别出来的项目根目录
- `cwd`
  - 当前这次会话的工作目录

默认工作流里，`Root Dir` 更像“整个项目视角”，`cwd` 更像“当前局部视角”。

所以你的第一反应应该是：

- 想搜整个项目：
  - 优先 `Root Dir`
- 只想搜当前子目录：
  - 再用 `cwd`

### 第二层：`files`、`buffers`、`recent`、`explorer` 分别解决不同问题

这 4 组入口最容易混。

#### `files`

适合：

- 你要找“项目里存在的文件”
- 但它现在不一定已经打开

典型入口：

- `<leader><space>`
- `<leader>ff`
- `<leader>fF`
- `<leader>fg`

#### `buffers`

适合：

- 你要回到“当前已经打开过的上下文”
- 不想再重新搜整个项目

典型入口：

- `<leader>,`
- `<leader>fb`
- `<S-h>` / `<S-l>`

#### `recent`

适合：

- 你要回到“最近访问过”的文件
- 它不一定还是当前打开 buffer

典型入口：

- `<leader>fr`
- `<leader>fR`

#### `explorer`

适合：

- 你现在需要先看目录结构
- 再决定往哪个文件走

典型入口：

- `<leader>e`
- `<leader>E`

最重要的判断是：

- 已经开过，而且就在当前工作上下文里：
  - 先想 `buffers`
- 最近看过，但不确定现在还开没开：
  - 先想 `recent`
- 根本不知道文件现在开没开，只知道名字或位置：
  - 先想 `files`
- 你其实还没决定具体目标，只是先想看结构：
  - 先想 `explorer`

### 第三层：知道“文件名”就用 `files`，知道“内容”就用 `grep`

这是 Day 011 最该练顺的第二个判断。

如果你知道的是：

- 文件名
- 路径片段
- 模块名

优先：

- `<leader><space>`
- `<leader>ff`
- `<leader>fF`

如果你知道的是：

- 文件里的一段词
- 某个配置项
- 某个函数名
- 某个字符串

优先：

- `<leader>/`
- `<leader>sg`
- `<leader>sG`
- `<leader>sw`

比如在这个仓库里：

- 想直接找 Day 10 那篇文章文件名
  - 用 `<leader><space>` 搜 `day010`
- 想找哪里写了 `mapleader`
  - 用 `<leader>/` 搜 `mapleader`
- 光标已经停在 `Snacks.picker` 上
  - 用 `<leader>sw`

### 第四层：`Buffers` picker 和 `<S-h> / <S-l>` 是两种粒度

这两个都在切 buffer，但不是竞争关系。

#### 小步来回切

适合：

- 刚刚只在两个到三个文件之间来回跳

优先：

- `<S-h>`
- `<S-l>`
- `[b`
- `]b`

#### 跳到远一点的上下文

适合：

- 当前已经开了很多 buffer
- 你知道目标大概叫什么
- 不想一格一格轮

优先：

- `<leader>,`
- `<leader>fb`

所以更稳的工作流不是“只会轮 buffer”，而是：

- 近距离切换：
  - `<S-h>` / `<S-l>`
- 远距离切换：
  - `<leader>,`

### 第五层：本机当前已经确认的现实前提

这次除了键位，我还额外核对了本机依赖状态：

- `rg --version`
  - 当前可用，版本是 `ripgrep 15.1.0`
- `fd --version`
  - 当前可用，版本是 `fd 10.4.2`
- `nvim --headless "+lua print(vim.fn.executable('fd'))" +qa`
  - 当前输出是 `1`，说明本机 `nvim` 也能在当前环境里找到 `fd`
- `:checkhealth snacks`
  - 当前命令可以运行

所以 Day 011 可以先把主线建立在“本机当前可用的默认入口”上。  
这次也能明确补一句：

- 本机当前已经具备 `rg + fd` 这组常见外部搜索能力

如果你之后遇到这些问题，再回头排查：

- 搜索结果异常少
- 文件查找范围不符合预期
- 某些 picker 表现和文档不一致

优先排查：

- `Root Dir` / `cwd` 选错了没有
- `:checkhealth snacks`
- 外部命令是否齐全

今天先不把“某个 picker 内部具体优先调用 `rg` 还是 `fd`”写死，因为这一步我还没有在你的机器上做完整行为对比测试。

## 常见操作套路

### 套路 1：先按 `<leader><space>` 找项目文件

场景：

- 你大概知道文件名
- 想直接进文件

做法：

1. 按 `<leader><space>`
2. 输入文件名片段
3. 选中打开

适合：

- `learning-vim-day011`
- `lazy.lua`
- `keymaps.lua`

### 套路 2：先按 `<leader>/` 找项目内容

场景：

- 你不知道文件名
- 但知道内容里出现了某个词

做法：

1. 按 `<leader>/`
2. 输入关键词
3. 在结果里选文件和位置

适合：

- 找 `Snacks.picker`
- 找 `mapleader`
- 找某个配置项或函数名

### 套路 3：只想在当前子目录收缩范围，就改用 `cwd`

场景：

- 你正在 `content/posts` 这种子目录里工作
- 不想每次都扫整个项目

做法：

- 找文件时：
  - `<leader>fF`
- 搜内容时：
  - `<leader>sG`
- 看目录树时：
  - `<leader>E`

这组键就是把 Day 011 的“局部工作流”建立起来。

### 套路 4：刚刚来回切过几个文件，就别重新搜

场景：

- 你刚在两个到三个 buffer 里切来切去

做法：

- 近距离切：
  - `<S-h>`
  - `<S-l>`
- 远距离回某个已开 buffer：
  - `<leader>,`

不要一上来又回到 `Find Files`。

### 套路 5：想回“最近看过的文件”，用 `Recent` 而不是 `Buffers`

场景：

- 你记得刚才看过一个文件
- 但不确定它现在还是不是打开状态

做法：

- `<leader>fr`
- `<leader>fR`

这比盲猜 buffer 名字更稳。

### 套路 6：还没确定目标时，先看 `Explorer`

场景：

- 你需要先看目录结构
- 再决定进哪个文件

做法：

- `<leader>e`
- `<leader>E`

目录树不是默认入口，但在“先看结构，再开文件”的场景里很有价值。

## 环境差异：vim / nvim / LazyVim

### Vim：底层能力还在

Day 006 和 Day 007 学过的这些，在 Day 011 没失效：

- `:ls`
- `:bnext`
- `:bprevious`
- `:find`
- `:vimgrep`

LazyVim 只是给了更快的默认入口。

### Neovim：现代宿主环境承接这些能力

Day 009 里的这些现实能力，仍然是 Day 011 的底座：

- `stdpath()`
- `:checkhealth`
- 现代插件与 Lua 配置

### LazyVim：把入口组织成默认工作流

本机当前实际就是：

- `Snacks picker`
- bufferline 风格的 buffer 切换
- which-key 分组入口

所以 Day 011 的关键不是“新增了什么底层语法”，而是：

- 什么时候用 `files`
- 什么时候用 `grep`
- 什么时候用 `buffers`
- 什么时候用 `recent`
- 什么时候用 `explorer`

## 今日练习（5-10 分钟）

### 练习任务 A：把 `files / buffers / recent` 分开

1. 用 `<leader><space>` 打开三个不同文件
2. 用 `<S-l>`、`<S-h>` 在它们之间来回切
3. 用 `<leader>,` 看一遍当前 buffers
4. 用 `<leader>fr` 看一遍 recent

目标：

- 说出这三种入口分别在看什么集合。

### 练习任务 B：把 `Root Dir` 和 `cwd` 分开

1. 进入一个你熟悉的子目录工作
2. 连续试这几组：
   - `<leader>ff`
   - `<leader>fF`
   - `<leader>sg`
   - `<leader>sG`
3. 观察结果范围差异

目标：

- 把“整个项目视角”和“当前局部视角”真正区分开。

### 练习任务 C：把“知道文件名”和“知道内容”分开

1. 用 `<leader><space>` 搜一个文件名
2. 用 `<leader>/` 搜一个正文关键词
3. 光标停在一个词上，再试 `<leader>sw`

目标：

- 形成“知道名字找文件，知道内容做 grep”的第一反应。

## 今日问题与讨论

### 我的问题

#### 问题 1：我已经安装了 `fd`，需要补充或修改 Day 11 吗？

- 问题：
  - Day 11 里之前写了 `fd` 不存在；现在本机已经能跑 `fd --version`，这部分要不要改？
- 简答：
  - 要改，而且应该马上改。
- 场景：
  - Day 11 讨论的正是 LazyVim 的文件 / 搜索工作流；外部搜索工具状态属于当天学习的直接环境事实。
- 依据：
  - 本机 `fd --version = fd 10.4.2`
  - 本机 `nvim --headless "+lua print(vim.fn.executable('fd'))" +qa` 输出 `1`
  - Day 11 正文此前确实写过“`fd` 当前命令不存在”
- 当前结论：
  - 需要把文档里的旧事实改成新事实，避免以后恢复学习时被错误环境信息带偏。
  - 但今天仍然不把“具体哪个 picker 一定调用 `fd`”写死，因为这还没做完整行为对比。
- 是否需要后续回看：
  - `是`

### 外部高价值问题

#### 问题 1：`<leader><space>` 和 `<leader>ff` 有什么区别？

- 问题：
  - 两个键位本机实测都是 `Find Files (Root Dir)`，那为什么同时存在？
- 简答：
  - 它们当前功能相同，但使用姿势不同。
  - `<leader><space>` 更像“LazyVim 默认主入口”，`<leader>ff` 更像带语义的助记入口。
- 场景：
  - 你刚开始用 LazyVim 时，可能更容易先按 `<space>` 看工作流入口；用熟以后，`ff` 也会变得很顺手。
- 依据：
  - 本机 `maparg()` 实测
  - 本机 `snacks_picker.lua`
  - LazyVim 官方 keymaps 页
- 当前结论：
  - 两者当前可以视为等价入口，先挑一个练顺即可。
- 是否需要后续回看：
  - `是`

#### 问题 2：`Root Dir` 和 `cwd` 到底怎么选？

- 问题：
  - 为什么 LazyVim 要把很多动作都分成 `Root Dir` 和 `cwd` 两个版本？
- 简答：
  - 因为“整个项目”视角和“当前局部目录”视角，本来就是两种不同工作范围。
- 场景：
  - 在 monorepo、博客仓库、配置目录这类结构里，你经常只想搜当前子目录，而不是整个仓库。
- 依据：
  - 本机 `maparg()` 实测到的键位描述
  - 本机 `snacks_picker.lua` 里 `root = false` 的配置
  - LazyVim 官方 keymaps 页
- 当前结论：
  - 默认先用 `Root Dir`；只有当你明确想收缩到当前局部目录时，再切 `cwd` 版本。
- 是否需要后续回看：
  - `是`

#### 问题 3：`Buffers` 和 `Recent` 有什么区别？

- 问题：
  - 这两个都像“回到之前的文件”，为什么还要分开？
- 简答：
  - `Buffers` 更像“当前已打开上下文”，`Recent` 更像“最近访问历史”。
- 场景：
  - 你刚刚开过很多文件，但有些已经不在当前 buffer 集合里了，这时 `Recent` 更稳。
- 依据：
  - 本机 `maparg()` 实测到的键位分组
  - Day 006 的 buffer 心智
  - LazyVim 官方 keymaps 页
- 当前结论：
  - 想回当前打开上下文，用 `Buffers`；想回最近历史，用 `Recent`。
- 是否需要后续回看：
  - `是`

#### 问题 4：已经有目录树了，为什么还要学 `grep`？

- 问题：
  - 目录树和文件 picker 都能开文件，为什么还要多一个搜索内容入口？
- 简答：
  - 因为你很多时候知道的是“里面写了什么”，而不是“文件叫什么”。
- 场景：
  - 找某个字符串、配置项、函数名、注释标记，`grep` 才是正确入口。
- 依据：
  - Day 005 的搜索能力
  - Day 008 的 `vimgrep` / `quickfix` 思路
  - LazyVim 官方 keymaps 页
- 当前结论：
  - 知道文件名用 `files`，知道内容用 `grep`，两者不能互相替代。
- 是否需要后续回看：
  - `是`

## 常见误区或易混点

- 误区 1：`buffers` 就是“整个项目文件列表”。
  - 不是。它只是当前已经打开的上下文集合。
- 误区 2：`recent` 和 `buffers` 没区别。
  - 一个偏当前打开集合，一个偏最近访问历史。
- 误区 3：所有文件查找都应该从 `explorer` 开始。
  - 目录树只是其中一种入口，不是默认最快入口。
- 误区 4：`Root Dir` 和 `cwd` 只是文案不同。
  - 它们对应的是两个不同范围。
- 误区 5：一旦开了很多 buffer，就只能一直 `<S-l>` 往后轮。
  - 这种时候更该切回 `<leader>,`。

## 扩展内容

- `<leader>fc`
  - `Find Config File`，后面改 LazyVim 配置时会很顺手。
- `<leader>fp`
  - `Projects`，适合后面工作区切换。
- `<leader>sB`
  - `Grep Open Buffers`，适合只在当前已开上下文里搜索。
- `<leader>fg`
  - `git-files`，适合仓库内快速找已跟踪文件。
- `:checkhealth snacks`
  - 如果后面出现 picker 行为异常，可以把它作为排查入口之一。

## 今日小结

- Day 011 真正要建立的不是“多会几个键位”，而是 5 个入口的职责分工：
  - `files`
  - `grep`
  - `buffers`
  - `recent`
  - `explorer`
- 同时要把两个范围判断练顺：
  - `Root Dir`
  - `cwd`
- 这两层一旦立住，LazyVim 才会从“看起来很好用”变成“项目里真的顺手”。

## 明日衔接

- 下一天进入 `LazyVim 代码导航与 LSP 基础操作`。
- 到那时，Day 011 的这些入口会成为前置动作：
  - 先找到文件
  - 再在文件里跳定义、查引用、看符号

## 复习题

1. `files`、`buffers`、`recent`、`explorer` 分别在解决什么问题？
2. 为什么 `Root Dir` 和 `cwd` 不能混用？
3. `<leader><space>` 和 `<leader>/` 分别更适合什么场景？
4. 为什么 `<S-h> / <S-l>` 和 `<leader>,` 不是重复功能？
5. 如果你知道的是“词”，而不是“文件名”，Day 011 的第一反应应该是什么？
