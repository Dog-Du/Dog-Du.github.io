# Database Industry Learning Workflow

当用户要求学习、讨论、调研、比较、复盘或持久化现代数据库行业相关内容时，优先遵守本文件。

本工作流面向长期学习，不是一次性问答。目标是形成可恢复、可推进、可引用、可回看的数据库行业认知体系。

## 1. 核心目标

- 建立现代数据库行业全局认知。
- 从 storage-first 视角理解系统目标、需求、核心技术、解决方案、缺陷和 badcase。
- 辅助判断大容量、低成本、SQL、分布式、共享存储、计算节点无状态等数据库架构的工程取舍。
- 沉淀调研报告式个人学习文档，而不是写产品百科或宣传稿。

优先级：

1. 行业全局认知。
2. 工程判断和职业视野。
3. 文档沉淀。

## 2. 学习方式

采用“专题推进，系统为单位，模块路径为深度”的方式。

- 专题用于组织阶段进度。
- 具体系统是学习单位。
- 单篇数据库文章是 Day 编号单位。
- 模块路径是理解深度。
- badcase 贯穿每个系统和模块，不单独做成一个专题。

每个专题选若干代表系统。除 Topic 1 外，重点系统按完整模板拆解，辅助系统用于横向对照。

专题与文章的关系必须明确如下：

- `专题` 不是单篇文章，而是一组连续文章的主题分组。
- `Day` 必须对应一篇实际文章，不能用一个 Day 代表整个专题。
- `Topic 1：现代数据库行业全景` 不按数据库系统展开，而是按后续专题展开。
- `Topic 2+` 才按数据库系统展开。

Topic 1 的结构：

- `专题开篇`：建立现代数据库行业地图和统一比较框架。
- `专题预览文章`：后续每个 Topic 各一篇，说明该问题域为什么独立存在、解决什么需求、代表系统有哪些、后续应如何展开、典型 badcase 在哪里。
- `专题收束`：总结现代数据库行业的主线、共性问题、技术分歧和后续学习顺序。

Topic 2+ 的结构：

- `专题开篇`：说明该专题为什么值得学、内部系统列表、比较框架、重点问题和阅读顺序。
- `系统文章`：每个重点数据库各写一篇。
- `专题收束`：回看本专题内各系统的共同点、分歧、badcase 和工程启发。

如果某专题系统很多，可以只对重点系统写完整文章，对辅助系统写横向对照；但 Day 仍然按单篇文章编号，不得把整个专题压成一篇。

## 3. Storage-First 权重

高权重模块：

- 存储模型
- 写入路径
- 读取路径
- WAL、redo、undo、binlog、raft log
- 日志写入、读取、截断、删除、回收
- checkpoint、恢复、CDC、BLOB
- 事务、MVCC、timestamp、snapshot、batch、并发控制
- 分布式一致性、leader、learner、follower read、quorum、lease
- 二级索引、唯一约束、索引回填、索引 GC
- 元数据管理、catalog、schema、table、index、region、tablet、manifest、version、snapshot
- master、PD、meta service、catalog service
- buffer pool、block cache、page cache、metadata cache
- flush、compaction、vacuum、GC、后台任务、资源隔离

低权重但不跳过：

- 查询优化器
- 代价模型
- 执行计划选择
- Volcano、vectorized、pipeline 等执行模型
- SQL 语法生态
- BI 和产品层工作流

低权重模块只学到能解释其如何影响存储、事务、索引、元数据和分布式边界的程度。

## 4. 单系统学习模板

默认情况下，`Topic 2+` 的重点系统报告必须包含以下部分。`Topic 1` 不使用单系统模板；Topic 1 使用专题预览模板。

1. `系统目标与历史动机`
   - 它为什么出现。
   - 受什么系统、论文、工程问题或行业变化启发。
   - 它替代、补充或改进谁。

2. `目标 workload 与用户需求`
   - OLTP、OLAP、HTAP、低成本存储、serverless、多租户、实时分析、搜索、AI 检索、嵌入式等。

3. `整体架构模型图`
   - 优先使用官方架构图。
   - 其次使用官方论文、官方博客、官方演讲图。
   - 高质量第三方图只能作为辅助理解。
   - 原图不清晰时，可根据公开资料自绘 Mermaid 图。
   - 必须解释计算层、存储层、日志层、事务层、元数据层、复制层、缓存层分别在哪里。

4. `存储模型`
   - B+Tree、LSM、列存、对象存储文件、page、SST、segment、tablet、region、partition、倒排索引、向量索引等。

5. `写入路径`
   - 写请求如何进入系统。
   - 是否有 batch、group commit、日志聚合。
   - 是否写 WAL、redo log、raft log、binlog。
   - 何时可见，何时持久化。

6. `读取路径`
   - 点查、范围查、snapshot read、index lookup、remote read、cache miss 后如何走。

