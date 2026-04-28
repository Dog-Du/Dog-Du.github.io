# 数据库行业学习与调研体系设计

日期：2026-04-28

## 背景

本仓库已经有数据库基础、CMU 15-445、RocksDB 连续学习等内容。新的学习线不重复做数据库教材式学习，而是面向“现代数据库行业认知”和“存储开发者视角的系统调研”。

第一阶段以三个月为周期，后续长期滚动补充。学习节奏按每周 6-8 小时设计，允许阅读少量高价值论文，但不把论文细节作为主线。

## 目标

优先级如下：

1. 建立现代数据库行业全局认知。
2. 辅助判断大容量、低成本、SQL、分布式、共享存储、计算节点无状态等数据库项目的工程取舍。
3. 服务个人职业成长，能讲清现代数据库的目标、需求、核心技术、缺陷和 badcase。
4. 通过调研报告沉淀可回看的个人学习文档。

## 非目标

- 不做泛泛的数据库产品百科。
- 不追求每个系统都深入到同等源码深度。
- 不把查询优化器和执行引擎作为第一阶段主线。
- 不把 badcase 做成单独专题；badcase 必须贯穿每个系统和模块。
- 不把“系统用了哪些技术”当成核心结论。

## 总体方法

采用“专题推进，系统为单位，模块路径为深度”的方式。

专题用于组织进度；每个专题选择若干代表系统。每个系统按固定模板拆解，重点回答它为什么出现、如何解决问题、把复杂性转移到哪里、哪些问题只能靠插件或外围系统变相解决、在哪些场景下会失败。

学习权重采用 storage-first 视角：

| 权重 | 模块 |
| --- | --- |
| 高 | 存储模型、写入路径、读取路径、日志、恢复、CDC、事务、MVCC、batch、分布式一致性、二级索引、缓存、元数据管理、后台任务 |
| 中 | 插件生态、外围系统组合、产品需求、成本模型、资源隔离 |
| 低 | 查询优化器、执行引擎、BI 产品层、SQL 语法细节 |

计算层不跳过，但只学习到能理解其如何影响存储、索引、事务和分布式执行边界。

## 单系统学习模板

每个重点系统的学习报告必须包含以下部分。

### 1. 系统目标与历史动机

说明系统为什么出现，受什么系统、论文、工程问题或行业变化启发，想替代或补充谁。

### 2. 目标 workload 与用户需求

明确它面向 OLTP、OLAP、HTAP、低成本存储、serverless、多租户、实时分析、搜索、AI 检索或嵌入式场景中的哪一类需求。

### 3. 整体架构模型图

每篇重点系统报告必须包含整体架构图。优先级如下：

1. 官方文档架构图。
2. 官方论文、官方博客、官方演讲中的架构图。
3. 高质量第三方文章中的图。
4. 根据公开资料自绘 Mermaid 图。

架构图之后必须解释计算层、存储层、日志层、事务层、元数据层、复制层、缓存层分别在哪里。

### 4. 存储模型

说明底层数据如何组织，例如 B+Tree、LSM、列存、对象存储文件、page、SST、segment、tablet、region、partition、倒排索引或向量索引。

### 5. 写入路径

说明写请求如何进入系统，是否支持 batch、group commit、日志聚合，写入是否经过 WAL、redo log、raft log 或 binlog，何时可见，何时持久化。

### 6. 读取路径

说明点查、范围查、snapshot read、index lookup、remote read、cache miss 后的路径，以及读路径如何处理可见性和缓存。

### 7. 日志、恢复、CDC

至少回答：

- 日志记录什么：逻辑、物理、redo、undo、WAL、binlog、raft log。
- 日志如何写入、读取、分段、截断、删除和回收。
- checkpoint 与日志回收如何关联。
- 崩溃恢复从哪里开始。
- 如果支持 CDC，CDC 读取的是哪类日志或变更流。
- 如果支持 BLOB 或大对象，日志如何处理大对象或引用。

### 8. 事务、MVCC、batch、并发控制

说明时间戳、snapshot、可见性、冲突检测、锁、latch、长事务、大事务、失败恢复、批量写入原子性和并发安全。

### 9. 复制与分布式一致性

说明复制对象是什么，采用主从、Raft、Paxos、quorum、lease 或其他机制，leader 如何选举，副本如何追赶，learner/follower read/read replica 如何工作。

### 10. 元数据管理

元数据必须单独成节。至少覆盖：

- catalog、schema、table、index 元数据。
- tablet、region、shard、partition 元数据。
- version、manifest、snapshot 等版本元数据。
- master、PD、meta service 或 catalog service 负责什么。
- 元数据如何持久化、复制、缓存和变更。
- 元数据变更如何与数据变更保持一致。

### 11. 二级索引与约束维护

说明二级索引如何编码、写入、维护一致性，唯一索引、异步索引、索引回填、索引 GC 和约束检查如何处理。

### 12. 缓存、后台任务、资源隔离

覆盖 buffer pool、block cache、page cache、metadata cache、result cache；flush、compaction、vacuum、GC、checkpoint；以及竞争规避、资源隔离和后台任务调度。

### 13. 插件、生态补丁与变相方案

明确区分四类能力：

