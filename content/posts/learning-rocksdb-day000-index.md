---
title: RocksDB 学习索引
date: 2026-04-01T19:11:02+08:00
lastmod: 2026-05-26T14:52:25+08:00
tags: [RocksDB, Database, Storage]
categories: [数据库]
series:
- "RocksDB 学习笔记"
series_order: -1
slug: learning-rocksdb-index
featureimage: "images/covers/rocksdb/day000-index-vpo8k8.webp"
summary: RocksDB 长期学习索引与轻量状态文件，用于恢复学习进度、导航每日文章，并记录掌握度与最近一天复习问答闸门状态。
---

## 当前状态

- 当前学习总天数：`21`
- 当前最近一次学习主题：`Day 021：SST File Ingestion`
- 当前主线阶段：`高级特性：从 SstFileWriter、DBImpl::IngestExternalFiles、ExternalSstFileIngestionJob、VersionEdit 与 MANIFEST，理解外部 SST 如何以文件级写入方式接入当前 LSM`
- 上一篇文章写到：
  - SST File Ingestion 绕过的是逐条 `Put -> WAL -> memtable -> flush` 写入成本，但不能绕过 `VersionEdit / MANIFEST / SuperVersion`
  - `SstFileWriter` 生成外部 SST 时要求 point key 按 comparator 严格递增，内部 sequence number 默认为 `0`
  - `DBImpl::IngestExternalFile()` 只是单 CF 包装，真正主入口是 `DBImpl::IngestExternalFiles()`
  - `ExternalSstFileIngestionJob::Prepare()` 负责读取 table properties、校验 CF/key/seqno/checksum，并把文件 copy 或 link 到 DB 目录
  - 如果导入文件 key range 和 memtable 重叠，`NeedsFlush()` 会要求先 flush，除非 `allow_blocking_flush=false` 直接失败
  - `Run()` 负责分配 level 和 global seqno，并通过 `VersionEdit::AddFile()` 准备 MANIFEST edit
  - 默认目标是把外部 SST 放入能容纳其 key range 的最低层；有 overlap、FIFO 或批次新旧顺序要求时可能进入 L0
  - global seqno 是文件级覆盖语义，让 seqno=0 的外部 SST 在读路径中表现为较新的版本；当前默认不把它写回 SST 文件本体
  - 真正提交点是 `VersionSet::LogAndApply()` 写 MANIFEST，随后 `InstallSuperVersionAndScheduleWork()` 发布新读视图
  - Day 021 文章已完成，复习题尚未回答；下一次继续新章节前必须先完成 Day 021 复习问答
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
  - `Day 013：Compaction 基础机制与主流程`
  - `Day 014：Compaction 策略与 Write Stall`
  - `Day 015：CompactionIterator Revisit`
  - `Day 016：Block Cache / Bloom Filter / Prefix Bloom / Partitioned Index`
  - `Day 017：Column Family`
  - `Day 018：BlobDB / KV 分离`
  - `Day 019：事务与并发控制`
  - `Day 020：参数调优 / Rate Limiter / Write Stall`
  - `Day 021：SST File Ingestion`
- 下一步建议：
  - `先完成 Day 021 复习题；通过后进入 Day 022：Merge Operator / Compaction Filter`
