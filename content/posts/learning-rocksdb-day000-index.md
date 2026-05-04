---
title: RocksDB 学习索引
date: 2026-04-01T19:11:02+08:00
lastmod: 2026-05-04T19:32:50+08:00
tags: [RocksDB, Database, Storage]
categories: [数据库]
series:
- "RocksDB 学习笔记"
series_order: -1
slug: learning-rocksdb-index
summary: RocksDB 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章，并记录掌握度与最近一天复习问答闸门状态。
---

## 当前状态

- 当前学习总天数：`12`
- 当前最近一次学习主题：`Day 012：MANIFEST / VersionEdit / VersionSet`
- 当前主线阶段：`第 12 章：版本管理与元数据：MANIFEST / VersionEdit / VersionSet`
- 上一篇文章写到：
  - `CURRENT` 只是 active MANIFEST 的指针文件，本身不承载版本内容
  - `SetCurrentFile(...)` 不是原地改写旧 `CURRENT`，而是先写并 sync 临时文件，再 rename 覆盖正式 `CURRENT`，可用时还会 fsync 目录
  - `SetCurrentFile(...)` 本身不是并发控制层；正常路径由 `VersionSet::LogAndApply(...)` 的 DB mutex 和 `manifest_writers_` 队列保证 MANIFEST/CURRENT 提交串行化
  - RocksDB 可以通过 `FileSystem` 抽象接入远程文件系统，但 `CURRENT` 切换仍要求 `RenameFile(...)` 提供等价的原子替换语义；普通 S3 rename 通常是 copy + delete，S3 Express One Zone directory bucket 的 `RenameObject` 是特例
  - RocksDB 不能简化为 `SST + MANIFEST + VersionSet`；`VersionSet` 聚集的是版本相关元数据，不是全部架构或全部元数据
  - 若只看恢复用户数据所需的核心持久状态，应理解为 `CURRENT + MANIFEST + SST + WAL`；`VersionSet` 是由 MANIFEST 重建出来的内存管理器
  - 即使把 WAL/SST/OPTIONS/blob/log 当作状态文件而不算元数据，`VersionSet/MANIFEST` 也只能称为版本元数据中心，不是所有持久化元数据的唯一归宿
  - MANIFEST 提交确实会 sync，但发生在 flush/compaction/CF 操作等版本提交点，不是每次用户写入；RocksDB 通过批量提交、顺序追加、预分配和 rollover 控制降低影响
  - `CURRENT` 不保证磁盘上只有一个 MANIFEST，它只指向 active MANIFEST；旧 MANIFEST 会先进入 obsolete 列表，再由 purge 路径后续删除
  - `VersionEdit` 是 tag-based 元数据增量记录，不是完整快照；它能表达 SST 增删、WAL 增删、log number、next file number、last sequence 等边界推进
  - `VersionSet` 是全库唯一的版本元数据管理器；`Version` 则是某个 CF 的具体文件集合快照
  - `VersionBuilder` 用来把一串 `VersionEdit` 应用到某个 base version 上，而不需要创建中间完整 `Version`
  - `VersionSet::LogAndApply()` 会先进入 `manifest_writers_` 队列，再统一做 builder apply、MANIFEST 追加写、必要时切换新 MANIFEST、最后安装新的 current version
  - 新 MANIFEST 不是空白起步；`WriteCurrentStateToManifest(...)` 会先把 DB ID、WAL 状态、每个 CF 的文件集合和 log/sequence 边界写成一份完整基线
  - `VersionSet::Recover()` 的主链是 `CURRENT -> MANIFEST -> VersionEditHandler::Iterate -> VersionBuilder -> AppendVersion`
  - 正常恢复并不会为每条 MANIFEST record 创建一个 `Version`；它是先持续 apply edits，最后再 materialize 最终 end version
  - Day 007 里“flush 真正完成点是 LogAndApply”与 Day 011 里“FileMetaData 持久化在 MANIFEST”两条线，已经在 Day 012 闭环
  - `VersionSet` 更新的是某个 CF 的 `current Version`；真正给读路径发布稳定视图，还要靠 `SuperVersion`
