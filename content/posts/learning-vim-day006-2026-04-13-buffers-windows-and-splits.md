---
title: Vim 学习笔记 Day 006：buffer / window / split，把“会编辑”推进到“会切换上下文”
date: 2026-04-13T00:00:00+08:00
lastmod: 2026-04-17T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
series:
- "Vim 14 天"
series_order: 6
slug: learning-vim-day006-buffers-windows-and-splits
featureimage: "images/covers/vim/day006-buffers-8g37jy.webp"
summary: Day 006 聚焦 buffer、window、split 的日常工作流，先掌握同一会话里多个文件怎么切、同屏怎么并排看、什么时候该切 buffer，什么时候该开 split。
---

## 今日主题

- 主主题：`buffer / window / split`
- 副主题：`把“同一文件里会改”推进到“多个上下文里会改”`

## 学习目标

- 解决“进入多文件场景后，来回切得很乱”的问题。
- 先建立三个概念的最小区分：
  - buffer 是内存中的文件内容
  - window 是看 buffer 的视口
  - split 是把窗口分开后的布局
- 建立最常用的日常动作：
  - 看 buffer 列表
  - 前后切 buffer
  - 回到上一个文件
  - 开水平 / 垂直 split
  - 在多个窗口之间跳转和关闭
- 补上一个容易混的概念：
  - tab 是一组 windows 的布局，不等于“一个文件一个页签”

## 前置回顾

- Day 001 到 Day 005 主要都在练“单个编辑上下文里怎么更顺”：
  - 模式
  - 移动
  - operator + motion
  - 文本对象
  - 搜索 / 替换 / Visual
- 但真实工作里很快就会遇到：
  - 一个文件里查定义
  - 另一个文件里改调用
  - 同时对照两处内容
- Day 006 的目标不是一口气讲完所有窗口命令，而是先把多上下文编辑最常用的那条路打顺。
- 当前本地环境已确认：
  - `Vim 9.2`
  - `Neovim 0.12.0`

## 典型场景

这一篇要解决的是真实编辑里最常见的多文件动作：

- 你刚看完一个文件，想回到上一个文件继续改。
- 你想在两个文件之间来回对照。
- 你想保留当前文件，再开一个新窗口看另一处。
- 你已经开了多个窗口，但不知道怎么快速跳过去、关掉、只留一个。

如果 Day 005 解决的是“在一个上下文里找到并改”，那 Day 006 解决的就是“在多个上下文里不迷路”。

## 最小命令集

今天只保留最高频的一层。

### buffer 相关

- `:ls` 或 `:buffers`
  - 查看 buffer 列表
- `:bnext`
  - 下一个 buffer
- `:bprevious`
  - 上一个 buffer
- `:buffer N`
  - 跳到指定编号 buffer
- `Ctrl-^`
  - 回到 alternate file，也就是上一个文件
- `badd`
 - 添加一个文件到 buffer 中，但是不会立刻跳转到这个文件
- `edit`
 - 添加一个文件到 buffer 中，同时立刻跳转到这个文件中

### split / window 相关

- `:split`
  - 水平分屏
- `:vsplit`
  - 垂直分屏
- `:split file`
  - 水平分屏打开另一个文件
- `:vsplit file`
  - 垂直分屏打开另一个文件
- `Ctrl-W w`
  - 在窗口之间轮换
- `Ctrl-W h/j/k/l`
  - 左 / 下 / 上 / 右跳窗口
- `Ctrl-W q`
  - 退出当前窗口
- `Ctrl-W o`
  - 只保留当前窗口

### 组合动作

- `Ctrl-W ^`
  - 分屏后打开上一个文件

### tab 相关（补充）

- `:tabnew file`
  - 在新 tab 里打开文件
- `gt`
  - 去下一个 tab
- `gT`
  - 去上一个 tab
- `:tabclose`
  - 关闭当前 tab 布局

## 它是怎么用的

### 先把三个概念分清：buffer 不是 window，window 不是 split

本地 `windows.txt` 的开头总结得很直接：

- buffer 是文件在内存里的文本
- window 是 buffer 的视口
- tab page 是一组 windows

先别急着管 tab，今天只要先把前两个分清：

- buffer 像“文件内容本体”
- window 像“你现在从哪个位置看它”

所以：

- 同一个 buffer 可以出现在多个窗口里
- 一个窗口一次只看一个 buffer
- split 本质上是在制造更多 window

这件事一旦分清，很多命令就不容易混。

### buffer 更像“会话里的文件集合”

你打开过的文件，通常都会进入 buffer 列表。

所以日常最常见的 buffer 工作流是：

