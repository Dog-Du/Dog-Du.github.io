---
title: 数据库行业学习索引
date: 2026-04-28T00:00:00+08:00
lastmod: 2026-04-28T00:00:00+08:00
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
- 当前推进方式：`专题制`
- 当前投入节奏：`6-8 小时/周`
- 当前产出形态：`调研报告式个人学习文档`
- 当前主目标：`建立现代数据库行业全局认知`
- 当前副目标：
  - `辅助判断大容量、低成本、SQL、分布式、共享存储、计算节点无状态等数据库架构`
  - `沉淀职业成长所需的系统目标、技术取舍、badcase 和工程启发`
- 当前最近一次主题：`数据库行业学习体系设计`
- 当前下一步：`Day 001：现代数据库行业全景`

## 学习原则

- 专题是推进单位，具体系统是学习单位，模块路径是深度单位。
- 采用 storage-first 视角，优先关注存储、日志、事务、分布式一致性、元数据、二级索引、缓存、后台任务和 badcase。
- 每个重点系统必须讨论系统目标、历史动机、架构图、存储、日志、事务、一致性、元数据、二级索引、缓存、插件生态、badcase、工程启发和引用来源。
- badcase 贯穿每个模块，不做成独立专题。
- 对开源系统，涉及实现细节时优先回到本地源码。
- 对闭源系统，优先使用官方文档、论文、官方博客和官方演讲。
- 插件和生态补丁需要单独分析，区分“能做”和“适合做”。

## 默认专题序列

| 阶段 | 专题 | 重点系统 | 状态 |
| --- | --- | --- | --- |
| 1 | 现代数据库行业全景 | PostgreSQL、MySQL、RocksDB、Redis、Lucene、Snowflake、BigQuery、Spanner、TiDB、ClickHouse、Doris、Milvus | `next` |
| 2 | 传统 OLTP 与存储基础 | PostgreSQL、MySQL/InnoDB、SQLite | `planned` |
| 3 | LSM 与嵌入式存储引擎 | RocksDB、BadgerDB、Pebble | `planned` |
| 4 | 分布式 SQL 与 shared-nothing 架构 | TiDB、CockroachDB、OceanBase、YugabyteDB、Spanner | `planned` |
| 5 | 云原生存算分离数据库 | Aurora、Neon、PolarDB、Azure SQL Hyperscale、Snowflake、BigQuery | `planned` |
| 6 | OLAP、列存与实时分析 | ClickHouse、Apache Doris、StarRocks、DuckDB、Druid、Pinot | `planned` |
| 7 | 搜索、向量与生态补丁 | Lucene/Elasticsearch、Milvus、pgvector、PostgreSQL extension 生态 | `planned` |
| 8 | Lakehouse 与对象存储表格式 | Iceberg、Delta Lake、Paimon | `rolling` |

## 报告索引

| Day | 日期 | 专题 | 文件 | 状态 |
| --- | --- | --- | --- | --- |
| 001 | 2026-04-28 | 现代数据库行业全景 | `learning-database-industry-day001-2026-04-28-modern-database-overview.md` | `planned` |

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
- 存算分离数据库所谓“计算节点无状态”到底把状态转移到了哪些组件？
- 元数据服务在不同系统里为什么会成为 master、PD、catalog service 或 page server 的核心职责？

## 来源与本地源码策略

- 开源系统：优先 clone 到本地，并在报告中记录源码路径、关键目录、关键类或函数。
- 闭源系统：记录官方文档、官方博客、论文、演讲和公开架构图。
- 第三方资料：作为问题来源和辅助理解，不直接作为最终结论。
- 架构图：优先官方图；若自绘 Mermaid 图，注明“根据公开资料整理”。

## 参考设计文档

- `docs/superpowers/specs/2026-04-28-database-industry-learning-design.md`
- `docs/superpowers/plans/2026-04-28-database-industry-learning.md`
- `AGENTS-learning-database-industry.md`
- `learning-database-industry-session.md`

## 下一步

下一篇建议创建：`learning-database-industry-day001-2026-04-28-modern-database-overview.md`

主题：`现代数据库行业全景：传统系统如何演进出现代数据库`