- 已学过主题：
  - `Day 001：整体架构与 LSM-Tree`
  - `Day 002：DB 打开流程与核心对象关系`
  - `Day 003：Write Path / WriteBatch / Sequence Number`
  - `Day 004：WAL`
  - `Day 005：MemTable / SkipList / Arena`
  - `Day 006：MemTable 深入：可见性、删除、范围删除与读语义`
  - `Day 007：Flush`
  - `Day 008：SSTable / BlockBasedTable / 各类 Block`
  - `Day 009：Read Path / Get / MultiGet / Iterator`
  - `Day 010：Snapshot / Sequence Number / 可见性语义`
  - `Day 011：磁盘 I/O / TableReader / Block 读取 / OS Page Cache`
  - `Day 012：MANIFEST / VersionEdit / VersionSet`
- 下一步建议：
  - `Day 012 复习题已回答；下一步进入 Day 013：Compaction 及其策略与三大放大权衡`
- 当前仍需补看的关键点：
  - `VersionEditHandlerPointInTime / best-efforts recovery` 如何在 MANIFEST 缺损时找回一个仍然有效的旧版本，还没单独展开
  - `manifest_writers_ / atomic group / multi-CF group commit` 只走通了主链，还没细拆并发与原子组细节
  - `CURRENT 切换失败 / MANIFEST rollover / obsolete manifest cleanup` 已补过主结论，但 DB open/recovery 里的异常细节还需要后续压实
  - `Block Cache / Bloom Filter / Prefix Bloom / Partitioned Index` 的读优化主线还没展开

## 最近一天复习问答闸门