7. `日志、恢复、CDC`
   - 日志记录什么。
   - 日志如何写入、读取、分段、截断、删除、回收。
   - checkpoint 与日志回收的关系。
   - 崩溃恢复从哪里开始。
   - CDC 如果存在，读什么日志或变更流。
   - BLOB 或大对象如何进入日志或被日志引用。

8. `事务、MVCC、batch、并发控制`
   - 时间戳、snapshot、可见性、冲突检测、锁、latch、长事务、大事务、失败恢复。

9. `复制与分布式一致性`
   - 复制对象是什么。
   - 主从、Raft、Paxos、quorum、lease 如何使用。
   - leader 如何选举，副本如何追赶，learner/follower read/read replica 如何工作。

10. `元数据管理`
    - catalog、schema、table、index 元数据。
    - tablet、region、shard、partition 元数据。
    - version、manifest、snapshot 元数据。
    - master、PD、meta service、catalog service 的职责。
    - 元数据如何持久化、复制、缓存、变更。
    - 元数据变更如何与数据变更保持一致。

11. `二级索引与约束维护`
    - 二级索引如何编码、写入、保持一致。
    - 唯一索引、异步索引、回填、索引 GC、约束检查。

12. `缓存、后台任务、资源隔离`
    - buffer pool、block cache、page cache、metadata cache、result cache。
    - flush、compaction、vacuum、GC、checkpoint。
    - 如何避免竞争，如何做资源隔离。

13. `插件、生态补丁与变相方案`
    - 原生能力。
    - 官方或主流扩展。
    - 外围系统组合。
    - 变通方案。
    - 必须判断“能做”和“适合做”的区别。

14. `我的问题`
    - 当前不理解的问题。
    - 需要源码验证的问题。
    - 工程实践相关问题。
    - 已解决问题和当前结论。

15. `badcase 与架构边界`
    - 按模块组织，不要最后泛泛列缺点。
    - 至少关注日志、事务、元数据、缓存、分布式一致性、索引、后台任务、成本和多租户。

16. `工程启发`
    - 哪些设计值得借鉴。
    - 哪些复杂性被转移。
    - 哪些方案看似优雅但工程代价高。
    - 哪些 badcase 对存储系统设计有警示意义。

17. `参考来源与引用`
    - 每篇报告必须有引用。
    - 结论必须尽量可追溯。

## 4.1 Topic 1 专题预览模板

Topic 1 的每篇预览文章只预览后续一个专题，不逐个数据库深挖。预览文章至少包含：

1. `这个专题为什么独立存在`
   - 它对应什么行业需求或工程压力。
   - 它和其他专题的边界在哪里。

2. `代表系统与学习顺序`
   - 列出后续专题中的重点系统。
   - 说明哪些是重点系统，哪些是辅助对照。

3. `核心问题域`
   - 从 storage-first 视角列出本专题最值得追问的模块问题。
   - 例如日志、存储模型、事务、元数据、索引、缓存、后台任务、资源隔离。

4. `典型技术路线`
   - 只做路线级概括，不罗列实现细节。
   - 说明后续系统文章会在哪些地方深入。

5. `badcase 与架构边界`
   - 列出本专题常见 badcase。
   - 明确哪些问题需要后续系统文章验证。

6. `工程启发`
   - 说明这个专题对共享存储、计算节点无状态、低成本、大容量 SQL 数据库设计有什么启发。

7. `我的问题`
   - 记录预览阶段形成的问题。

8. `参考来源与引用`
   - 每篇预览文章也必须有引用。

## 5. 资料来源与引用规则

每篇学习报告必须包含 `参考来源与引用`。

最低要求：

- 每篇学习报告至少 5 条参考来源。
- 每个重点系统至少 2 条来源。
- 开源系统必须 clone 到本地源码目录，并至少包含官方文档或设计文档，以及本地源码锚点。
- 闭源系统至少包含官方文档、官方博客、论文、官方演讲中的至少 2 类。
- 架构图必须标注来源。
- 自绘 Mermaid 图必须注明“根据公开资料整理”。

来源优先级：

| 优先级 | 来源 |
| --- | --- |
| P0 | 本地源码、官方文档、官方论文 |
| P1 | 官方博客、官方技术演讲、设计文档 |
| P2 | GitHub issue、discussion、maintainer 讨论 |
| P3 | 高质量第三方博客、课程、社区文章 |
| P4 | 普通二手资料，只能作为线索 |

开源系统源码规则：

- 开源系统必须 clone 到本地源码目录，默认放在 `D:\program\<repo-name>`。
- 如果本地已经存在对应仓库，优先复用已有本地仓库，并记录实际路径。
- 报告中涉及实现级判断时，必须记录本地源码路径、关键目录、关键文件、类或函数。
- 如果因为网络、权限或仓库不可用导致暂时无法 clone，必须在报告的 `我的问题` 或 `参考来源与引用` 中记录阻塞原因，并且不能把未验证内容写成源码级结论。