- 当前仍需补看的关键点：
  - `SST File Ingestion` 主链已建立；后续需要通过复习题确认 `Prepare / NeedsFlush / Run / LogAndApply` 的职责边界
  - `global seqno` 的文件级覆盖语义已建立；后续还可结合 `TableReader` 和 snapshot 边界继续压实
  - `ingest_behind / allow_db_generated_files / multi-CF atomic group` 已建立入口，但具体异常分支、tombstone 保留和文件迁移场景还可后续专题展开
  - `参数调优 / Rate Limiter / Write Stall` 主链已建立；后续需要结合真实 `rocksdb.stats`、stall micros、L0 文件数、pending compaction bytes、compaction read/write bytes 做一次 benchmark 型实战调参
  - `BlobDB / KV 分离` 主链已建立；后续可结合测试继续压实 forced blob GC picker、backup/checkpoint 与 blob file live set、secondary/remote storage 下的 blob scan 性能边界
  - `事务与并发控制` 主线已建立；后续还要回看 `SnapshotChecker` 不是冲突检测器、`unprep_seqs_` 先于 `IsInSnapshot()` 的自写可见性语义，以及三种 write policy 的复杂度位置
  - `Column Family` 主链已建立；`atomic_flush` 的主要语义已补上，MANIFEST atomic group 的恢复细节后续可结合 `VersionEditHandler` 再看
  - 跨 CF `WriteBatch` 的 WAL 原子写主链已建立；与事务 DB 中 snapshot、锁、WritePrepared / WriteUnprepared 可见性的衔接已在 Day 019 建立入口
  - 多 CF 下 block cache、write buffer manager、write stall 的资源竞争已在 Day 020 建立入口；后续还需要用真实指标验证每个 CF 的预算分配
  - `Block Cache / Bloom Filter / Prefix Bloom / Partitioned Index` 的读优化主线已建立；后续还可细看 `HyperClockCache / SecondaryCache / shard / priority` 的内部淘汰机制
  - `auto_prefix_mode / prefix_same_as_start / iterate_upper_bound` 与 prefix bloom 的安全使用边界还没细拆
  - partitioned index/filter 的 pin/cache dependency、`metadata_block_size` 与实际调参经验还没展开
  - `LevelCompactionBuilder` 的 clean cut、grandparent overlap、base level 动态计算还可以后续结合更细源码再压实
  - `Universal` 的 `max_read_amp` 自动调节、incremental universal compaction、delete-triggered compaction 细节还没完全展开
  - `Write Stall` 与 `WriteThread` group、pipelined write、two write queues 的组合边界还没细拆
  - `CompactionIterator` 已补上主链；`SnapshotChecker / write-prepared / write-unprepared` 对清理边界的影响已在 Day 019 建立入口，后续还需结合复习题和异常分支压实
  - ordinary delete tombstone 的清理条件还需要与 rule (A) 的 hidden old version 规则区分开
  - `user-defined timestamp / full_history_ts_low / trim_ts` 与 compaction 历史 GC 的组合语义还没完全展开
  - `VersionEditHandlerPointInTime / best-efforts recovery` 如何在 MANIFEST 缺损时找回一个仍然有效的旧版本，还没单独展开
  - `manifest_writers_ / atomic group / multi-CF group commit` 只走通了主链，还没细拆并发与原子组细节
  - `CURRENT 切换失败 / MANIFEST rollover / obsolete manifest cleanup` 已补过主结论，但 DB open/recovery 里的异常细节还需要后续压实

## 最近一天复习问答闸门

- latest_review_day：`Day 021`
- latest_review_file：`learning-rocksdb-day021-2026-05-26-sst-file-ingestion.md`
- review_status：
- review_result：
- review_answered_at：
- review_notes：`Day 021 文章已完成，复习题尚未回答。下一次继续新章节前，应先完成 SST File Ingestion 复习问答。`
- review_block_next：`yes`

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
15. `BlobDB / KV 分离`
16. 事务与并发控制
17. 参数调优 / `Rate Limiter` / `Write Stall`
18. 高级特性与专题深挖

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
| 013 | 2026-05-04 | Compaction 基础机制与主流程 | `learning-rocksdb-day013-2026-05-04-compaction-basics-and-flow.md` | `done` |
| 014 | 2026-05-09 | Compaction 策略与 Write Stall | `learning-rocksdb-day014-2026-05-09-compaction-styles-and-write-stall.md` | `revisit` |
| 015 | 2026-05-13 | CompactionIterator Revisit | `learning-rocksdb-day015-2026-05-13-compaction-iterator-revisit.md` | `revisit` |
| 016 | 2026-05-15 | Block Cache / Bloom Filter / Prefix Bloom / Partitioned Index | `learning-rocksdb-day016-2026-05-15-block-cache-bloom-filter-partitioned-index.md` | `done` |
| 017 | 2026-05-19 | Column Family | `learning-rocksdb-day017-2026-05-19-column-family.md` | `done` |
| 018 | 2026-05-21 | BlobDB / KV 分离 | `learning-rocksdb-day018-2026-05-21-blobdb-kv-separation.md` | `revisit` |
| 019 | 2026-05-23 | 事务与并发控制 | `learning-rocksdb-day019-2026-05-23-transactions-and-concurrency-control.md` | `revisit` |
| 020 | 2026-05-24 | 参数调优 / Rate Limiter / Write Stall | `learning-rocksdb-day020-2026-05-24-tuning-rate-limiter-write-stall.md` | `revisit` |
| 021 | 2026-05-26 | SST File Ingestion | `learning-rocksdb-day021-2026-05-26-sst-file-ingestion.md` | `next` |

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
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_experimental.cc`
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
- mastery_score：`4/5`
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
  - `MergingIterator` 与 `DBIter` 的 reverse、merge operand、range tombstone 深层细节已经补上主链，但还可以继续和 snapshot / transaction / prefix seek 交叉压实
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

### Day 013

- 主题：`Compaction 基础机制与主流程`
- 文件：`learning-rocksdb-day013-2026-05-04-compaction-basics-and-flow.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `Leveled Compaction` 的 clean cut、grandparent overlap 仍可在后续细拆
  - `CompactionIterator` 主链已在 Day 015 补上；事务和 timestamp 扩展语义仍留给后续专题
  - `CompactionJob` 到 `VersionEdit / LogAndApply` 的主链已闭环，异常恢复细节仍归入 MANIFEST revisit