- latest_review_day：`Day 012`
- latest_review_file：`learning-rocksdb-day012-2026-05-03-manifest-versionedit-versionset.md`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-04T17:20:52+08:00`
- review_notes：`Day 012 复习问答已完成。整体能说明 CURRENT 指向 active MANIFEST、VersionEdit 是增量记录、Recover 不为每条 record 创建完整 Version，以及 VersionBuilder 用来累积应用 edits。需要纠偏两点：MANIFEST rollover 的“完整状态”仍是通过 VersionEdit 编码，不是直接 dump VersionSet；LogAndApply 只安装 current Version 和更新版本元数据，不负责发布 SuperVersion，SuperVersion 由更外层 ColumnFamilyData/DBImpl 路径安装，用于 pin mem/imm/current Version 的读视图。当前判定 partial，可继续进入 Day 013，但后续学习 Compaction 时要回看 LogAndApply 与 SuperVersion 发布边界。`
- review_block_next：`no`

说明：

- 最近一天的 `review_status` 为空时，表示该日复习题还未回答。
- 下一次如果用户说“继续”，应先回答 `latest_review_day` 的复习题，再决定是否推进下一天。
- 只阻断最近一天，不追溯更早历史章节。

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
| 002 | 2026-04-09 | DB 打开流程与核心对象关系 | `learning-rocksdb-day002-2026-04-09-db-open-and-core-object-relationships.md` | `done` |
| 003 | 2026-04-12 | Write Path / WriteBatch / Sequence Number | `learning-rocksdb-day003-2026-04-12-write-path-writebatch-sequence-number.md` | `done` |
| 004 | 2026-04-13 | WAL | `learning-rocksdb-day004-2026-04-13-wal.md` | `done` |
| 005 | 2026-04-15 | MemTable / SkipList / Arena | `learning-rocksdb-day005-2026-04-15-memtable-skiplist-arena.md` | `done` |
| 006 | 2026-04-18 | MemTable 深入：可见性、删除、范围删除与读语义 | `learning-rocksdb-day006-2026-04-18-memtable-visibility-delete-range-tombstone.md` | `done` |
| 007 | 2026-04-20 | Flush | `learning-rocksdb-day007-2026-04-20-flush.md` | `revisit` |
| 008 | 2026-04-22 | SSTable / BlockBasedTable / 各类 Block | `learning-rocksdb-day008-2026-04-22-sstable-blockbasedtable-and-blocks.md` | `revisit` |
| 009 | 2026-04-26 | Read Path / Get / MultiGet / Iterator | `learning-rocksdb-day009-2026-04-26-read-path-get-multiget-iterator.md` | `done` |
| 010 | 2026-04-30 | Snapshot / Sequence Number / 可见性语义 | `learning-rocksdb-day010-2026-04-30-snapshot-sequence-number-visibility.md` | `done` |
| 011 | 2026-05-01 | 磁盘 I/O / TableReader / Block 读取 / OS Page Cache | `learning-rocksdb-day011-2026-05-01-disk-io-table-reader-block-read.md` | `revisit` |
| 012 | 2026-05-03 | MANIFEST / VersionEdit / VersionSet | `learning-rocksdb-day012-2026-05-03-manifest-versionedit-versionset.md` | `revisit` |

说明：

- `状态` 建议使用：
  - `done`
  - `revisit`
  - `next`
- 如果当天只是补充问答而没有开启新的一天，优先更新对应日文章和索引状态，而不是新增一行。

## 章节掌握快照

### Day 001

- 主题：`整体架构与 LSM-Tree`
- 文件：`learning-rocksdb-day001-2026-04-01-architecture-and-lsm-tree.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `VersionSet / VersionEdit / MANIFEST` 的恢复链路还没闭环
  - `SuperVersion` 的安装和回收时机还只理解到第一层
  - `WriteImpl` 内部的写线程分组和 sequence 分配还没细看
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
- ready_for_next：`yes`
- next_review_trigger：`当学习 DB 打开流程、Snapshot 或 MANIFEST 时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：
- review_notes：`历史章节在复习问答闸门引入之前形成，先按 partial 视为可继续，但保留 revisit。`
- review_block_next：`no`

### Day 002

- 主题：`DB 打开流程与核心对象关系`
- 文件：`learning-rocksdb-day002-2026-04-09-db-open-and-core-object-relationships.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `VersionEditHandler` 的逐条 record 回放细节还没单独拆开
  - `TryRecover / best-efforts recovery` 分支暂时只知道骨架
  - `recovery_ctx` 中 `cfds_ / edit_lists_` 的精确填充时机还可以继续细读
  - `LogAndApplyForRecovery` 与 `WAL replay` 的职责边界还值得回看
  - `SuperVersion` 的“发布稳定可读视图”表述后面读路径章节还要继续压实
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\column_family.h`
  - `D:\program\rocksdb\db\column_family.cc`
- ready_for_next：`yes`
- next_review_trigger：`当学习 WAL、MANIFEST / VersionEdit / VersionSet、Flush 或读路径时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-04-12`
- review_notes：`第一次复习问答已完成。补充澄清后，已经能区分 WAL replay 与 LogAndApplyForRecovery 的职责边界；也已经能回答 SuperVersion 组织 mem / imm / SST 并为前台读提供稳定视图。整体达到 partial，可继续推进，但建议在读路径章节回看该表述。`
- review_block_next：`no`

### Day 003

- 主题：`Write Path / WriteBatch / Sequence Number`
- 文件：`learning-rocksdb-day003-2026-04-12-write-path-writebatch-sequence-number.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `log::Writer::AddRecord()` 的物理块格式还没展开
  - `WriteBatch` header 里的 `sequence` 在 WAL / replay / memtable 三处的统一作用还值得再压实
  - `SequenceNumber` 在 snapshot / 可见性里的消费路径还没进入
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\include\rocksdb\write_batch.h`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\write_thread.h`
  - `D:\program\rocksdb\db\write_thread.cc`
  - `D:\program\rocksdb\db\write_batch_internal.h`
  - `D:\program\rocksdb\db\write_batch.cc`
  - `D:\program\rocksdb\db\dbformat.h`