1. `:ls`
2. 看编号和当前状态
3. 用 `:buffer N` 精确跳转

或者：

1. `:bnext`
2. `:bprevious`

本地帮助里也说明了：

- `:buffers` / `:ls` 可以列出 buffer
- `:buffer N` 可以按编号跳过去
- `:bnext` / `:bprevious` 可以前后走

### `Ctrl-^`：最该先练顺的“回到刚才那个文件”

如果只让我在 Day 6 里挑一个最该先练顺的动作，我会先选：

- `Ctrl-^`

它非常适合：

- 刚从 A 文件跳到 B 文件
- 看了一眼或改了几下
- 现在想立刻回 A

这比每次都重新 `:ls`、重新找编号更接近日常节奏。

很多时候，真正高频的是“两文件来回切”，不是“在十几个文件里随便漂”。

### split 是“保留当前上下文，同时再开一个看法”

如果你的需求不是“切走”，而是“我想两个都看着”，那就该想到 split。

最常用两种：

- `:split`
  - 上下分
- `:vsplit`
  - 左右分

如果直接带文件名：

- `:split file`
- `:vsplit file`

就能在新窗口里直接打开另一个文件。

这非常适合：

- 左边看定义，右边改调用
- 上面看原文，下面写整理
- 一边参考，一边修改

### `Ctrl-W`：进入窗口导航层

一旦分屏开起来，最重要的就不是“怎么再多开一个”，而是“怎么稳地在现有窗口里走”。

今天先把下面这组练顺：

- `Ctrl-W w`
  - 轮换到下一个窗口
- `Ctrl-W h/j/k/l`
  - 按方向跳窗口

日常经验是：

- 刚开始只有两个窗口时，`Ctrl-W w` 很够用
- 窗口多了、布局复杂了，再更多用 `h/j/k/l`

### tab page 更像“一套窗口布局”，不是“一个文件一个页签”

这里是 Day 6 最容易和现代编辑器混掉的点。

本地 `windows.txt` 和 `tabpage.txt` 都明确区分了：

- window
  - 看 buffer 的视口
- tab page
  - 一组 windows

`D:\program\Learn-Vim\ch02_buffers_windows_tabs.md` 也讲得很直接：

- 在很多现代编辑器里，tab 更像“一个打开的文件”
- 但在 Vim 里，tab 更像“一个窗口布局”

所以你可以这样理解：

- buffer
  - 文件内容在会话里的存在
- window
  - 你怎么看这个 buffer
- tab
  - 你如何组织一整套 windows

这也是为什么关闭一个 tab，不等于把里面那些文件关掉；它只是把这一套布局关掉，相关 buffer 往往还在。

对日常工作流的建议是：

- 先把 buffer 和 split 用顺
- 真的需要另一套窗口布局时，再上 tab

这样最不容易把概念搅在一起。

### `hidden` 和 `:bdelete`：Learn-Vim 里提到，但今天先放到补充层

Learn-Vim 的 ch02 还特意强调了：

- `'hidden'`
  - 影响你离开未保存 buffer 时，Vim 是不是非要你先处理它
- `:bdelete`
  - 把 buffer 从列表里删掉

这两个点都实用，但我一开始没有放进 Day 6 主线，是因为今天主线先想解决：

- 怎么区分 buffer / window / split
- 怎么在两个上下文之间切换

如果这三件事还没稳，太早引入 `'hidden'`、`bufhidden`、`bdelete`，很容易让 Day 6 从“工作流入门”变成“会话管理百科”。  
现在回补时，把它们收进扩展层就比较合适。

### 关闭窗口时，先分清“关一个”还是“只留一个”

最常用两种关闭动作：

- `Ctrl-W q`
  - 关当前窗口
- `Ctrl-W o`
  - 只留当前窗口

这两个语义差很多：

- `q` 是减一个
- `o` 是清布局，只保留当前焦点

如果你分屏开多了、看完了、想回归单窗口，通常直接：

- `Ctrl-W o`

会非常干净。

## 常见操作套路

### 套路 1：两个文件来回看，优先 `Ctrl-^`

场景：

- 文件 A 里看到一个函数名
- 跳去文件 B 看实现
- 再回 A 继续改

最顺的方式往往是：

1. 打开另一个文件
2. 看或改
3. `Ctrl-^`

这比重新列 buffer 更适合高频来回切。

### 套路 2：需要同时对照时，优先 `:vsplit`

如果你不是“切换”，而是“对照”，通常先想：

- `:vsplit`

因为左右并排更适合：

- 看定义和调用
- 对照两个版本
- 抄结构、改内容

### 套路 3：文件多但不用同时看，优先 buffer，不急着 split