- source_anchors：
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\column_family.h`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\compaction\compaction.h`
  - `D:\program\rocksdb\db\compaction\compaction.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker.h`
  - `D:\program\rocksdb\db\compaction\compaction_picker.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker_level.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker_universal.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker_fifo.cc`
  - `D:\program\rocksdb\db\compaction\compaction_job.h`
  - `D:\program\rocksdb\db\compaction\compaction_job.cc`
  - `D:\program\rocksdb\db\compaction\compaction_state.h`
  - `D:\program\rocksdb\db\compaction\compaction_state.cc`
  - `D:\program\rocksdb\db\compaction\clipping_iterator.h`
  - `D:\program\rocksdb\db\compaction\subcompaction_state.cc`
  - `D:\program\rocksdb\db\compaction\subcompaction_state.h`
  - `D:\program\rocksdb\db\compaction\compaction_outputs.cc`
  - `D:\program\rocksdb\include\rocksdb\advanced_options.h`
- ready_for_next：`yes`
- next_review_trigger：`学习 Leveled Compaction clean cut、事务可见性或 MANIFEST 异常恢复时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-05-09T21:05:57+08:00`
- review_notes：`Day 013 复习问答已完成。整体能说明 compaction 用额外写入换取读放大和空间放大的控制，能区分 L0 score 和 L1+ score 的来源，也能把 Run 写 SST 与 LogAndApply 安装 Version 的边界讲清楚。需校正两点表述：compaction 是在读放大、空间放大、写放大之间做权衡，写放大不是被消除而是被控制在可接受范围；Compaction 更准确是计划对象，CompactionJob 才是执行器。当前无关键误解，可以进入 Day 014。`
- review_block_next：`no`

### Day 014

- 主题：`Compaction 策略与 Write Stall`
- 文件：`learning-rocksdb-day014-2026-05-09-compaction-styles-and-write-stall.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `LevelCompactionBuilder` 的 clean cut、grandparent overlap 还可以继续压实
  - `Write Stall` 与 `WriteThread`、two write queues、pipelined write、事务写入优先级的组合边界还没细拆
  - `Universal` 的 `max_read_amp` 自动调节、incremental universal compaction、delete-triggered compaction 细节还没完全展开
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\advanced_options.h`
  - `D:\program\rocksdb\include\rocksdb\universal_compaction.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\version_set.h`
  - `D:\program\rocksdb\db\compaction\compaction_picker_level.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker_universal.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker_fifo.cc`
  - `D:\program\rocksdb\db\compaction\compaction_picker.cc`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\write_controller.h`
  - `D:\program\rocksdb\db\write_controller.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\include\rocksdb\write_buffer_manager.h`
  - `D:\program\rocksdb\include\rocksdb\rate_limiter.h`
  - `D:\program\rocksdb\file\writable_file_writer.cc`
  - `D:\program\rocksdb\file\random_access_file_reader.cc`
  - `D:\program\rocksdb\db\compaction\compaction_job.cc`
  - `D:\program\rocksdb\db\flush_job.cc`
  - `D:\program\rocksdb\include\rocksdb\env.h`
  - `D:\program\rocksdb\env\env_posix.cc`
  - `D:\program\rocksdb\util\threadpool_imp.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\periodic_task_scheduler.h`
  - `D:\program\rocksdb\db\periodic_task_scheduler.cc`
  - `D:\program\rocksdb\util\timer.h`
  - `D:\program\rocksdb\db\error_handler.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_follower.cc`
  - `D:\program\rocksdb\file\delete_scheduler.cc`
  - `D:\program\rocksdb\file\sst_file_manager_impl.cc`
- ready_for_next：`yes`
- next_review_trigger：`后续学习 clean cut、Universal 细节、WriteThread 或事务写入优先级时回看`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-05-13T16:25:25+08:00`
- review_notes：`Day 014 复习问答已完成。整体能把 Level / Universal / FIFO 的读写空间放大取舍、Universal 与 tiered compaction 的关系、L0 score 与 L1+ score 的差异、trivial move 与 intra-L0 的目标、RateLimiter 与 write stall 的职责边界讲清楚。需校正一个表述：memtable、L0 文件数、pending compaction bytes 三类 CF 级触发源都可能先 delayed 再 stopped，分别由 soft/slowdown 与 hard/stop 阈值控制，不是简单分成某类只 delay 或只 stop。另需记住 compaction pressure token 是进入 compaction 追赶/低优先级写限流状态，不是直接执行某个 compaction job。当前无阻断，可以进入 Day 015。`
- review_block_next：`no`

### Day 015