- ready_for_next：`yes`
- next_review_trigger：`当学习 WAL、MemTable、Snapshot / Sequence Number / 可见性语义时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-04-12`
- review_notes：`第一次复习问答已完成。当前已经没有关键误解，可以进入 Day 004；但建议在 WAL 章节回看 WriteBatch header 中 sequence 的统一作用，以及 pipelined write 与默认路径的边界。`
- review_block_next：`no`

### Day 004

- 主题：`WAL`
- 文件：`learning-rocksdb-day004-2026-04-13-wal.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `log::Writer::AddRecord()` 的压缩、recyclable WAL 与 checksum 细节还没完全压实
  - `wal_filter` 只知道入口和作用，还没看实际使用场景
  - `SequenceNumber` 在 recovery replay 之后如何进入读可见性判断还没进入
- source_anchors：
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\log_format.h`
  - `D:\program\rocksdb\db\log_writer.h`
  - `D:\program\rocksdb\db\log_writer.cc`
  - `D:\program\rocksdb\db\log_reader.h`
  - `D:\program\rocksdb\db\log_reader.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\include\rocksdb\wal_filter.h`
- ready_for_next：`yes`
- next_review_trigger：`当学习 MemTable、Snapshot / Sequence Number / 可见性语义、恢复路径细节时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-04-13`
- review_notes：`第一次复习问答已完成。已经能回答 WAL 的主流程、分片类型、recovery 回放和顺序语义来源，没有关键误解；但 Q1 里仍把 “WAL payload” 和 “WAL 外层 header” 混在一起，建议在后续学习 MemTable / Snapshot 时再回看一次 payload 与 physical record 的边界。`
- review_block_next：`no`

### Day 005

- 主题：`MemTable / SkipList / Arena`
- 文件：`learning-rocksdb-day005-2026-04-15-memtable-skiplist-arena.md`
- understanding_status：`yellow`
- mastery_score：`3/5`
- weak_points：
  - `MemTable::Get()` 里的 `SaveValue` 路径还没有继续拆到读取判定细节
  - `InlineSkipList` 并发插入里的 splice 复用和校验逻辑还没有展开
  - `ConcurrentArena` 的 per-core shard 分配细节只看到框架，没继续顺着实现看完
- source_anchors：
  - `D:\program\rocksdb\db\memtable.h`
  - `D:\program\rocksdb\db\memtable.cc`
  - `D:\program\rocksdb\memtable\skiplistrep.cc`
  - `D:\program\rocksdb\memtable\inlineskiplist.h`
  - `D:\program\rocksdb\memory\arena.h`
  - `D:\program\rocksdb\memory\arena.cc`
  - `D:\program\rocksdb\memory\concurrent_arena.h`
  - `D:\program\rocksdb\db\dbformat.h`
- ready_for_next：`yes`
- next_review_trigger：`当学习 Flush、Read Path、Snapshot / Sequence Number / 可见性语义时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-04-16`
- review_notes：`第一次复习问答已完成。已经理解 memtable 的主要角色、SkipListRep/InlineSkipList 的职责边界、arena 生命周期适配性，以及为什么读路径必须携带 sequence 语义；但 memtable entry 的精确字节布局仍有一点顺序混淆，需要后续再压实。`
- review_block_next：`no`

### Day 006

