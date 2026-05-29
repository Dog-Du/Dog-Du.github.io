---
title: 数据库行业学习索引
date: 2026-04-28T00:00:00+08:00
lastmod: 2026-05-29T00:00:00+08:00
tags: [Database, Storage, Distributed Systems]
categories: [数据库]
series:
- "数据库行业学习"
series_order: -1
slug: learning-database-industry-index
summary: 数据库行业长期学习索引与轻量状态文件，用于恢复专题进度、导航调研报告，并记录问题、来源和工程启发。
---

## 当前状态

- 当前学习阶段：`第一阶段：三个月行业全景与 storage-first 专题调研`
- 当前推进方式：`专题分组，按单篇文章逐日推进`
- 当前投入节奏：`6-8 小时/周`
- 当前产出形态：`调研报告式个人学习文档`
- 当前主目标：`建立现代数据库行业全局认知`
- 当前副目标：`沉淀职业成长所需的系统目标、技术取舍、badcase 和工程启发`
- 当前最近一次主题：`Day 004：分布式 SQL 与 shared-nothing 架构预览`
- 当前下一步：`Day 005：云原生存算分离数据库预览`

## 学习原则

- 专题是推进单位，具体系统是学习单位，模块路径是深度单位。
- Day 是单篇文章单位，不是专题单位。
- 采用 storage-first 视角，优先关注存储、日志、事务、分布式一致性、元数据、二级索引、缓存、后台任务和 badcase。
- `Topic 1` 按后续专题预览展开，不按数据库系统展开。
- `Topic 2+` 的重点系统必须讨论系统目标、历史动机、架构图、存储、日志、事务、一致性、元数据、二级索引、缓存、插件生态、badcase、工程启发和引用来源。
- badcase 贯穿每个模块，不做成独立专题。
- 对开源系统，必须先 clone 到本地源码目录；涉及实现细节时必须回到本地源码验证。
- 对闭源系统，优先使用官方文档、论文、官方博客和官方演讲。
- 插件和生态补丁需要单独分析，区分“能做”和“适合做”。
- 每个专题至少应有 1 篇开篇文章和 1 篇收束文章。
- `Topic 1` 的中间文章是后续专题预览文；`Topic 2+` 的中间文章是数据库系统文。

## 默认专题序列

| 阶段 | 专题 | 重点系统 | 状态 |
| --- | --- | --- | --- |
| 1 | 现代数据库行业全景 | 后续专题预览：传统 OLTP、LSM、分布式 SQL、云原生存算分离、OLAP、搜索向量、Lakehouse | `in_progress` |
| 2 | 传统 OLTP 与存储基础 | PostgreSQL、MySQL/InnoDB、SQLite | `planned` |
| 3 | LSM 与嵌入式存储引擎 | RocksDB、BadgerDB、Pebble | `planned` |
| 4 | 分布式 SQL 与 shared-nothing 架构 | TiDB、CockroachDB、OceanBase、YugabyteDB、Spanner | `planned` |
| 5 | 云原生存算分离数据库 | Aurora、Neon、PolarDB、Azure SQL Hyperscale、Snowflake、BigQuery | `planned` |
| 6 | OLAP、列存与实时分析 | ClickHouse、Apache Doris、StarRocks、DuckDB、Druid、Pinot | `planned` |
| 7 | 搜索、向量与生态补丁 | Lucene/Elasticsearch、Milvus、pgvector、PostgreSQL extension 生态 | `planned` |
| 8 | Lakehouse 与对象存储表格式 | Iceberg、Delta Lake、Paimon | `rolling` |

## 专题展开规则

- `Topic 1` 按以下结构展开：
  - `现代数据库行业全景开篇`
  - `后续专题预览文章`
  - `现代数据库行业全景收束`
- `Topic 2+` 按以下结构展开：
  - `专题开篇`
  - `按数据库拆开的系统文章`
  - `专题收束`
- Day 编号对应单篇文章，因此一个专题通常会对应多篇 Day 文章。
- 只有当某专题的开篇、主体文章和收束文章完成后，才把该专题标记为 `done`。Topic 1 的主体文章是专题预览文；Topic 2+ 的主体文章是系统文章。
- `Topic 1` 的预览文章只讲问题域和后续学习框架；`Topic 2+` 的系统文章才进入完整深挖。

## 当前专题文章队列

### Topic 1：现代数据库行业全景