- 主题：`CompactionIterator Revisit`
- 文件：`learning-rocksdb-day015-2026-05-13-compaction-iterator-revisit.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `SnapshotChecker / write-prepared / write-unprepared` 如何影响 `DefinitelyInSnapshot` 和清理边界还没在事务语境下细拆
  - `user-defined timestamp / full_history_ts_low / trim_ts` 与 compaction 历史 GC 的组合语义只建立了入口
  - ordinary delete tombstone 的可丢弃条件还需要与 rule (A) 的同 stripe 遮蔽规则区分开
- source_anchors：
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\job_context.h`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\table_cache.cc`
  - `D:\program\rocksdb\db\dbformat.h`
  - `D:\program\rocksdb\db\dbformat.cc`
  - `D:\program\rocksdb\db\compaction\compaction_job.cc`
  - `D:\program\rocksdb\db\compaction\compaction_iterator.h`
  - `D:\program\rocksdb\db\compaction\compaction_iterator.cc`
  - `D:\program\rocksdb\db\compaction\compaction_outputs.cc`
  - `D:\program\rocksdb\db\range_del_aggregator.h`
  - `D:\program\rocksdb\db\range_del_aggregator.cc`
  - `D:\program\rocksdb\db\merge_helper.h`
  - `D:\program\rocksdb\db\merge_helper.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习事务 SnapshotChecker、DeleteRange 或 user-defined timestamp 历史 GC 时回看`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-15T16:41:06+08:00`
- review_notes：`Day 015 复习问答已完成。前两题、MergeHelper、range tombstone 和六个例子的回答基本正确；第 3 题把普通 delete tombstone 的清理条件误写成“更大 sequence 同 user key 且同 snapshot stripe”，需要改成：delete tombstone 能否丢，取决于它是否仍要遮蔽可能复活的旧 value，并结合 seq <= earliest_snapshot_、KeyNotExistsBeyondOutputLevel(...)、bottommost/input 旧版本清理、ingest_behind 与事务边界判断。`
- review_block_next：`no`

### Day 016

- 主题：`Block Cache / Bloom Filter / Prefix Bloom / Partitioned Index`
- 文件：`learning-rocksdb-day016-2026-05-15-block-cache-bloom-filter-partitioned-index.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `HyperClockCache / SecondaryCache / shard / priority` 的内部淘汰与多级缓存细节还没展开
  - `auto_prefix_mode / prefix_same_as_start / iterate_upper_bound` 与 prefix bloom 的安全使用边界还需要结合 iterator 再细看
  - partitioned index/filter 的 pin/cache dependency、`metadata_block_size` 与真实调参经验还需要后续补充
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\table.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\include\rocksdb\filter_policy.h`
  - `D:\program\rocksdb\include\rocksdb\cache.h`
  - `D:\program\rocksdb\table\block_based\block_cache.h`
  - `D:\program\rocksdb\table\block_based\block_cache.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.h`
  - `D:\program\rocksdb\table\block_based\block_based_table_builder.cc`
  - `D:\program\rocksdb\table\block_based\filter_block.h`
  - `D:\program\rocksdb\table\block_based\filter_block_reader_common.cc`
  - `D:\program\rocksdb\table\block_based\full_filter_block.cc`
  - `D:\program\rocksdb\table\block_based\partitioned_filter_block.cc`
  - `D:\program\rocksdb\table\block_based\partitioned_index_reader.cc`
  - `D:\program\rocksdb\table\block_based\filter_policy.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_factory.cc`
  - `D:\program\rocksdb\docs\_posts\2017-05-12-partitioned-index-filter.markdown`