- 主题：`MemTable 深入：可见性、删除、范围删除与读语义`
- 文件：`learning-rocksdb-day006-2026-04-18-memtable-visibility-delete-range-tombstone.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `MemTable::MultiGet` 在存在 range tombstone 时为什么基本禁用 memtable bloom 优化，还没单独拆开
  - `MemTable::Update / UpdateCallback` 的 inplace update 边界和锁粒度还只看到第一层
  - `kValueTypeForSeek` 与 internal key 排序规则的精确关系，后续可在 Snapshot / Read Path 再压实
- source_anchors：
  - `D:\program\rocksdb\db\lookup_key.h`
  - `D:\program\rocksdb\db\dbformat.cc`
  - `D:\program\rocksdb\db\dbformat.h`
  - `D:\program\rocksdb\db\memtable.h`
  - `D:\program\rocksdb\db\memtable.cc`
  - `D:\program\rocksdb\db\write_batch.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_builder.cc`
- ready_for_next：`yes`
- next_review_trigger：`当学习 Flush、Read Path、Snapshot / Sequence Number / 可见性语义、事务时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-04-18`
- review_notes：`Day 006 复习问答已完成。整体已经能把 LookupKey、删除/范围删除的读语义、以及 seq_per_batch 在 memtable 层保持等价语义的方式串起来，没有关键误解，可以进入 Day 007；但 kValueTypeForSeek 与 internal key 排序的关系仍建议后续再压实。`
- review_block_next：`no`

### Day 007

- 主题：`Flush`
- 文件：`learning-rocksdb-day007-2026-04-20-flush.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `atomic flush` 跨多个 column family 的提交流程还没单独展开
  - `mempurge / timestamp stripping` 这些 flush 分支目前只知道入口，没有继续深挖
  - `BuildTable(...)` 内部的 SST 物理写入细节刻意留到 `SSTable / BlockBasedTable` 章节再展开
- source_anchors：
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\flush_job.h`
  - `D:\program\rocksdb\db\flush_job.cc`
  - `D:\program\rocksdb\db\memtable_list.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_files.cc`
  - `D:\program\rocksdb\db\column_family.h`
- ready_for_next：`yes`
- next_review_trigger：`当学习 SSTable / BlockBasedTable、MANIFEST / VersionEdit / VersionSet 或 WAL 删除路径时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-04-21`
- review_notes：`Day 007 复习问答已完成。已经理解 flush 的主链、前台/后台职责边界、LogAndApply 才是更完整的完成点，以及 DeleteWalsBefore 只是推进可删边界；但仍需再压实两个点：ScheduleFlushes 包含前台 SwitchMemtable 与 flush request 入队，而不仅是“调度后台线程”；PickMemTable 里决定 flush 输入范围的是 max_memtable_id，max_next_log_number 则用于 SetLogNumber(...) 等元数据推进。`
- review_block_next：`no`

### Day 008

- 主题：`SSTable / BlockBasedTable / 各类 Block`
- 文件：`learning-rocksdb-day008-2026-04-22-sstable-blockbasedtable-and-blocks.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `BlockBasedTableReader` 如何从 footer / metaindex / index 逐层打开文件还没进入
  - `partitioned index / partitioned filter / hash index` 这些高级变体暂时只知道入口
  - `Block Cache / table reader / OS Page Cache` 的交互细节留到后续读路径与磁盘 I/O 章节
  - `BlockHandle`、block trailer 和 footer 各自承载什么信息，边界还容易混淆
- source_anchors：
  - `D:\program\rocksdb\db\builder.h`
  - `D:\program\rocksdb\db\builder.cc`
  - `D:\program\rocksdb\table\table_builder.h`
  - `D:\program\rocksdb\table\format.h`
  - `D:\program\rocksdb\table\format.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_builder.h`
  - `D:\program\rocksdb\table\block_based\block_based_table_builder.cc`
  - `D:\program\rocksdb\table\block_based\block_builder.h`
  - `D:\program\rocksdb\table\block_based\block_builder.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.h`
  - `D:\program\rocksdb\include\rocksdb\table.h`
- ready_for_next：`yes`
- next_review_trigger：`当学习 Read Path / Iterator、Block Cache / Bloom Filter、Disk IO / Table Reader 时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-04-23`
- review_notes：`Day 008 复习问答已完成。Q1/Q2/Q3/Q5 基本正确，主链理解已经过关；但 Q4 里把 block trailer 误写成“记录 block data 大小”。需要纠正：block trailer 是 `1 byte compression type + 4 bytes checksum`，而块大小由 BlockHandle 携带，不包含 trailer。当前没有关键误解，可以进入 Day 009，但建议在读路径里再压实 footer / metaindex / index / BlockHandle 的关系。`
- review_block_next：`no`