| 顺序 | 文章类型 | 主题 | 目标文件 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | 开篇 | 现代数据库行业全景开篇 | `learning-database-industry-day001-2026-04-28-modern-database-overview.md` | `done` |
| 2 | 预览 | 传统 OLTP 与存储基础预览 | `learning-database-industry-day002-2026-04-30-traditional-oltp-foundations-preview.md` | `done` |
| 3 | 预览 | LSM 与嵌入式存储引擎预览 | `learning-database-industry-day003-2026-05-28-lsm-embedded-storage-preview.md` | `done` |
| 4 | 预览 | 分布式 SQL 与 shared-nothing 架构预览 | `learning-database-industry-day004-2026-05-29-distributed-sql-preview.md` | `done` |
| 5 | 预览 | 云原生存算分离数据库预览 | `learning-database-industry-day005-YYYY-MM-DD-cloud-native-disaggregated-database-preview.md` | `next` |
| 6 | 预览 | OLAP、列存与实时分析预览 | `learning-database-industry-day006-YYYY-MM-DD-olap-columnar-realtime-analytics-preview.md` | `planned` |
| 7 | 预览 | 搜索、向量与生态补丁预览 | `learning-database-industry-day007-YYYY-MM-DD-search-vector-ecosystem-preview.md` | `planned` |
| 8 | 预览 | Lakehouse 与对象存储表格式预览 | `learning-database-industry-day008-YYYY-MM-DD-lakehouse-table-format-preview.md` | `planned` |
| 9 | 收束 | 现代数据库行业全景收束 | `learning-database-industry-day009-YYYY-MM-DD-modern-database-overview-wrapup.md` | `planned` |

## 下一专题预展开

### Topic 2：传统 OLTP 与存储基础

| 顺序 | 文章类型 | 主题 | 目标文件 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | 开篇 | 传统 OLTP 与存储基础开篇 | `learning-database-industry-day010-YYYY-MM-DD-traditional-oltp-foundations-overview.md` | `planned` |
| 2 | 系统 | PostgreSQL | `learning-database-industry-day011-YYYY-MM-DD-postgresql-oltp-storage.md` | `planned` |
| 3 | 系统 | MySQL/InnoDB | `learning-database-industry-day012-YYYY-MM-DD-mysql-innodb-oltp-storage.md` | `planned` |
| 4 | 系统 | SQLite | `learning-database-industry-day013-YYYY-MM-DD-sqlite-oltp-storage.md` | `planned` |
| 5 | 收束 | 传统 OLTP 与存储基础收束 | `learning-database-industry-day014-YYYY-MM-DD-traditional-oltp-foundations-wrapup.md` | `planned` |

## 报告索引

| Day | 日期 | 专题 | 文章类型 | 文件 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 001 | 2026-04-28 | 现代数据库行业全景 | 专题开篇 | `learning-database-industry-day001-2026-04-28-modern-database-overview.md` | `done` |
| 002 | 2026-04-30 | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day002-2026-04-30-traditional-oltp-foundations-preview.md` | `done` |
| 003 | 2026-05-28 | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day003-2026-05-28-lsm-embedded-storage-preview.md` | `done` |
| 004 | 2026-05-29 | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day004-2026-05-29-distributed-sql-preview.md` | `done` |
| 005 | TBD | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day005-YYYY-MM-DD-cloud-native-disaggregated-database-preview.md` | `next` |
| 006 | TBD | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day006-YYYY-MM-DD-olap-columnar-realtime-analytics-preview.md` | `planned` |
| 007 | TBD | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day007-YYYY-MM-DD-search-vector-ecosystem-preview.md` | `planned` |
| 008 | TBD | 现代数据库行业全景 | 专题预览 | `learning-database-industry-day008-YYYY-MM-DD-lakehouse-table-format-preview.md` | `planned` |
| 009 | TBD | 现代数据库行业全景 | 专题收束 | `learning-database-industry-day009-YYYY-MM-DD-modern-database-overview-wrapup.md` | `planned` |
| 010 | TBD | 传统 OLTP 与存储基础 | 专题开篇 | `learning-database-industry-day010-YYYY-MM-DD-traditional-oltp-foundations-overview.md` | `planned` |
| 011 | TBD | 传统 OLTP 与存储基础 | 系统文章 | `learning-database-industry-day011-YYYY-MM-DD-postgresql-oltp-storage.md` | `planned` |
| 012 | TBD | 传统 OLTP 与存储基础 | 系统文章 | `learning-database-industry-day012-YYYY-MM-DD-mysql-innodb-oltp-storage.md` | `planned` |
| 013 | TBD | 传统 OLTP 与存储基础 | 系统文章 | `learning-database-industry-day013-YYYY-MM-DD-sqlite-oltp-storage.md` | `planned` |
| 014 | TBD | 传统 OLTP 与存储基础 | 专题收束 | `learning-database-industry-day014-YYYY-MM-DD-traditional-oltp-foundations-wrapup.md` | `planned` |