- ready_for_next：`yes`
- next_review_trigger：`学习 Column Family 后，回看 block cache/table options 在多 CF 下的共享与隔离边界；学习缓存调优时回看 HyperClockCache、SecondaryCache 与 partitioned metadata。`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-05-19T14:32:01+08:00`
- review_notes：`Day 016 复习问答已完成。读路径优化主链、Bloom false/true 语义、block cache key、whole-key/prefix filter、prefix 连续性、metadata cache 取舍和 partitioned metadata 的缓存粒度目标均已回答正确；partition_filters 与 kTwoLevelIndexSearch 的关系已修正为当前实现/历史耦合，不是语义必然。`
- review_block_next：`no`

### Day 017

- 主题：`Column Family`
- 文件：`learning-rocksdb-day017-2026-05-19-column-family.md`
- understanding_status：`green`
- mastery_score：`4/5`
- weak_points：
  - `atomic_flush` 的主要语义已补上：它把多个 CF 的 flush 输出作为 atomic group 提交到 MANIFEST，主要用于无 WAL 保护写入；MANIFEST atomic group 恢复细节后续可看
  - 跨 CF `WriteBatch` 的 WAL 原子写主链已建立；与事务 DB 中 snapshot、锁、WritePrepared / WriteUnprepared 可见性的衔接已在 Day 019 建立入口，仍需复习题确认
  - 多 CF 下 block cache、write buffer manager、write stall 的资源竞争已在 Day 020 建立入口；后续还需要结合真实指标验证各 CF 预算
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\db\column_family.h`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\write_batch.cc`
  - `D:\program\rocksdb\db\memtable_list.cc`
  - `D:\program\rocksdb\db\version_edit.h`
  - `D:\program\rocksdb\db\version_edit.cc`
  - `D:\program\rocksdb\db\version_set.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习事务与并发控制时，回看跨 CF WriteBatch 的原子写入与事务可见性边界`
- review_status：`answered`
- review_result：`pass`
- review_answered_at：`2026-05-21T12:55:13+08:00`
- review_notes：`Day 017 复习问答已完成。整体能区分 handle / cfd / cfs 的职责，能说明 CF 的逻辑隔离和 DB 级共享资源，能讲清 Get 和 WriteBatch 的 CF 路由，能回答 DropColumnFamily 延迟清理和 write_buffer_size per CF。补充点：Get 进入 SST 依赖 SuperVersion::current Version；CF 级 write stall 触发源最终会影响 DB 级写路径。`
- review_block_next：`no`

### Day 018

- 主题：`BlobDB / KV 分离`
- 文件：`learning-rocksdb-day018-2026-05-21-blobdb-kv-separation.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - integrated BlobDB 主链已经建立：普通 `Put()` 前台写 WAL/memtable，flush / compaction 用 `BlobFileBuilder` 抽离大 value，SST 中保存 `kTypeBlobIndex`
  - 读路径主链已经建立：`Version::Get` / `MultiGet` / `DBIter` 遇到 blob index 后，通过 `BlobFetcher -> Version::GetBlob -> BlobSource -> BlobFileReader` 取回真实 value
  - Blob GC 主链已经建立：compaction 中通过 `GarbageCollectBlobIfNeeded()` 搬迁旧 blob，`BlobGarbageMeter` 统计 inflow/outflow，并用 `BlobFileGarbage` 持久化垃圾统计
  - 仍需后续压实 forced blob GC 与 compaction picker 的联动细节、backup/checkpoint/secondary instance 对 blob live set 的边界，以及远端存储或大 scan 场景下的真实性能参数
- source_anchors：
  - `D:\program\rocksdb\docs\_posts\2021-05-26-integrated-blob-db.markdown`
  - `D:\program\rocksdb\include\rocksdb\advanced_options.h`
  - `D:\program\rocksdb\options\cf_options.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\builder.cc`
  - `D:\program\rocksdb\db\flush_job.cc`
  - `D:\program\rocksdb\db\compaction\compaction_job.cc`
  - `D:\program\rocksdb\db\compaction\compaction_iterator.cc`
  - `D:\program\rocksdb\db\compaction\compaction_outputs.cc`
  - `D:\program\rocksdb\db\blob\blob_file_builder.cc`
  - `D:\program\rocksdb\db\blob\blob_index.h`
  - `D:\program\rocksdb\db\blob\blob_log_format.h`
  - `D:\program\rocksdb\db\blob\blob_source.cc`
  - `D:\program\rocksdb\db\blob\blob_file_reader.cc`
  - `D:\program\rocksdb\db\blob\blob_file_cache.cc`
  - `D:\program\rocksdb\db\blob\blob_garbage_meter.cc`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\version_edit.h`
  - `D:\program\rocksdb\db\version_builder.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_files.cc`
  - `D:\program\rocksdb\table\get_context.cc`
  - `D:\program\rocksdb\db\db_iter.cc`
  - `D:\program\rocksdb\db\merge_helper.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习事务与并发控制时，回看 BlobDB 与 snapshot/transaction 可见性、compaction 清理边界的关系；学习缓存调优时回看 blob cache key 组成`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-23T21:06:23+08:00`
- review_notes：`Day 018 复习问答已完成。主线已经过关：能说明 integrated BlobDB 的 flush/compaction 抽离、BlobIndex、blob file 格式、WAL/MANIFEST 职责、GC 借 compaction、旧 blob file 保留原因、scan 代价和 lazy value 优化。需纠偏：BlobFileGarbage 记录新增垃圾而不是减少量；point Get 主链不要把 BlobFetcher 放在最前；blob cache key 实际是 db_id + db_session_id + file_number + offset，file_size 当前未参与；SetOptions 安装的是新的 SuperVersion，不是新的 LSM Version；cutoff 选 oldest prefix 而不是末尾；linked_ssts 是 oldest_blob_file_number 的反向文件级索引；garbage 统计要同时看 inflow/outflow。当前无阻断，可以进入 Day 019。`
- review_block_next：`no`