### Day 009

- 主题：`Read Path / Get / MultiGet / Iterator`
- 文件：`learning-rocksdb-day009-2026-04-26-read-path-get-multiget-iterator.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `Snapshot / Sequence Number / ReadCallback / DBIter::IsVisible` 的完整可见性链路还没单独展开
  - `Block Cache`、row cache、table cache 与 OS page cache 的边界还没系统拆开
  - `partitioned index / partitioned filter / prefix seek` 这些读优化变体还没单独展开
  - `MergingIterator` 与 `DBIter` 的 reverse、merge operand、range tombstone 深层细节还只是建立骨架
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.h`
  - `D:\program\rocksdb\db\column_family.h`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\job_context.h`
  - `D:\program\rocksdb\db\dbformat.cc`
  - `D:\program\rocksdb\db\lookup_key.h`
  - `D:\program\rocksdb\db\memtable.cc`
  - `D:\program\rocksdb\db\memtable_list.cc`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\table_cache.cc`
  - `D:\program\rocksdb\table\table_reader.h`
  - `D:\program\rocksdb\table\get_context.h`
  - `D:\program\rocksdb\table\get_context.cc`
  - `D:\program\rocksdb\table\multiget_context.h`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.cc`
  - `D:\program\rocksdb\db\arena_wrapped_db_iter.cc`
  - `D:\program\rocksdb\db\db_iter.cc`
  - `D:\program\rocksdb\table\merging_iterator.cc`
- ready_for_next：`yes`
- next_review_trigger：`进入 Snapshot / Sequence Number / 可见性语义时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-04-29T14:03:46+08:00`
- review_notes：`Day 009 复习问答已完成。整体能区分 SuperVersion 的对象生命周期 pin 与 snapshot 的可见性职责，能说明 Get 的 mem/imm/current 顺序、FilePicker 的 L0 与 L1+ 差异、SaveValue 继续查找的 merge/base value 场景、MultiGet 批量处理收益，以及 MergingIterator 与 DBIter 的职责边界。需保留两点细化：L1+ 不重叠是常规 leveled 情况下成立；MergingIterator 输出的是 internal key 流，DBIter 再做用户可见语义。`
- review_block_next：`no`

### Day 010

- 主题：`Snapshot / Sequence Number / 可见性语义`
- 文件：`learning-rocksdb-day010-2026-04-30-snapshot-sequence-number-visibility.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `ReadCallback` 在 write-prepared / write-unprepared 事务中的完整提交可见性还没展开
  - `CompactionIterator` 如何按 snapshot 边界丢弃旧版本还只是建立入口
  - `timestamped snapshot / user-defined timestamp` 与普通 sequence snapshot 的组合语义暂时只点到入口
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\include\rocksdb\snapshot.h`
  - `D:\program\rocksdb\db\snapshot_impl.h`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.h`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\write_batch.cc`
  - `D:\program\rocksdb\db\write_batch_internal.h`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\dbformat.h`
  - `D:\program\rocksdb\db\dbformat.cc`
  - `D:\program\rocksdb\db\lookup_key.h`
  - `D:\program\rocksdb\table\get_context.h`
  - `D:\program\rocksdb\table\get_context.cc`
  - `D:\program\rocksdb\db\db_iter.h`
  - `D:\program\rocksdb\db\db_iter.cc`
  - `D:\program\rocksdb\db\read_callback.h`
  - `D:\program\rocksdb\utilities\transactions\write_prepared_txn_db.h`
  - `D:\program\rocksdb\utilities\transactions\write_unprepared_txn.h`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\compaction\compaction_iterator.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习事务、Compaction 或 VersionSet/obsolete file 删除路径时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-04-30T16:56:18+08:00`
- review_notes：`Day 010 复习问答已完成。整体能说明 sequence 写入 internal key、snapshot 是 sequence 可见性上界、InternalKeyComparator 按新到旧排序、GetImpl 先 pin SuperVersion 再取 implicit snapshot sequence 的原因、ReadCallback 的事务扩展语义，以及长 snapshot 对 compaction/空间放大的影响。后续可再压实两点：WriteBatchInternal::InsertInto -> MemTableInserter -> mem->Add(...) 的精确链路；GetContext::SaveValue 是点查状态机，DBIter::IsVisible 是 iterator internal key 流过滤入口。`
- review_block_next：`no`

### Day 011

- 主题：`磁盘 I/O / TableReader / Block 读取 / OS Page Cache`
- 文件：`learning-rocksdb-day011-2026-05-01-disk-io-table-reader-block-read.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `TableReader / BlockBasedTable / RandomAccessFileReader / FSRandomAccessFile` 的对象边界还需要继续压实
  - `FilePrefetchBuffer / readahead / async_io / direct I/O / mmap` 的组合取舍还需要后续压实
  - `partitioned index / partitioned filter` 如何改变 index/filter block 读取路径还没有进入
  - `BlockCache` 对 data/index/filter block 的覆盖范围与 charge 细节还没展开
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\env.h`
  - `D:\program\rocksdb\include\rocksdb\file_system.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\file\random_access_file_reader.h`
  - `D:\program\rocksdb\file\random_access_file_reader.cc`
  - `D:\program\rocksdb\file\file_prefetch_buffer.h`
  - `D:\program\rocksdb\file\file_prefetch_buffer.cc`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\table_cache.h`
  - `D:\program\rocksdb\db\table_cache.cc`
  - `D:\program\rocksdb\table\table_reader.h`
  - `D:\program\rocksdb\table\format.h`
  - `D:\program\rocksdb\table\format.cc`
  - `D:\program\rocksdb\table\block_fetcher.h`
  - `D:\program\rocksdb\table\block_fetcher.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.h`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习 Block Cache / Bloom Filter / Prefix Bloom / Partition Index 时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-03T13:27:15+08:00`
- review_notes：`Day 011 复习问答已完成。整体主链正确：能说明 Version::Get -> TableCache -> BlockBasedTable 的骨架，以及 kBlockCacheTier 不能推出 key 不存在。但仍有三处边界需要纠偏：TableReader/BlockBasedTable 不是文件句柄，也不负责写；FilePrefetchBuffer 不是只缓存 footer/tail，而是通用文件 offset 预读缓冲；allow_mmap_reads 改变的是 SST table file 的读取方式之一，不只是 SST 尾部读取。当前判定 partial，可继续进入 Day 012。`
- review_block_next：`no`

### Day 012

- 主题：`MANIFEST / VersionEdit / VersionSet`
- 文件：`learning-rocksdb-day012-2026-05-03-manifest-versionedit-versionset.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `VersionEditHandlerPointInTime / best-efforts recovery` 还没单独展开
  - `manifest_writers_ / atomic group / multi-CF group commit` 只走通了主链
  - `LogAndApply` 安装 `current Version` 与 `SuperVersion` 发布读视图的边界需要在 Compaction 中回看
  - `CURRENT 切换失败 / MANIFEST rollover / obsolete manifest cleanup` 已补过主结论，但 DB open/recovery 里的异常细节还需压实
