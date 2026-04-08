---
title: Vim 学习索引
date: 2026-04-02T00:00:00+08:00
lastmod: 2026-04-07T00:00:00+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
slug: learning-vim-index
summary: Vim / Neovim / LazyVim 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章以及记录薄弱点。
---

## 当前状态

- 当前学习总天数：`2`
- 当前最近一次学习主题：`Day 002：移动，从“硬挪”到“直接到位”`
- 当前主线阶段：`第 2 章：移动，从“硬挪”到“直接到位”`
- 上一篇文章写到：
  - Day 001 已经建立“普通模式是主工作模式，插入模式只是短暂停留”的心智模型
  - 下一步自然衔接到“如何在普通模式里快速到位”
  - 旧索引中“`nvim` 尚未安装”的信息已过期，当前本地实际环境为 `Vim 9.2` 与 `Neovim 0.12.0`
- 已学过主题：
  - `Day 000：总览与环境准备`
  - `Day 001：编辑心智模型与模式`
  - `Day 002：移动，从“硬挪”到“直接到位”`
- 哪些章节是 `done`
  - `Day 000`
- 哪些章节是 `revisit`
  - `Day 001`
  - `Day 002`
- 当前薄弱点：
  - 还没有把按词、按行、按文件结构移动练成稳定反应
  - 容易把 `h j k l` 当成主要导航，而不是兜底导航
  - `gj` / `gk` 和 `j` / `k` 的区别还需要结合换行显示继续体会
  - 虽然本机已有 `nvim`，但还没进入 Neovim 与 LazyVim 主线章节
- 下一步建议：`先完成 Day 002 的 5-10 分钟练习，再进入 Day 003：operator + motion`

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
| 002 | 2026-04-07 | 移动：从“硬挪”到“直接到位” | `learning-vim-day002-2026-04-07-motions-from-drifting-to-direct-navigation.md` | `revisit` |
| 003 | TBD | `operator + motion` | TBD | `next` |

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

- 主题：`移动：从“硬挪”到“直接到位”`
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
- next_review_trigger: `真正开始把移动和删除/修改组合到 Day 003 时`

## 当前薄弱点与回看提示

- 当前薄弱点：
  - 移动仍有退回方向键或逐字符硬挪的风险
  - 普通模式中的“先定位，再操作”还处于刚建立阶段
  - 还没有把 Vim 的移动能力和后续 `operator + motion` 真正连起来
- 回看触发条件：
  - 写文本或改代码时又出现大量方向键硬挪
  - 学 Day 003 时发现自己虽然知道命令，但定位太慢
  - 进入 Neovim / LazyVim 后只会按工作流快捷键，却不能顺手落回基础移动

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

- 2026-04-07T00:00:00+08:00