### Day 019

- 主题：`事务与并发控制`
- 文件：`learning-rocksdb-day019-2026-05-23-transactions-and-concurrency-control.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `TransactionDB` / `OptimisticTransactionDB` 的包装边界已经建立，但还需要通过复习题把 `PrepareWrap()`、`WrapDB()`、`TryLock()`、`CommitWithParallelValidate()` 的调用顺序再压实
  - `WritePrepared` / `WriteUnprepared` 的恢复语义、可见性和 `SnapshotChecker` 的 compaction / flush 影响已经看过正文，还要靠复习题把链路闭环
  - 已补充事务隔离边界：所有相关读写 key/range 被追踪时可形成冲突可串行化；普通 `Get()` 不自动参与冲突检测，`GetForUpdate()` 同时服务悲观和乐观事务
  - 复习纠偏点：`SnapshotChecker` 不是冲突检测器；`unprep_seqs_` 要先于 `IsInSnapshot()` 保证自写可见；三种 write policy 的本质是复杂度位置取舍
  - 悲观 / 乐观事务、锁管理器、冲突检测和恢复元数据是同一主题的不同层面，后续还要结合源码把状态变化和异常分支再细看
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\utilities\transaction_db.h`
  - `D:\program\rocksdb\include\rocksdb\utilities\optimistic_transaction_db.h`
  - `D:\program\rocksdb\utilities\transactions\pessimistic_transaction_db.h`
  - `D:\program\rocksdb\utilities\transactions\pessimistic_transaction_db.cc`
  - `D:\program\rocksdb\utilities\transactions\optimistic_transaction_db_impl.h`
  - `D:\program\rocksdb\utilities\transactions\optimistic_transaction_db_impl.cc`
  - `D:\program\rocksdb\utilities\transactions\transaction_base.h`
  - `D:\program\rocksdb\utilities\transactions\transaction_base.cc`
  - `D:\program\rocksdb\utilities\transactions\pessimistic_transaction.h`
  - `D:\program\rocksdb\utilities\transactions\pessimistic_transaction.cc`
  - `D:\program\rocksdb\utilities\transactions\optimistic_transaction.h`
  - `D:\program\rocksdb\utilities\transactions\optimistic_transaction.cc`
  - `D:\program\rocksdb\utilities\transactions\transaction_util.h`
  - `D:\program\rocksdb\utilities\transactions\transaction_util.cc`
  - `D:\program\rocksdb\utilities\transactions\write_prepared_txn_db.h`
  - `D:\program\rocksdb\utilities\transactions\write_prepared_txn_db.cc`
  - `D:\program\rocksdb\utilities\transactions\write_unprepared_txn_db.h`
  - `D:\program\rocksdb\utilities\transactions\write_unprepared_txn_db.cc`
  - `D:\program\rocksdb\db\snapshot_checker.h`
  - `D:\program\rocksdb\utilities\transactions\snapshot_checker.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\db\compaction\compaction_iterator.cc`