这是很多初学者容易乱掉的一点：

- 一有第二个文件就开 split

其实不一定。

如果只是：

- 去另一个文件看一眼
- 改一处
- 很快回来

通常 buffer 切换更轻。

如果是：

- 需要同时对照
- 需要看两处
- 需要长期并排工作

才更像 split。

### 套路 4：窗口一乱，先 `Ctrl-W o`

当你分屏分多了、方向有点乱、焦点不清晰时：

- `Ctrl-W o`

是一个很好的“清场动作”。

它和 Day 001 的 `Esc` 有点像：

- 不是解决所有问题
- 但能让你快速回到可控状态

### 套路 5：tab 只在“我要另一套布局”时再开

场景：

- 这一组窗口是看调用链
- 另一组窗口是看文档和配置
- 你不想把它们全挤在同一个屏幕布局里

这时才更像：

- `:tabnew`
- `gt`
- `gT`

如果只是“我还有另一个文件要看”，通常还是 buffer 或 split 更轻。

## 环境差异：vim / nvim / LazyVim

### 这些 buffer / window / split 基本语义在 Vim 和 Neovim 中是一致的

本地 `windows.txt` 已经把这些概念和命令作为基础能力给出：

- buffer list
- split / vsplit
- `Ctrl-W` 窗口导航
- 关闭与 only

所以今天学到的是 Vim / Neovim 共通底层，不是某个插件层技巧。

### 到了 LazyVim，这一层不会消失，只会被更频繁调用

LazyVim 会给你更多：

- 文件搜索
- 项目导航
- 符号跳转

但跳过去以后，常见结果仍然是：

- 打开另一个 buffer
- 分一个 window
- 在两个 split 之间跳

所以 Day 6 不是和后面脱节的老知识，而是后面一切项目级工作流的地基。

## 今日练习（5-10 分钟）

### 练习材料

先准备两个临时文件。

文件 A：

```txt
main file line 1
main file line 2
main file line 3
```

文件 B：

```txt
helper file line 1
helper file line 2
helper file line 3
```

### 练习任务

1. 先打开文件 A。
2. 再打开文件 B。
3. 用 `Ctrl-^` 在两个文件之间来回切两次。
4. 用 `:ls` 看 buffer 列表。
5. 用 `:buffer N` 明确跳到另一个 buffer。
6. 用 `:vsplit` 或 `:vsplit fileA` 打开并排窗口。
7. 用 `Ctrl-W w` 在两个窗口之间来回切。
8. 再试一次：
   - `Ctrl-W h`
   - `Ctrl-W l`
9. 用 `Ctrl-W q` 关掉一个窗口。
10. 再开一次 split，然后用 `Ctrl-W o` 只保留当前窗口。
11. 用 `:tabnew` 或 `:tabnew fileB` 开一个新 tab。
12. 用 `gt` 和 `gT` 在两个 tab 之间切一次。
13. 最后用 `:tabclose` 关掉当前 tab。

### 完成标准

- 能说清 buffer、window、split 的区别。
- 能说清 tab 不是文件本体，而是一组 windows 的布局。
- 能在两个文件之间用 `Ctrl-^` 和 `:buffer N` 切换。
- 能开一个 split，并用 `Ctrl-W` 在窗口间切换。
- 能在窗口乱掉时用 `Ctrl-W o` 回到单窗口。

## 今日问题与讨论

### 我的问题

#### 问题 1：buffer 和 window 到底谁才是“文件”？

- 简答：
  - 更接近“文件内容本体”的是 buffer，window 只是看它的视口。
- 场景：
  - 你分屏后会发现，同一个文件可以在两个窗口里同时看不同位置。
- 依据：
  - 本地 `windows.txt` 直接说明：buffer 是 in-memory text，window 是 viewport on a buffer。
- 当前结论：
  - 把 buffer 理解成“文件内容”，把 window 理解成“看法”，最不容易乱。
- 是否需要后续回看：
  - `是`

#### 问题 2：什么时候该切 buffer，什么时候该开 split？

- 简答：
  - 不需要同时看时切 buffer；需要同时对照时开 split。
- 场景：
  - 去另一个文件看一眼，和同时比对两个文件，是两类不同需求。
- 依据：
  - buffer list 命令与 split 命令在 `windows.txt` 里就是两套不同层次的操作。
- 当前结论：
  - “切走”优先想 buffer，“并排看”优先想 split。
- 是否需要后续回看：
  - `是`

#### 问题 3：为什么 `Ctrl-^` 这么值得先练？

- 简答：
  - 因为两文件来回切比多文件漂移更常见。
- 场景：
  - 看实现和调用之间来回跳。