闭源系统不强行源码验证，但必须标注公开资料来源；无法直接验证的判断要写明“基于公开资料推断”。

## 6. 插件与生态补丁分析规则

必须区分以下四层：

| 层次 | 含义 | 示例 |
| --- | --- | --- |
| 原生能力 | 系统内核直接支持 | PostgreSQL 的 SQL、MVCC、B+Tree |
| 官方或主流扩展 | 插件补能力 | pgvector、PostGIS、TimescaleDB、Citus |
| 外围系统组合 | 靠别的系统配合 | PostgreSQL + Elasticsearch、MySQL + Canal + ClickHouse |
| 变通方案 | 能做但不舒服 | 用 JSONB 模拟文档库，用关系表模拟队列 |

结论不能停在“支持/不支持”，必须判断：

- 这个能力是否原生擅长。
- 插件补齐的是功能、性能、生态，还是只是变通。
- 数据量、并发、更新频率、查询形态放大后是否仍然成立。
- 和专门系统相比，优势和边界分别在哪里。

## 7. 默认三个月专题序列

| 阶段 | 专题 | 重点系统 |
| --- | --- | --- |
| 1 | 现代数据库行业全景 | 后续专题预览：传统 OLTP、LSM、分布式 SQL、云原生存算分离、OLAP、搜索向量、Lakehouse |
| 2 | 传统 OLTP 与存储基础 | PostgreSQL、MySQL/InnoDB、SQLite |
| 3 | LSM 与嵌入式存储引擎 | RocksDB、BadgerDB、Pebble |
| 4 | 分布式 SQL 与 shared-nothing 架构 | TiDB、CockroachDB、OceanBase、YugabyteDB、Spanner |
| 5 | 云原生存算分离数据库 | Aurora、Neon、PolarDB、Azure SQL Hyperscale、Snowflake、BigQuery |
| 6 | OLAP、列存与实时分析 | ClickHouse、Apache Doris、StarRocks、DuckDB、Druid、Pinot |
| 7 | 搜索、向量与生态补丁 | Lucene/Elasticsearch、Milvus、pgvector、PostgreSQL extension 生态 |
| 8 | Lakehouse 与对象存储表格式 | Iceberg、Delta Lake、Paimon |

前三个月优先完成阶段 1 到阶段 7。阶段 8 作为滚动补充。

## 8. 文件与命名规则

所有学习报告写入 `content/posts`。

Day 编号规则：

- Day 是单篇文章编号单位。
- `Topic 1` 展开成：
  - 1 篇专题开篇
  - N 篇后续专题预览文章
  - 1 篇专题收束
- `Topic 2+` 通常会展开成：
  - 1 篇专题开篇
  - N 篇系统文章
  - 1 篇专题收束
- 因此专题数不等于文章数，系统数也不必等于专题数。

稳定索引文件唯一：

- `content/posts/learning-database-industry-day000-index.md`

报告模板文件：

- `content/posts/learning-database-industry-report-template.md`

新报告命名：

- `learning-database-industry-dayXXX-YYYY-MM-DD-<topic>.md`

说明：

- `XXX` 为三位数字。
- `YYYY-MM-DD` 为本地日期。
- `<topic>` 使用小写英文短语，单词之间用连字符连接。

## 9. Index 维护规则

索引文件只做导航和轻量状态维护，不承载长篇知识正文。

索引至少记录：

- 当前学习阶段。
- 当前最近一次学习主题。
- 默认专题序列。
- 每个专题展开成哪些文章。
- 报告索引。
- 当前问题。
- 来源和本地源码策略。
- 下一篇建议。

如果索引与具体报告冲突，以具体报告和实际文件序列为准，然后修正索引。

## 10. 新 Session 恢复流程

每次新 session 进入数据库行业学习时：

1. 扫描 `content/posts` 中所有 `learning-database-industry-day*.md`。
2. 补充扫描标题、文件名或正文中包含 `数据库行业`、`database industry`、`PostgreSQL`、`MySQL`、`RocksDB`、`Snowflake`、`BigQuery`、`Spanner`、`TiDB`、`ClickHouse`、`Doris`、`StarRocks`、`Milvus`、`Lakehouse` 的旧文章。
3. 读取稳定索引 `content/posts/learning-database-industry-day000-index.md`。
4. 恢复当前阶段、已完成报告、当前问题和下一篇建议。
5. 根据用户本次意图决定是答疑、更新索引、创建新报告，还是推进当前专题下的下一篇文章。Topic 1 按后续专题预览推进；Topic 2+ 按专题开篇、系统文章、专题收束推进。

## 11. 完成后必须说明

每次完成数据库行业学习相关任务后，回复中必须说明：

- 当前处于哪个专题阶段。
- 本次新建或更新了哪些 Markdown 文件。
- 本次主要参考了哪些来源或源码目录。
- 下一步建议学习什么。