- ready_for_next：`yes`
- next_review_trigger：`学习参数调优 / Rate Limiter / Write Stall 时，回看事务写入策略对 commit latency、memtable 写入和 write stall 的影响`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-24T11:26:38+08:00`
- review_notes：`Day 019 复习问答已完成。主线可以通过：PrepareWrap / WrapDB、TryLock 顺序、OCC bucket 排序加锁、memtable history 不足导致 TryAgain 都已答对。需纠偏：SnapshotChecker 不是冲突检测器，而是事务 snapshot visibility 桥；WriteUnpreparedTxnReadCallback 必须先查 unprep_seqs_ 以保证自写可见；三种 write policy 的差异是复杂度位置不同，而不是简单分散到不同 DB 类。当前无阻断，可以进入 Day 020。`
- review_block_next：`no`

### Day 020

- 主题：`参数调优 / Rate Limiter / Write Stall`
- 文件：`learning-rocksdb-day020-2026-05-24-tuning-rate-limiter-write-stall.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `Options / AdvancedColumnFamilyOptions / MutableCFOptions` 到运行期状态的主链已建立；后续需要结合真实 `rocksdb.stats` 把参数变化和指标变化闭环
  - `write_buffer_size / max_write_buffer_number / WriteBufferManager` 的内存层次已区分；多 CF 下还需要用真实 workload 验证预算分配
  - `target_file_size_base` 和 `max_bytes_for_level_base` 的边界已讲清；已纠偏 dynamic level bytes 的 base level 选择目标，后续还可结合具体 VersionStorageInfo 看真实层级映射
  - `RateLimiter` 与 `WriteController` 的职责边界已建立；后续可用 benchmark 验证限流过低如何把后台 compaction debt 转成前台 stall
  - 读延迟调参边界已补充：读侧通常没有 write stall 式硬阈值，但 L0、cache、Bloom、I/O 竞争和 compaction style 仍会影响读尾延迟
  - 常见调优参数默认值已整理为速查表，并补充了默认值面向的通用 SSD / 普通 workload 画像；后续实战时要用真实 benchmark 验证压力边界
  - 参数调优方法已整理为“观测 -> 找触发源 -> 增加还债能力或减少债务生成 -> 再调保护阈值”，但还没有真实压测数据支撑
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\include\rocksdb\advanced_options.h`
  - `D:\program\rocksdb\options\cf_options.h`
  - `D:\program\rocksdb\options\cf_options.cc`
  - `D:\program\rocksdb\db\version_set.cc`
  - `D:\program\rocksdb\db\column_family.cc`
  - `D:\program\rocksdb\db\write_controller.h`
  - `D:\program\rocksdb\db\write_controller.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_write.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_open.cc`
  - `D:\program\rocksdb\db\db_impl\db_impl_compaction_flush.cc`
  - `D:\program\rocksdb\include\rocksdb\rate_limiter.h`
  - `D:\program\rocksdb\util\rate_limiter.cc`
  - `D:\program\rocksdb\file\writable_file_writer.cc`
  - `D:\program\rocksdb\db\flush_job.cc`
  - `D:\program\rocksdb\db\compaction\compaction_job.cc`
  - `D:\program\rocksdb\include\rocksdb\write_buffer_manager.h`
- ready_for_next：`yes`
- next_review_trigger：`后续做 benchmark 型实战调参时，回看默认值目标画像、L0/pending debt 指标、RateLimiter 与 dynamic level bytes 的边界`
- review_status：`answered`
- review_result：`partial`
- review_answered_at：`2026-05-24T21:47:00+08:00`
- review_notes：`Day 020 复习问答已完成。主线可以通过：memtable 内存层次、L0 compaction/slowdown/stop 三条线、target file 与 level target、RateLimiter 文件 I/O、pending compaction bytes 和 DB 级 WriteController 都答到核心。需纠偏：level_compaction_dynamic_level_bytes=true 的 base level 选择不是简单为了“把数据放到更高层降低写放大”，而是按总数据量和 multiplier 动态选择 base level，以维持更稳定的 LSM 形状和空间放大边界。当前无阻断，可以进入 Day 021。`
- review_block_next：`no`

### Day 021

- 主题：`SST File Ingestion`
- 文件：`learning-rocksdb-day021-2026-05-26-sst-file-ingestion.md`
- understanding_status：`yellow`
- mastery_score：`4/5`
- weak_points：
  - `SstFileWriter -> DBImpl::IngestExternalFiles -> ExternalSstFileIngestionJob -> VersionEdit -> LogAndApply -> SuperVersion` 主调用链已建立，但还需要通过复习题确认每一步职责边界
  - `global seqno` 的文件级覆盖语义已建立：默认不随机写回 SST 文件，而是进入 `FileMetaData / VersionEdit` 语义；后续可结合 `TableReader` 读路径和 snapshot 再压实
  - `ingest_behind / allow_db_generated_files / multi-CF atomic group` 已建立入口，但 tombstone 保留、DB-generated 文件迁移和 atomic group 恢复细节还没完全展开
- source_anchors：
  - `D:\program\rocksdb\include\rocksdb\db.h`
  - `D:\program\rocksdb\include\rocksdb\options.h`
  - `D:\program\rocksdb\include\rocksdb\sst_file_writer.h`
  - `D:\program\rocksdb\table\sst_file_writer.cc`
  - `D:\program\rocksdb\table\sst_file_writer_collectors.h`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc`
  - `D:\program\rocksdb\db\external_sst_file_ingestion_job.h`
  - `D:\program\rocksdb\db\external_sst_file_ingestion_job.cc`
  - `D:\program\rocksdb\db\version_edit.h`
  - `D:\program\rocksdb\db\version_edit.cc`
  - `D:\program\rocksdb\table\block_based\block_based_table_reader.cc`
  - `D:\program\rocksdb\docs\_posts\2017-02-17-bulkoad-ingest-sst-file.markdown`