- 依据：
  - alternate file 在 Vim 的多文件工作流里一直是高频概念，`Ctrl-^` 直接落在这个动作上。
- 当前结论：
  - Day 6 最值得先练出的一个动作就是“回到刚才那个文件”。
- 是否需要后续回看：
  - `否`

### 外部高价值问题

#### 问题 1：tab 到底算文件、窗口，还是别的东西？

- 问题：
  - 为什么我感觉 Vim 的 tab 和浏览器或 VS Code 里的 tab 不太一样？
- 简答：
  - 因为 Vim 的 tab page 更接近“一套窗口布局”，不是“一个打开的文件”。
- 场景：
  - 你在一个 tab 里开了左右两个 split，又在另一个 tab 里做了不同布局。
- 依据：
  - 本地 `tabpage.txt`。
  - 本地 `windows.txt`。
  - `D:\program\Learn-Vim\ch02_buffers_windows_tabs.md`。
- 当前结论：
  - 文件主要住在 buffer 里，window 是视口，tab 是布局容器。
- 是否需要后续回看：
  - `是`

#### 问题 2：为什么 Day 6 主线没把 tab 放在最前面？

- 问题：
  - Learn-Vim 已经讲了 tabs，为什么主线里一开始没有重点展开？
- 简答：
  - 因为 Day 6 想先把最常用、最不容易混的两层打稳：buffer 切换和 split 对照；tab 对初学者更容易造成“一个 tab 一个文件”的误解。
- 场景：
  - 很多初学者一旦先学 tab，会直接把 Vim 套进现代编辑器的页签心智，反而更难分清 buffer 和 window。
- 依据：
  - 当前学习主线强调“高频优先”和“避免主线污染”。
  - `D:\program\Learn-Vim\ch02_buffers_windows_tabs.md`。
- 当前结论：
  - tab 不是不重要，而是更适合在 Day 6 的补充层出现，而不是压过 buffer / window / split 主线。
- 是否需要后续回看：
  - `是`

## 常见误区或易混点

- 误区 1：开了两个文件就等于有两个 split
  - 不一定。可能只是两个 buffer，在同一个窗口里切。
- 误区 2：split 越多越高效
  - 不是。窗口一多，注意力和导航成本都会上来。
- 误区 3：buffer list 只是次要概念
  - 不是。很多时候 buffer 切换比开 split 更轻。
- 误区 4：`Ctrl-W q` 和 `Ctrl-W o` 差不多
  - 不差不多。一个是关当前，一个是只留当前。
- 误区 5：今天就要把所有 `Ctrl-W` 命令背完
  - 不需要。先把 `w`、`h/j/k/l`、`q`、`o` 练顺。

## 扩展内容

- `:split file` / `:vsplit file`
  - 直接在新窗口开文件，日常很实用。
- `Ctrl-W ^`
  - 分屏后打开 alternate file。
- `:bnext` / `:bprevious`
  - 适合沿 buffer 列表顺着走。
- `'hidden'`
  - 让你离开未保存 buffer 时不必立刻中断工作流，后面进入配置章节可再展开。
- `:bdelete`
  - 把 buffer 从列表里删掉，适合清理会话。
- `:tabnew` / `gt` / `gT` / `:tabclose`
  - 适合管理不同窗口布局，但不要把它们误当作“文件页签系统”。
- `:new` / `:vnew`
  - 新建空 buffer 并分屏。
- `Ctrl-W H/J/K/L`
  - 调整窗口布局方向，后面可再收。

## 今日小结

Day 6 最重要的不是窗口命令数量，而是建立三个判断：

- 我现在是在切文件，还是在同时看两个文件？
- 我需要的是 buffer 切换，还是 split 对照？
- 我现在是该关一个窗口，还是清掉布局只留一个？

这三个判断一旦建立，多文件编辑的混乱会下降很多。

## 明日衔接

下一步建议进入：

- `Day 007：命令行模式与常用 Ex 操作`

重点会开始解决：

- 怎么把普通模式动作接到命令行级操作
- 怎么按行范围执行命令
- 怎么把 `:w`、`:q` 扩展成更实用的 Ex 工作流

## 复习题

1. buffer、window、split 三者分别是什么？
2. 什么时候更适合切 buffer，什么时候更适合开 split？
3. `Ctrl-^`、`:buffer N`、`:ls` 分别适合什么场景？
4. `Ctrl-W w`、`Ctrl-W h/j/k/l`、`Ctrl-W q`、`Ctrl-W o` 分别在做什么？
5. 为什么说 Day 6 的重点不是背更多窗口命令，而是先建立多上下文判断？