## 固定报告模板

模板文件：`content/posts/learning-database-industry-report-template.md`

每篇重点系统报告至少包含：

1. 系统目标与历史动机
2. 目标 workload 与用户需求
3. 整体架构模型图
4. 存储模型
5. 写入路径
6. 读取路径
7. 日志、恢复、CDC
8. 事务、MVCC、batch、并发控制
9. 复制与分布式一致性
10. 元数据管理
11. 二级索引与约束维护
12. 缓存、后台任务、资源隔离
13. 插件、生态补丁与变相方案
14. 我的问题
15. badcase 与架构边界
16. 工程启发
17. 参考来源与引用

## 当前问题

- 如何在行业全景阶段避免过早陷入某个具体系统的源码细节？
- 如何把闭源系统的公开资料和开源系统的源码验证放在同一套判断框架里？
- 如何判断插件能力是系统优势、生态优势，还是不适合重度依赖的变通方案？
- 元数据服务在不同系统里为什么会成为 master、PD、catalog service 或 page server 的核心职责？
- 二级索引在分布式系统里更接近传统 OLTP 索引，还是跨分片物化视图？
- 传统 OLTP 的长事务、日志保留、二级索引回填和后台 GC badcase，在分布式 SQL、存算分离和 Lakehouse 中分别会如何放大？
- LSM 的写放大、读放大、空间放大在不同 workload 下如何权衡？哪些问题可以靠参数缓解，哪些是架构边界？
- key-value separation、BlobDB、value log 和对象存储 blob 在降低大 value 写放大的同时，分别把 GC 复杂性放到了哪里？
- 嵌入式 KV 引擎作为上层数据库 storage engine 时，上层应该如何编码 SQL row、二级索引、MVCC timestamp、tenant 和 range metadata？
- 分布式 SQL 的全局二级索引更像传统 OLTP 索引，还是更像跨分片物化视图？
- PD、meta range、YB-Master、OceanBase rootserver/均衡层、Spanner split lookup 这类元数据路径，分别如何影响前台读写和 schema change？
- 长事务、CDC lag、备份和 follower lag 拖住 GC safepoint 时，不同分布式 SQL 系统如何定位和限流？

## 来源与本地源码策略

- 开源系统：必须 clone 到本地源码目录，默认路径为 `D:\program\<repo-name>`；如果本地已存在则复用，并在报告中记录实际源码路径、关键目录、关键类或函数。
- 无法 clone 的开源系统：必须记录网络、权限或仓库不可用等阻塞原因，并且不能写源码级结论。
- 闭源系统：记录官方文档、官方博客、论文、演讲和公开架构图。
- 第三方资料：作为问题来源和辅助理解，不直接作为最终结论。
- 架构图：优先官方图；若自绘 Mermaid 图，注明“根据公开资料整理”。

## 参考设计文档

- `docs/superpowers/specs/2026-04-28-database-industry-learning-design.md`
- `docs/superpowers/plans/2026-04-28-database-industry-learning.md`
- `AGENTS-learning-database-industry.md`
- `learning-database-industry-session.md`

## 下一步

下一篇建议创建：`learning-database-industry-day005-YYYY-MM-DD-cloud-native-disaggregated-database-preview.md`

主题：`现代数据库行业全景之云原生存算分离数据库预览`

建议重点：

- 说明为什么 shared-nothing 分布式 SQL 之后，还会出现存算分离、serverless、remote storage、log service、page server。
- 解释 Aurora、Neon、PolarDB、Azure SQL Hyperscale、Snowflake、BigQuery 后续为什么各自需要单独成文或横向对照。
- 建立 WAL/log、page、object file、metadata、cache、checkpoint、recovery 和 tenant isolation 的共同比较框架。
- 预先列出 remote read tail latency、cache warmup、log replay、metadata bottleneck、tenant isolation 和成本不可预测等 badcase。