| 层次 | 含义 | 示例 |
| --- | --- | --- |
| 原生能力 | 系统内核直接支持 | PostgreSQL 的 SQL、MVCC、B+Tree |
| 官方或主流扩展 | 插件补能力 | pgvector、PostGIS、TimescaleDB、Citus |
| 外围系统组合 | 靠别的系统配合 | PostgreSQL + Elasticsearch、MySQL + Canal + ClickHouse |
| 变通方案 | 能做但不舒服 | 用 JSONB 模拟文档库，用关系表模拟队列 |

报告必须判断“能做”和“适合做”的区别。

### 14. 我的问题

固定记录学习过程中的问题：

- 当前不理解的问题。
- 需要源码验证的问题。
- 和工程实践相关的问题。
- 已解决问题及当前结论。

### 15. badcase 与架构边界

badcase 必须按模块组织，避免最后泛泛列缺点。至少覆盖日志、事务、元数据、缓存、分布式一致性、索引、后台任务中的相关风险。

### 16. 工程启发

总结哪些设计值得借鉴，哪些复杂性被转移，哪些方案看似优雅但工程代价高，哪些 badcase 对存储系统设计有警示意义。

### 17. 参考来源与引用

每篇报告必须有引用，且结论要可追溯。最低要求：

- 每篇专题报告至少 5 条参考来源。
- 每个重点系统至少 2 条来源。
- 开源系统至少包含官方文档或设计文档，以及本地源码锚点。
- 闭源系统至少包含官方文档、官方博客、论文、官方演讲中的至少 2 类。
- 架构图必须注明来源；自绘图注明“根据公开资料整理”。

## 来源优先级

| 优先级 | 来源 |
| --- | --- |
| P0 | 本地源码、官方文档、官方论文 |
| P1 | 官方博客、官方技术演讲、设计文档 |
| P2 | GitHub issue、discussion、maintainer 讨论 |
| P3 | 高质量第三方博客、课程、社区文章 |
| P4 | 普通二手资料，只能作为线索 |

开源系统应尽量 clone 到本地，用源码验证关键判断。闭源系统不强行源码验证，但必须标注公开资料来源；无法直接验证的判断要写明“基于公开资料推断”。

## 三个月专题序列

| 周期 | 专题 | 重点系统 | 学习目标 |
| --- | --- | --- | --- |
| 第 1-2 周 | 现代数据库行业全景 | PostgreSQL、MySQL、RocksDB、Redis、Lucene、Snowflake、BigQuery、Spanner、TiDB、ClickHouse、Doris、Milvus | 建立行业地图，理解传统系统如何演进出现代数据库 |
| 第 3-4 周 | 传统 OLTP 与存储基础 | PostgreSQL、MySQL/InnoDB、SQLite | 理解单机数据库的存储、日志、事务、索引、MVCC、扩展边界 |
| 第 5-6 周 | LSM 与嵌入式存储引擎 | RocksDB、BadgerDB、Pebble | 学习 WAL、MemTable、SST、value log、compaction、snapshot、iterator、GC、读写放大 |
| 第 7-8 周 | 分布式 SQL 与 shared-nothing 架构 | TiDB、CockroachDB、OceanBase、YugabyteDB、Spanner | 学习事务、一致性、region/tablet、二级索引、元数据、跨分片 badcase |
| 第 9-10 周 | 云原生存算分离数据库 | Aurora、Neon、PolarDB、Azure SQL Hyperscale、Snowflake、BigQuery | 学习共享存储、日志下沉、page server、缓存、元数据、多租户、serverless |
| 第 11 周 | OLAP、列存与实时分析 | ClickHouse、Apache Doris、StarRocks、DuckDB、Druid、Pinot | 学习列存、segment/part、导入、merge、主键模型、物化视图、冷热分层 |
| 第 12 周 | 搜索、向量与生态补丁 | Lucene/Elasticsearch、Milvus、pgvector、PostgreSQL extension 生态 | 学习倒排索引、向量索引、混合检索、插件补能力的边界 |
| 后续滚动 | Lakehouse 与对象存储表格式 | Iceberg、Delta Lake、Paimon | 学习元数据、snapshot、文件管理、ACID、小文件、compaction |

## 产出形态

每个专题产出一篇调研报告式个人学习文档。它偏内部学习，不追求公开博客叙事，重点是结构、对比、结论、缺陷、badcase、引用和工程启发。

每篇报告应能独立回答：

1. 这个专题解决什么行业问题。
2. 代表系统分别从哪里来。
3. 每个系统原生强在哪里。
4. 哪些能力靠插件、生态或外围系统补齐。
5. 哪些模块是该系统真正的工程难点。
6. 哪些 badcase 暴露了架构边界。
7. 对存储系统设计有什么工程启发。

## 第一篇建议

第一篇建议从“现代数据库行业全景：传统系统如何演进出现代数据库”开始。它不深挖源码，重点建立行业地图、系统分类、代表系统、演进关系和后续专题入口。

第二篇开始进入传统 OLTP 与存储基础，逐步把 PostgreSQL、MySQL/InnoDB、SQLite、RocksDB、BadgerDB、Pebble 等系统纳入路径级拆解。
