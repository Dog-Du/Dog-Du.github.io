---
title: RocksDB 学习索引
date: 2026-04-01T19:11:02+08:00
lastmod: 2026-04-01T19:24:44+08:00
tags: [RocksDB, Database, Storage]
categories: [数据库]
slug: learning-rocksdb-index
summary: RocksDB 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章以及记录关键薄弱点。
---

## 当前状态

- 当前学习总天数：`1`
- 当前最近一次学习主题：`Day 001：整体架构与 LSM-Tree`
- 当前主线阶段：`第 1 章：整体架构与 LSM-Tree`
- 上一篇文章写到：
  - `DB / DBImpl -> ColumnFamilyData -> SuperVersion -> MemTable / VersionSet` 的整体关系
  - 已经串到 `WriteImpl / GetImpl / MaybeScheduleFlushOrCompaction` 的第一层主流程
  - 还没有深入 `Recover / LogAndApply / VersionEdit / SuperVersion` 安装细节
- 已学过主题：
  - `Day 001：整体架构与 LSM-Tree`
- 下一步建议：`进入 Day 002：DB 打开流程与核心对象关系`
- 当前仍需补看的关键点：
  - `VersionSet / MANIFEST / VersionEdit` 如何在打开阶段完成恢复与安装
  - `SuperVersion` 的安装时机与旧视图回收
  - `WriteImpl` 中写线程、sequence number、WAL 与 memtable 的更细粒度协作

## 默认学习主线

1. 整体架构与 LSM-Tree
2. DB 打开流程与核心对象关系
3. 写路径：`Write Path / WriteBatch / Sequence Number`
4. `WAL`
5. `MemTable / SkipList / Arena`
6. `Flush`
7. `SSTable / BlockBasedTable / 各类 Block`
8. 读路径：`Read Path / Get / MultiGet / Iterator`
9. `Snapshot / Sequence Number / 可见性语义`
10. 磁盘管理 / 文件读写抽象 / `WAL`、`Manifest`、`SST` 的磁盘角色 / `Table Reader` / `Block` / `OS Page Cache`
11. `MANIFEST / VersionEdit / VersionSet`
12. `Compaction` 及其策略与三大放大权衡
13. `Block Cache / Bloom Filter / Prefix Bloom / Partition Index`
14. `Column Family`
15. 事务与并发控制
16. 参数调优 / `Rate Limiter` / `Write Stall`
17. 高级特性与专题深挖

## 每日文章索引

| Day | 日期 | 主题 | 文章文件 | 状态 |
| --- | --- | --- | --- | --- |
| 001 | 2026-04-01 | 整体架构与 LSM-Tree | `learning-rocksdb-day001-2026-04-01-architecture-and-lsm-tree.md` | `revisit` |

说明：

- `状态` 建议使用：
  - `done`
  - `revisit`
  - `next`
- 当某天文章实际创建后，用真实文件名替换 `TBD`
- 如果当天只是补充问答而没有开启新一天，优先更新对应日文章，而不是新增一行

## 章节掌握快照

每完成一天学习后，为该天记录一份轻量快照。

### Day 001

- 主题：`整体架构与 LSM-Tree`
- 文件：`learning-rocksdb-day001-2026-04-01-architecture-and-lsm-tree.md`
- understanding_status：`yellow`
- mastery_score：`3/5`
- weak_points：
  - `VersionSet / VersionEdit / MANIFEST` 的恢复链路还没闭环
  - `SuperVersion` 的安装和回收时机还只理解到第一层
  - `WriteImpl` 内部的写线程分组与 sequence 分配还没细看
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\db\db_impl\db_impl.h`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\column_family.h`
  - `D:\program\rocksdb\db\memtable.h`
  - `D:\program\rocksdb\db\memtable_list.h`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\dbformat.h`

可选字段：

- ready_for_next：`yes`
- next_review_trigger：`当学习 DB 打开流程、Snapshot 或 MANIFEST 时回看`

状态使用建议：

- `green`
  - 通常为 `4/5` 或 `5/5`
  - 没有关键误解
  - 可以直接进入下一章
- `yellow`
  - 通常为 `3/5`
  - 或 `4/5` 但仍有一个关键链路没有完全闭环
  - 可以推进，但应标记为 `revisit`
- `red`
  - 通常为 `0/5` 到 `2/5`
  - 或存在明显关键误解
  - 不推进，先补充学习或问答

## 当前薄弱点与回看提示

- 当前薄弱点：
  - `Recover -> LogAndApply -> InstallSuperVersion` 的完整启动链路
  - `VersionSet` 与读路径可见视图之间的职责边界
  - `SequenceNumber` 在写路径中的真实分配过程
- 回看触发条件：
  - `学习 Day 002：DB 打开流程与核心对象关系`
  - `学习 Snapshot / Sequence Number / 可见性语义`
  - `学习 MANIFEST / VersionEdit / VersionSet`

## 外部资料使用原则

- 外部资料只作为问题来源和补充视角，不作为最终事实标准。
- 优先来源：
  - RocksDB GitHub Wiki
  - RocksDB GitHub Issues
  - RocksDB GitHub Discussions
  - RocksDB 官方文档或官方博客
- 次优先来源：
  - Stack Overflow
  - 知乎
  - linux.do
  - 高质量个人技术博客
- 最终结论必须回到 `D:\program\rocksdb` 中的当前本地源码验证。

## 文章写作提醒

- 每日文章是知识主文档，问题与问答直接写入当天文章。
- 索引文件不承载长篇知识正文。
- 当结构、流程、状态迁移或模块协作适合图示时，优先在每日文章中加入 Mermaid 图。
- `设计动机`、`横向对比`、`工程启发` 是主线文章中的可选补充模块，不是独立主线。

## 最近更新时间

- 2026-04-01T19:24:44+08:00
