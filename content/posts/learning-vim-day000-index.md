---
title: Vim 学习索引
date: 2026-04-02T00:00:00+08:00
lastmod: 2026-04-02T10:15:21+08:00
tags: [Vim, Neovim, LazyVim, Editor]
categories: [工具学习]
slug: learning-vim-index
summary: Vim / Neovim / LazyVim 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章以及记录薄弱点。
---

## 当前状态

- 当前学习总天数：`1`
- 当前最近一次学习主题：`Day 001：编辑心智模型与模式`
- 当前主线阶段：`第 1 章：Vim 的工作方式，不再写乱`
- 上一篇文章写到：
  - 已经明确普通模式是主工作模式，插入模式只是短暂停留
  - 已经建立“乱了先 `Esc`”的第一条工作习惯
  - 已经确认当前本地环境只有 `vim 9.2`，`nvim` 尚未安装
- 已学过主题：
  - `Day 000：总览与环境准备`
  - `Day 001：编辑心智模型与模式`
- 下一步建议：`进入 Day 002：移动：从“硬挪”到“直接到位”`
- 当前仍需补看的关键点：
  - 还没有形成按词、按行、按文件的高效移动习惯
  - 普通模式的“编辑操作中心”角色还只理解到第一层
  - `nvim` 与 LazyVim 相关环境仍未准备

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
| 002 | TBD | 移动：从“硬挪”到“直接到位” | TBD | `next` |

说明：

- `状态` 建议使用：
  - `done`
  - `revisit`
  - `next`
- Day 000 可作为总览与环境准备，不计入正式推进天数。
- 正式主线从 Day 001 开始。

## 章节掌握快照

### Day 000

- 主题：`总览与环境准备`
- 文件：`learning-vim-day000-2026-04-02-overview-and-roadmap.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - 本地 `vim` / `nvim` 实际安装情况还未核实
  - LazyVim 的本地可用性还未核实
  - Day 001 之后的练习样式还需要在实战中继续微调
- source_anchors：
  - `AGENTS-learning-vim.md`
  - `learning-vim-session.md`
  - 规划中的 `14` 天主线

可选字段：

- ready_for_next：`yes`
- next_review_trigger：`开始 Day 001 前回看 Day 000 的目标和边界`

### Day 001

- 主题：`编辑心智模型与模式`
- 文件：`learning-vim-day001-2026-04-02-editing-mindset-and-modes.md`
- understanding_status：`yellow`
- mastery_score：`3/5`
- weak_points：
  - 目前只是知道“普通模式更重要”，还没形成稳定手感
  - `Esc` 的反射还需要通过后续练习固化
  - 还没有进入更高效的移动方式
- source_anchors：
  - `vim --version`
  - `Get-Command vim`
  - `Get-Command vimtutor`
  - `vim` 中 `showmode` 默认开启的实际行为

可选字段：

- ready_for_next：`yes`
- next_review_trigger：`学习 Day 003 的 operator + motion 时回看`

## 当前薄弱点与回看提示

- 当前薄弱点：
  - 移动仍然可能停留在逐字符硬挪
  - 普通模式的主工作节奏还需要继续训练
  - `nvim` 与 LazyVim 还未进入本地环境
- 回看触发条件：
  - 学习 Day 002 和 Day 003 时
  - 本地环境与计划中的 `nvim + LazyVim` 不一致时
  - 需要重新确认主线边界时

## 外部资料使用原则

- 优先看本地实际行为和官方帮助。
- 外部资料只作为补充解释和问题来源，不作为最终事实标准。
- LazyVim 相关问题优先参考官方文档和默认工作流。

## 文章写作提醒

- 每日文章是知识主文档，问题与练习直接写入当天文章。
- 索引文件不承载长篇正文。
- 主线只保留最高频内容。
- 每篇都保留 `扩展内容`，用于收纳低频但有用的能力。

## 最近更新时间

- 2026-04-02T10:15:21+08:00