- ready_for_next：`no`
- next_review_trigger：`完成 Day 021 复习题后，进入 Merge Operator / Compaction Filter；后续学习 Backup / Checkpoint 或 DeleteRange 时回看 ingestion 的文件生命周期、MANIFEST 和 tombstone 语义`
- review_status：
- review_result：
- review_answered_at：
- review_notes：`Day 021 文章已完成，复习题尚未回答。下一次继续新章节前，应先完成 SST File Ingestion 复习问答。`
- review_block_next：`yes`

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
  - `SST File Ingestion` 主链已建立，复习闸门待答题；下一步必须先完成 Day 021 复习题
  - `global seqno`、`level placement`、`memtable overlap flush`、`VersionEdit / MANIFEST` 的职责边界是 Day 021 复习重点
  - `ingest_behind / allow_db_generated_files / multi-CF atomic group` 已建立入口，后续可结合 tombstone、DB 文件迁移和恢复细节继续回看
  - `参数调优 / Rate Limiter / Write Stall` 主链已建立；后续可结合真实 `rocksdb.stats`、stall micros、L0 文件数、pending compaction bytes、compaction read/write bytes 做一次 benchmark 型实战调参
  - `BlobDB / KV 分离` 主链已建立；后续可结合测试继续压实 forced blob GC picker、backup/checkpoint 与 blob file live set、secondary/remote storage 下的 blob scan 性能边界
  - `事务与并发控制` 主线已建立；后续还要结合异常分支压实 TransactionDB、lock manager、snapshot/write conflict、WritePrepared / WriteUnprepared 与 `SnapshotChecker`
  - `Column Family` 主链已建立；`atomic_flush` 的主要语义已补上，MANIFEST atomic group 的恢复细节后续可结合 `VersionEditHandler` 再看
  - 跨 CF `WriteBatch` 的 WAL 原子写主链已建立；事务 DB 中的 snapshot、锁、WritePrepared / WriteUnprepared 可见性还需要继续看
  - 多 CF 下 block cache、write buffer manager、write stall 的资源竞争已在 Day 020 建立入口；后续需要结合真实指标验证各 CF 预算
  - `Leveled Compaction` 的 clean cut、grandparent overlap 还可以结合更细源码继续压实
  - `Universal` 的 `max_read_amp`、incremental universal compaction、delete-triggered compaction 细节还没完全展开
  - `Write Stall` 与 `WriteThread`、pipelined write、two write queues、事务写入优先级的组合边界还没细拆
  - `CompactionIterator` 主链已补上；`SnapshotChecker / write-prepared / write-unprepared` 对清理边界的影响已建立入口，但仍需结合异常分支继续回看
  - ordinary delete tombstone 的清理条件需要与 rule (A) 的 hidden old version 条件继续区分
  - `user-defined timestamp / full_history_ts_low / trim_ts` 与 compaction 历史 GC 的组合语义还没完全展开
  - `VersionSet` 与 `DBImpl / ColumnFamilyData / SuperVersion / Cache` 的整体架构边界还需要后续章节反复压实
  - `LogAndApply` 安装 `current Version` 与 `SuperVersion` 发布读视图的职责边界需要在 Compaction 中回看
  - MANIFEST sync 对频繁 flush/compaction、写停顿和小 SST 放大的影响已经在 Write Stall 中建立入口，但异常与恢复细节仍需回看
  - MANIFEST rollover、`CURRENT` rename 失败、非本地 FS 返回不确定状态、obsolete MANIFEST purge 的主结论已补充；DB open/recovery 里的异常恢复细节还需要回看
  - `CURRENT / MANIFEST / SST / WAL / OPTIONS / Blob` 在持久化状态中的职责边界还需要在 DB open 和 recovery 章节回看
  - SST 内部 index/filter/properties、blob 文件内部元数据、compaction progress 等非 MANIFEST 元数据还没有单独展开
  - `VersionEditHandlerPointInTime / best-efforts recovery` 的恢复分支
  - `manifest_writers_ / atomic group / multi-CF group commit` 的并发与批量提交流程
  - `CURRENT 切换失败 / MANIFEST rollover / obsolete manifest cleanup` 的异常恢复细节
  - `Block Cache` 已建立 block handle / charge / fill_cache 主链；`HyperClockCache / SecondaryCache / shard / priority` 的内部淘汰细节仍需回看
  - `FilePrefetchBuffer / readahead / direct I/O / mmap` 的性能取舍
  - `partitioned index / partitioned filter / prefix seek` 主链已建立；pin/cache dependency 与真实参数组合仍需回看
  - `atomic flush` 与普通 flush 的提交流程差异
  - `range tombstone / MultiGet / memtable bloom` 的组合边界
  - `ReadCallback` 在事务 DB 中的完整提交可见性
  - flush 推进 `min_log_number_to_keep` 之后，obsolete WAL 的实际删除/归档路径
- 回看触发条件：
  - `学习 BlobDB / KV 分离`
  - `学习事务与并发控制`
  - `学习 DB 打开/恢复路径`
  - `学习参数调优 / 缓存预算 / Prefix Seek`
  - `做 benchmark 型实战调参`
  - `学习 MANIFEST / VersionEdit / VersionSet`
  - `学习 Backup / Checkpoint`
  - `学习 DeleteRange / CompactionFilter / Blob GC`

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

- 2026-05-26T14:52:25+08:00