- source_anchors：
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\version_edit.h`
  - `D:\program\rocksdb\db\version_edit.cc`
  - `D:\program\rocksdb\db\version_builder.h`
  - `D:\program\rocksdb\db\version_builder.cc`
  - `D:\program\rocksdb\db\version_edit_handler.h`
  - `D:\program\rocksdb\db\version_edit_handler.cc`
  - `D:\program\rocksdb\db\manifest_ops.cc`
  - `D:\program\rocksdb\file\filename.cc`
  - `D:\program\rocksdb\include\rocksdb\file_system.h`
  - `D:\program\rocksdb\env\fs_posix.cc`
  - `D:\program\rocksdb\port\win\env_win.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习 Compaction、Column Family 或 DB 打开/恢复路径时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-04T17:20:52+08:00`
- review_notes：`Day 012 复习问答已完成。整体能说明 CURRENT 指向 active MANIFEST、VersionEdit 是增量记录、Recover 不为每条 record 创建完整 Version，以及 VersionBuilder 用来累积应用 edits。需要纠偏两点：MANIFEST rollover 的“完整状态”仍是通过 VersionEdit 编码，不是直接 dump VersionSet；LogAndApply 只安装 current Version 和更新版本元数据，不负责发布 SuperVersion，SuperVersion 由更外层 ColumnFamilyData/DBImpl 路径安装，用于 pin mem/imm/current Version 的读视图。当前判定 partial，可继续进入 Day 013，但后续学习 Compaction 时要回看 LogAndApply 与 SuperVersion 发布边界。`
- review_block_next：`no`

## 状态使用建议

- `green`
  - 通常是 `4/5` 或 `5/5`
  - 没有关键误解
  - 可以进入下一章
- `yellow`
  - 通常是 `3/5`
  - 或 `4/5` 但仍有一个关键链路没完全闭环
  - 可以推进，但应标记为 `revisit`
- `red`
  - 通常是 `0/5` 到 `2/5`
  - 或存在明显关键误解
  - 先不要推进，先补充学习或问答

复习问答闸门说明：

- `review_status / review_result / review_block_next` 用来决定“现在能不能继续”
- `understanding_status / mastery_score / weak_points` 用来记录“这一章学得怎么样”
- 最近一天 `review_status` 为空时，默认视为未答题，并阻断下一次继续学习

## 当前薄弱点与回看提示

- 当前薄弱点：
  - `VersionSet` 与 `DBImpl / ColumnFamilyData / SuperVersion / Cache` 的整体架构边界还需要后续章节反复压实
  - `LogAndApply` 安装 `current Version` 与 `SuperVersion` 发布读视图的职责边界需要在 Compaction 中回看
  - MANIFEST sync 对频繁 flush/compaction、写停顿和小 SST 放大的影响需要在 Compaction/Write Stall 章节回看
  - MANIFEST rollover、`CURRENT` rename 失败、非本地 FS 返回不确定状态、obsolete MANIFEST purge 的主结论已补充；DB open/recovery 里的异常恢复细节还需要回看
  - `CURRENT / MANIFEST / SST / WAL / OPTIONS / Blob` 在持久化状态中的职责边界还需要在 DB open 和 recovery 章节回看
  - SST 内部 index/filter/properties、blob 文件内部元数据、compaction progress 等非 MANIFEST 元数据还没有单独展开
  - `VersionEditHandlerPointInTime / best-efforts recovery` 的恢复分支
  - `manifest_writers_ / atomic group / multi-CF group commit` 的并发与批量提交流程
  - `CURRENT 切换失败 / MANIFEST rollover / obsolete manifest cleanup` 的异常恢复细节
  - `Block Cache` 内部 key、charge、压缩/非压缩 block 与淘汰策略
  - `FilePrefetchBuffer / readahead / direct I/O / mmap` 的性能取舍
  - `partitioned index / partitioned filter / prefix seek` 的实际读写差异
  - `atomic flush` 与普通 flush 的提交流程差异
  - `range tombstone / MultiGet / memtable bloom` 的组合边界
  - `ReadCallback` 在事务 DB 中的完整提交可见性
  - `CompactionIterator` 按 snapshot 边界清理旧版本的细节
  - flush 推进 `min_log_number_to_keep` 之后，obsolete WAL 的实际删除/归档路径
- 回看触发条件：
  - `学习事务与并发控制`
  - `学习 Compaction`
  - `学习 Column Family`
  - `学习 DB 打开/恢复路径`
  - `学习 Block Cache / Bloom Filter / Prefix Seek`
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
- `复习题` 是每日文章中的强制项。
- 每次完成当天文章后，应主动发起最近一天的复习问答。

## 最近更新时间

- 2026-05-04T19:32:50+08:00
