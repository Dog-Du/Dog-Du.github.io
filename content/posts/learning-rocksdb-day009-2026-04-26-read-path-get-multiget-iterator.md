---
title: RocksDB 学习笔记 Day 009：Read Path / Get / MultiGet / Iterator
date: 2026-04-26T15:23:14+08:00
lastmod: 2026-04-26T15:23:14+08:00
tags: [RocksDB, Database, Storage, ReadPath, Iterator]
categories: [数据库]
series:
- "RocksDB 学习笔记"
series_order: 9
slug: learning-rocksdb-day009-read-path-get-multiget-iterator
summary: 从 DBImpl::GetImpl、MultiGetImpl、NewInternalIterator、Version::Get、TableCache 和 BlockBasedTableReader 源码出发，梳理 RocksDB 读路径如何在 SuperVersion 稳定视图上先查 memtable，再查 immutable memtable，最后查 SST，并说明 Get、MultiGet 与 Iterator 的职责边界。
---

## 今日主题

- 主主题：`Read Path / Get / MultiGet / Iterator`
- 副主题：`SuperVersion 读视图、点查路径、批量点查路径、迭代器树`

## 学习目标

- 讲清一次 `Get()` 为什么不是直接去 SST 里找 key
- 讲清 `SuperVersion` 在读路径里稳定了哪些对象
- 讲清 `LookupKey`、`GetContext`、`FilePicker`、`TableCache` 各自负责什么
- 讲清 `Get`、`MultiGet`、`Iterator` 三条读 API 的共同骨架与差异
- 明确哪些内容留到后续章节继续深挖：
  - snapshot 与 sequence number 可见性
  - block cache / filter / table reader 打开过程
  - `MergingIterator` 与 `DBIter` 的完整扫描细节

## 前置回顾

Day 008 已经从写侧看清了 block-based SST 的生成过程：

- `BuildTable(...)` 把 flush/compaction 的有序输入流交给 `TableBuilder`
- `BlockBasedTableBuilder` 把输入拆成 data block、index block、filter block、properties block、metaindex block 和 footer
- footer 只是 SST 的尾部入口，真正从 key 定位 data block 还要依赖 index/filter/table reader

所以 Day 009 反过来看读侧：

- `Get()` 怎么先经过 memtable 和 immutable memtable
- SST 层如何从 `Version` 走到 `TableCache`，再走到具体 `TableReader`
- `Iterator` 为什么要构造一棵内部迭代器树，而不是反复调用 `Get()`

## 源码入口

- `D:\program\rocksdb\include\rocksdb\db.h`
- `D:\program\rocksdb\db\db_impl\db_impl.cc`
- `D:\program\rocksdb\db\db_impl\db_impl.h`
- `D:\program\rocksdb\db\column_family.h`
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

## 它解决什么问题

读路径要解决的不是“从一个地方找到 key”这么简单。RocksDB 的数据可能同时存在于：

1. 当前 mutable memtable
2. 多个 immutable memtable
3. L0 中可能重叠的 SST
4. L1 及以后通常不重叠、按 key range 排列的 SST

同时，同一个 user key 还可能有多个 internal key 版本：

- put
- delete
- single delete
- merge operand
- range tombstone 覆盖
- blob index
- wide column entity

所以读路径的核心问题是：

`在一个稳定的读视图上，按照从新到旧的顺序，找到对当前 snapshot 可见的第一个决定性结果。`

这里的“稳定读视图”很关键。读线程不能直接看一堆正在变化的成员变量，否则 flush、compaction、manifest 安装新版本时，读线程可能看到一半旧状态、一半新状态。RocksDB 用 `SuperVersion` 把当前列族的读视图打包起来：

- `mem`
- `imm`
- `current Version`
- `mutable_cf_options`

也就是说，读路径不是直接读 `ColumnFamilyData` 当前散落状态，而是先拿住一个 `SuperVersion`，再在这个视图上执行查找。

## 它是怎么工作的

### `Get()` 主链

```mermaid
flowchart TD
    A[DB::Get] --> B[DBImpl::GetImpl]
    B --> C[GetAndRefSuperVersion]
    C --> D[确定 snapshot sequence]
    D --> E[构造 LookupKey]
    E --> F[mutable memtable]
    F -->|未找到| G[immutable memtables]
    G -->|未找到| H[current Version]
    H --> I[FilePicker 选择可能重叠的 SST]
    I --> J[TableCache::Get]
    J --> K[TableReader::Get]
    K --> L[BlockBasedTable::Get]
    L --> M[filter -> index -> data block]
    M --> N[GetContext::SaveValue]
```

主流程可以压成一句话：

`GetImpl 在 SuperVersion 上构造 LookupKey，然后依次查 mem、imm、current Version；真正进入 SST 后，由 Version 选文件、TableCache 找 table reader、BlockBasedTableReader 再用 filter/index/data block 查具体 key。`

### `MultiGet()` 主链

```mermaid
flowchart TD
    A[DB::MultiGet] --> B[MultiGetCommon]
    B --> C[构造 KeyContext]
    C --> D[按 CF 和 user key 排序]
    D --> E[MultiCFSnapshot 获取每个 CF 的 SuperVersion]
    E --> F[MultiGetImpl]
    F --> G[按最多 32 个 key 建 MultiGetContext]
    G --> H[mem->MultiGet]
    H --> I[imm->MultiGet]
    I --> J[current->MultiGet]
    J --> K[FilePickerMultiGet 按文件批量处理 key range]
```

`MultiGet()` 不是简单循环调用 `Get()`。它会先把 key 按 column family 和 key 顺序整理，再在 memtable、SST、filter、block cache 层尽量批处理。

### `Iterator()` 主链

```mermaid
flowchart TD
    A[DB::NewIterator] --> B[获取 referenced SuperVersion]
    B --> C[NewIteratorImpl]
    C --> D[NewArenaWrappedDbIterator]
    D --> E[NewInternalIterator]
    E --> F[mutable memtable iterator]
    E --> G[immutable memtable iterators]
    E --> H[L0 table iterators]
    E --> I[Ln LevelIterator]
    F --> J[MergeIteratorBuilder]
    G --> J
    H --> J
    I --> J
    J --> K[MergingIterator]
    K --> L[DBIter]
    L --> M[用户看到的 Iterator]
```

`Iterator` 的关键差异是：

- 它不只找一个 key
- 它要把 mem、imm、L0、Ln 这些有序来源合并成一个 internal key 流
- 再由 `DBIter` 过滤不可见版本、删除标记、merge operand，最终暴露用户可见的 key/value

## 关键数据结构与实现点

### `SuperVersion`

`SuperVersion` 是读路径的稳定视图。

它不是 snapshot 本身。snapshot 解决“读到哪个 sequence number”；`SuperVersion` 解决“这次读看到哪一组 memtable / immutable memtable / Version 对象”。

### `LookupKey`

`LookupKey` 是把 user key 和 snapshot sequence 拼成 internal seek key 的工具。

它同时提供：

- `memtable_key()`
- `internal_key()`
- `user_key()`

这让同一个查找目标可以在 memtable、SST index、data block 中复用。

### `GetContext`

`GetContext` 是点查状态机。

它记录：

- 当前查找的 user key
- 结果状态：`kNotFound / kFound / kDeleted / kMerge / kCorrupt ...`
- range tombstone 最大覆盖 sequence
- merge operands
- 返回 value 或 wide columns 的 pin/copy 方式

`TableReader::Get()`、`MemTable::Get()` 最终都会通过 `GetContext::SaveValue()` 把候选 internal key 交给同一套状态机处理。

### `FilePicker`

`FilePicker` 是 `Version::Get()` 在 SST 层找候选文件的工具。

它的行为和 LSM 层级有关：

- L0 文件可能互相重叠，需要检查多个文件
- L1+ 文件通常不重叠，可以通过 key range 和二分缩小候选范围
- 如果当前文件没有命中，还要继续往下一层找

### `TableCache`

`TableCache` 把 `FileMetaData` 里的文件描述和实际 `TableReader` 连接起来。

它不是 block cache。它负责：

- 找到或打开 table reader
- 在 `read_tier == kBlockCacheTier` 时遵守 no-IO 语义
- 把请求转交给具体 `TableReader`

### `BlockBasedTableReader`

`BlockBasedTable::Get()` 是 day008 的反向消费方。

它会按大致顺序做：

1. full filter 判断 key 是否可能存在
2. index iterator 定位候选 data block
3. data block iterator 在块内 `SeekForGet`
4. 调用 `GetContext::SaveValue()` 处理 internal key

### `MultiGetContext`

`MultiGetContext` 是批量点查的工作集。

它把一组 key 变成：

- `LookupKey`
- internal key
- user key without timestamp
- 每个 key 的 `GetContext`
- 一个 range / mask，用于标记哪些 key 已经完成、哪些 key 还要继续往更老层级查

当前本地源码里 `MAX_BATCH_SIZE` 是 `32`。

### `MergeIteratorBuilder / MergingIterator / DBIter`

Iterator 路径分两层：

- `MergingIterator` 合并多个 internal iterator
- `DBIter` 把 internal key 流变成用户可见 key/value 流

这就是为什么范围扫描不能简单理解成“从每个 SST 读一点再返回”。它需要处理多路合并、sequence 可见性、删除遮蔽、merge operand 和 range tombstone。

## 源码细读

这次选 11 个关键片段，把读路径从 API 入口串到 memtable、SST 和 iterator。

### 1. `SuperVersion` 把读路径需要的对象固定下来

```cpp
// db/column_family.h, SuperVersion
struct SuperVersion {
  ColumnFamilyData* cfd;
  ReadOnlyMemTable* mem;
  MemTableListVersion* imm;
  Version* current;
  MutableCFOptions mutable_cf_options;
  uint64_t version_number;
  ...
};
```

这段结构定义直接说明：

- 前台读看到的不是单个对象
- 而是一组绑定在一起的对象

`mem`、`imm`、`current` 是读路径最核心的三段：

1. 最新可写 memtable
2. 等待 flush 的 immutable memtable 列表
3. 当前 Version 中的 SST 文件集合

所以 `SuperVersion` 是 Day 002 提到的“稳定读视图”的具体落点。

### 2. `GetImpl()` 先拿 `SuperVersion`，再确定 snapshot

```cpp
// db/db_impl/db_impl.cc, DBImpl::GetImpl(...)
SuperVersion* sv = GetAndRefSuperVersion(cfd);
...
SequenceNumber snapshot;
if (read_options.snapshot != nullptr) {
  snapshot = static_cast<const SnapshotImpl*>(read_options.snapshot)->number_;
} else {
  // 先引用 SuperVersion，再取 last published sequence，避免 flush/compaction
  // 在中间让读线程看到不自洽的状态。
  snapshot = GetLastPublishedSequence();
}
...
LookupKey lkey(key, snapshot, read_options.timestamp);
```

这里有一个非常重要的顺序：

`先拿 SuperVersion，再确定本次读的 sequence。`

源码注释解释了原因：如果先取 snapshot，再拿 `SuperVersion`，中间发生 flush/compaction，就可能让读线程既看不到旧数据，也看不到新数据。

这也是读路径里“稳定视图”和“可见性边界”分开的地方：

- `SuperVersion` 固定对象集合
- `snapshot sequence` 固定可见版本上界
- `LookupKey` 把 user key 和 sequence 打包成 internal lookup key

### 3. `GetImpl()` 的查找顺序是 mem -> imm -> current Version

```cpp
// db/db_impl/db_impl.cc, DBImpl::GetImpl(...)
if (!skip_memtable) {
  if (sv->mem->Get(lkey, value, columns, timestamp, &s, &merge_context,
                   &max_covering_tombstone_seq, read_options,
                   false /* immutable_memtable */, callback, is_blob_index)) {
    done = true;
  } else if ((s.ok() || s.IsMergeInProgress()) &&
             sv->imm->Get(lkey, value, columns, timestamp, &s, &merge_context,
                          &max_covering_tombstone_seq, read_options, callback,
                          is_blob_index)) {
    done = true;
  }
}

if (!done) {
  sv->current->Get(read_options, lkey, value, columns, timestamp, &s,
                   &merge_context, &max_covering_tombstone_seq,
                   &pinned_iters_mgr, value_found, nullptr, nullptr, callback,
                   is_blob_index, get_value);
}
```

这段就是点查主链的骨架。

注意这里不是“先 SST 后 memtable”，而是：

1. mutable memtable
2. immutable memtables
3. current Version 里的 SST

原因很直观：

- memtable 中的数据更新
- SST 中的数据更旧
- 同一个 user key 的新版本应该优先遮蔽旧版本

如果 mem/imm 已经找到决定性结果，就不进入 SST；如果遇到 merge operand 或未完成状态，可能还要继续往更老层找 base value。

### 4. `LookupKey` 同时服务 memtable 和 internal iterator

```cpp
// db/lookup_key.h, LookupKey
class LookupKey {
 public:
  Slice memtable_key() const {
    return Slice(start_, static_cast<size_t>(end_ - start_));
  }

  Slice internal_key() const {
    return Slice(kstart_, static_cast<size_t>(end_ - kstart_));
  }

  Slice user_key() const {
    return Slice(kstart_, static_cast<size_t>(end_ - kstart_ - 8));
  }
};
```

```cpp
// db/dbformat.cc, LookupKey::LookupKey(...)
dst = EncodeVarint32(dst, static_cast<uint32_t>(usize + ts_sz + 8));
kstart_ = dst;
memcpy(dst, _user_key.data(), usize);
...
EncodeFixed64(dst, PackSequenceAndType(s, kValueTypeForSeek));
```

这里可以看到三层 key 视角：

- memtable key：带长度前缀，适合 memtable 内部查找
- internal key：`user key + sequence/type`
- user key：对用户暴露的逻辑 key

这解释了为什么读路径一开始要构造 `LookupKey`，而不是一直拿原始 user key 往下传。

### 5. `MemTable::Get()` 先处理 range tombstone 和 bloom，再进表内查找

```cpp
// db/memtable.cc, MemTable::Get(...)
auto range_del_iter = NewRangeTombstoneIterator(
    read_opts, GetInternalKeySeqno(key.internal_key()), immutable_memtable);
if (range_del_iter != nullptr) {
  SequenceNumber covering_seq =
      range_del_iter->MaxCoveringTombstoneSeqnum(key.user_key());
  if (covering_seq > *max_covering_tombstone_seq) {
    *max_covering_tombstone_seq = covering_seq;
  }
}

if (bloom_filter_ && !may_contain) {
  *seq = kMaxSequenceNumber;
} else {
  GetFromTable(key, *max_covering_tombstone_seq, do_merge, callback,
               is_blob_index, value, columns, timestamp, s, merge_context,
               seq, &found_final_value, &merge_in_progress);
}
```

memtable 读路径不是只做 skiplist 查找。

它先看 range tombstone：

- 如果有覆盖当前 key 的范围删除，要记录最高覆盖 sequence
- 后续点 key 如果比 tombstone 更旧，会被 tombstone 遮蔽

然后再看 memtable bloom：

- 如果 bloom 明确不可能存在，就不用进底层 `MemTableRep`
- 如果可能存在，再进入 `GetFromTable(...)`

这也解释了 Day 006 中的一个遗留点：range tombstone 会让 memtable bloom 优化变复杂，因为即使点 key 不存在，范围删除也可能决定最终结果。

### 6. `Version::Get()` 用 `FilePicker` 在 SST 层逐层找候选文件

```cpp
// db/version_set.cc, Version::Get(...)
FilePicker fp(user_key, ikey, &storage_info_.level_files_brief_,
              storage_info_.num_non_empty_levels_,
              &storage_info_.file_indexer_, user_comparator(),
              internal_comparator());
FdWithKeyRange* f = fp.GetNextFile();

while (f != nullptr) {
  *status = table_cache_->Get(
      read_options, *internal_comparator(), *f->file_metadata, ikey,
      &get_context, mutable_cf_options_,
      cfd_->internal_stats()->GetFileReadHist(fp.GetHitFileLevel()),
      IsFilterSkipped(static_cast<int>(fp.GetHitFileLevel()),
                      fp.IsHitFileLastInLevel()),
      fp.GetHitFileLevel(), max_file_size_for_l0_meta_pin_);

  switch (get_context.State()) {
    case GetContext::kNotFound:
    case GetContext::kMerge:
      break;       // 继续查更老的文件
    case GetContext::kFound:
      return;      // 找到最终值
    case GetContext::kDeleted:
      *status = Status::NotFound();
      return;
    ...
  }
  f = fp.GetNextFile();
}
```

这段把 SST 层点查讲清楚了：

- `Version` 不直接读文件
- 它先用 `FilePicker` 找“当前 key 可能落在哪些 SST”
- 每个候选文件交给 `TableCache::Get(...)`
- 查找状态由 `GetContext` 控制

`kNotFound` 和 `kMerge` 都不一定能立刻结束：

- `kNotFound`：当前文件没有，继续找更老层
- `kMerge`：已经收集到 merge operand，但还需要更老 base value

`kFound` 和 `kDeleted` 才是更明确的终止状态。

### 7. `FilePicker` 区分 L0 与 L1+ 的文件选择方式

```cpp
// db/version_set.cc, FilePicker::PrepareNextLevel()
if (curr_level_ == 0) {
  // L0 文件可能重叠，要从头检查
  start_index = 0;
} else {
  // L1+ 文件按范围排序，用二分和上一层结果缩小范围
  start_index = FindFileInRange(*internal_comparator_, *curr_file_level_,
                                ikey_, search_left_bound_,
                                search_right_bound_ + 1);
  if (start_index == search_right_bound_ + 1) {
    // 当前 level 不可能包含这个 key，跳到下一层
    search_left_bound_ = 0;
    search_right_bound_ = FileIndexer::kLevelMaxIndex;
    curr_level_++;
    continue;
  }
}
```

这是读放大的第一层来源：

- L0 文件可能重叠，点查可能要看多个 L0 文件
- L1+ 文件通常不重叠，点查可以更快缩小到一个候选范围

这也是后面学习 compaction 时必须回来的点：

- compaction 不只是“整理磁盘空间”
- 它还会改变读路径要检查的文件数量

### 8. `TableCache::Get()` 负责找到 table reader，再交给 reader

```cpp
// db/table_cache.cc, TableCache::Get(...)
TableReader* t = fd.table_reader;
TypedHandle* handle = nullptr;
if (s.ok() && !done) {
  if (t == nullptr) {
    s = FindTable(options, file_options_, internal_comparator, file_meta,
                  &handle, mutable_cf_options,
                  options.read_tier == kBlockCacheTier /* no_io */,
                  file_read_hist, skip_filters, level,
                  true /* prefetch_index_and_filter_in_cache */,
                  max_file_size_for_l0_meta_pin, file_meta.temperature);
    if (s.ok()) {
      t = cache_.Value(handle);
    }
  }
  ...
  if (s.ok()) {
    s = t->Get(options, k, get_context,
               mutable_cf_options.prefix_extractor.get(), skip_filters);
  } else if (options.read_tier == kBlockCacheTier && s.IsIncomplete()) {
    get_context->MarkKeyMayExist();
    done = true;
  }
}
```

这里有两个边界：

第一，`TableCache` 不是 `BlockBasedTable` 自己。

- `TableCache` 管理 table reader 的打开、缓存和 no-IO 行为
- 具体 table 格式的查找交给 `TableReader::Get`

第二，`kBlockCacheTier` 这种 no-IO 读不是“确认不存在”。

- 如果 table/index/data 不在 cache 中，可能返回 `Incomplete`
- 此时只能标记 `KeyMayExist`

所以 `KeyMayExist()` 之类 API 的语义要比 `Get()` 弱。

### 9. `BlockBasedTable::Get()` 反向消费 day008 的 SST 结构

```cpp
// table/block_based/block_based_table_reader.cc, BlockBasedTable::Get(...)
const bool may_match =
    FullFilterKeyMayMatch(filter, key, prefix_extractor, get_context,
                          &lookup_context, read_options);

if (may_match) {
  auto iiter = NewIndexIterator(read_options, need_upper_bound_check,
                                &iiter_on_stack, get_context,
                                &lookup_context);

  for (iiter->Seek(key); iiter->Valid() && !done; iiter->Next()) {
    IndexValue v = iiter->value();
    DataBlockIter biter;
    NewDataBlockIterator(read_options, v.handle, &biter, BlockType::kData,
                         get_context, &lookup_data_block_context, nullptr,
                         false, false, tmp_status, true);

    bool may_exist = biter.SeekForGet(key);
    if (!may_exist && ts_sz == 0) {
      done = true;
    } else {
      for (; biter.Valid(); biter.Next()) {
        ParsedInternalKey parsed_key;
        Status pik_status = ParseInternalKey(biter.key(), &parsed_key, false);
        bool ret = get_context->SaveValue(
            parsed_key, biter.value(), &matched, &read_status,
            biter.IsValuePinned() ? &biter : nullptr);
        if (!ret) {
          done = true;
          break;
        }
      }
    }
  }
}
```

这段正好把 Day 008 的结构反向串起来：

1. 先用 full filter 做快速否定
2. 再用 index block 找候选 data block
3. 读出 data block 后做块内 seek
4. 逐条 internal key 交给 `GetContext::SaveValue()`

这里也能解释一个常见误区：

- index/filter 不是最终结果
- 它们只是减少要读的 data block
- 最终 value/delete/merge 语义仍然要交给 `GetContext`

### 10. `GetContext::SaveValue()` 是点查状态机

```cpp
// table/get_context.cc, GetContext::SaveValue(...)
if (ucmp_->EqualWithoutTimestamp(parsed_key.user_key, user_key_)) {
  *matched = true;
  if (!CheckCallback(parsed_key.sequence)) {
    return true;  // 当前版本不可见，继续看更老版本
  }

  auto type = parsed_key.type;
  if (max_covering_tombstone_seq_ != nullptr &&
      *max_covering_tombstone_seq_ > parsed_key.sequence) {
    type = kTypeRangeDeletion;
  }

  switch (type) {
    case kTypeValue:
    case kTypeValuePreferredSeqno:
    case kTypeBlobIndex:
    case kTypeWideColumnEntity:
      state_ = kFound;
      ...
      return false;
    case kTypeDeletion:
    case kTypeDeletionWithTimestamp:
    case kTypeSingleDeletion:
    case kTypeRangeDeletion:
      state_ = kDeleted;
      return false;
    case kTypeMerge:
      state_ = kMerge;
      ...
      return true;
  }
}
```

这段代码是读路径语义的中心。

它回答了几个关键问题：

- 为什么同一个 user key 可能要继续往后读？
  - 因为当前看到的可能是不可见版本，或者是 merge operand
- 为什么范围删除可以盖过点 key？
  - 因为 `max_covering_tombstone_seq` 比点 key sequence 更新时，会把类型改成 `kTypeRangeDeletion`
- 为什么 `Get()` 能区分 NotFound 和 Deleted？
  - `GetContext` 内部有状态机，但最终对用户通常都转成 `Status::NotFound()`

本节先不把 merge operator 完整展开。这里只需要记住：merge 会让点查不能在第一个 operand 处停下，必须继续往更老版本找 base value。

### 11. `Iterator` 先构造内部迭代器树，再由 `DBIter` 做用户可见过滤

```cpp
// db/db_impl/db_impl.cc, DBImpl::NewInternalIterator(...)
MergeIteratorBuilder merge_iter_builder(&cfd->internal_comparator(), arena,
    !read_options.total_order_seek && prefix_extractor != nullptr,
    read_options.iterate_upper_bound);

auto mem_iter = super_version->mem->NewIterator(
    read_options, super_version->GetSeqnoToTimeMapping(), arena,
    super_version->mutable_cf_options.prefix_extractor.get(),
    false /* for_flush */);
merge_iter_builder.AddPointAndTombstoneIterator(mem_iter, ...);

super_version->imm->AddIterators(read_options,
    super_version->GetSeqnoToTimeMapping(),
    super_version->mutable_cf_options.prefix_extractor.get(),
    &merge_iter_builder, !read_options.ignore_range_deletions);

if (read_options.read_tier != kMemtableTier) {
  super_version->current->AddIterators(read_options, file_options_,
                                      &merge_iter_builder,
                                      allow_unprepared_value);
}

internal_iter = merge_iter_builder.Finish(...);
```

`NewInternalIterator()` 的工作就是把所有读来源都挂到同一个合并器上：

- mutable memtable iterator
- immutable memtable iterators
- L0 table iterators
- L1+ level iterators

然后 `DBIter` 再包住这个 internal iterator：

```cpp
// db/arena_wrapped_db_iter.cc, NewArenaWrappedDbIterator(...)
db_iter->Init(env, read_options, cfh->cfd()->ioptions(),
              sv->mutable_cf_options, sv->current, sequence,
              sv->version_number, read_callback, cfh, expose_blob_index,
              allow_refresh, allow_mark_memtable_for_flush ? sv->mem : nullptr);

InternalIterator* internal_iter = db_impl->NewInternalIterator(
    db_iter->GetReadOptions(), cfh->cfd(), sv, db_iter->GetArena(), sequence,
    true /* allow_unprepared_value */, db_iter);
db_iter->SetIterUnderDBIter(internal_iter);
```

所以 iterator 路径有两层职责：

- `MergingIterator`：合并多路 internal key
- `DBIter`：按 snapshot / timestamp / delete / merge 语义整理成用户可见结果

这和 `Get()` 很不一样。`Get()` 是围绕一个 key 做短路查找；`Iterator` 是围绕一个有序流做持续过滤。

## 今日问题与讨论

### 我的问题

#### 问题 1：`Get()` 为什么要先查 memtable，再查 SST？

- 简答：
  - 因为 memtable 中的数据更新，SST 中的数据更旧；同一个 user key 的新版本应该先决定结果。
- 源码依据：
  - `D:\program\rocksdb\db\db_impl\db_impl.cc` 的 `DBImpl::GetImpl(...)`
- 当前结论：
  - `GetImpl` 的顺序明确是 `sv->mem->Get(...) -> sv->imm->Get(...) -> sv->current->Get(...)`。
  - 如果 mem/imm 已经找到最终值或删除标记，就不需要继续查 SST。
- 是否需要后续回看：
  - `yes`
  - 学 snapshot / sequence number 时回看这个顺序为什么能保证可见性。

#### 问题 2：`SuperVersion` 和 snapshot 是一回事吗？

- 简答：
  - 不是。
  - `SuperVersion` 固定读路径要看的对象集合；snapshot 固定可见的 sequence 上界。
- 源码依据：
  - `D:\program\rocksdb\db\column_family.h` 的 `SuperVersion`
  - `D:\program\rocksdb\db\db_impl\db_impl.cc` 的 `DBImpl::GetImpl(...)`
- 当前结论：
  - 没有 snapshot 时，`GetImpl` 会先引用 `SuperVersion`，再取 `GetLastPublishedSequence()`。
  - 这个顺序是为了避免 flush/compaction 夹在中间造成读视图不自洽。
- 是否需要后续回看：
  - `yes`
  - Day 010 建议专门讲 snapshot / sequence number 可见性。

#### 问题 3：`GetContext` 为什么是状态机，而不是直接返回 value？

- 简答：
  - 因为点查可能遇到 value、delete、merge operand、range tombstone、blob index、wide column 和不可见版本。
- 源码依据：
  - `D:\program\rocksdb\table\get_context.h`
  - `D:\program\rocksdb\table\get_context.cc`
- 当前结论：
  - `GetContext::SaveValue()` 的返回值控制“是否继续往更老版本查”。
  - `kFound / kDeleted / kCorrupt` 等是终止状态；`kNotFound / kMerge` 常常需要继续搜索。
- 是否需要后续回看：
  - `yes`
  - merge operator 与 blob index 后面可以单独展开。

#### 问题 4：`MultiGet()` 是否只是循环调用 `Get()`？

- 简答：
  - 不是。
  - 它复用了 Get 的语义，但会按 CF/key 排序、分批构造 `MultiGetContext`，并在 memtable 和 SST 层做批处理。
- 源码依据：
  - `D:\program\rocksdb\db\db_impl\db_impl.cc` 的 `MultiGetCommon(...)`、`MultiGetImpl(...)`
  - `D:\program\rocksdb\table\multiget_context.h`
  - `D:\program\rocksdb\db\version_set.cc` 的 `Version::MultiGet(...)`
- 当前结论：
  - 当前本地源码中 `MultiGetContext::MAX_BATCH_SIZE` 是 `32`。
  - `Version::MultiGet()` 会使用 `FilePickerMultiGet`，按文件和 key range 批量查。
- 是否需要后续回看：
  - `yes`
  - block cache / async I/O / filter 章节再看 MultiGet 的 I/O 优化。

#### 问题 5：Iterator 为什么不直接复用 `Get()`？

- 简答：
  - 因为 Iterator 要产生连续有序结果，它需要合并多个有序来源，并过滤 internal key 版本。
- 源码依据：
  - `D:\program\rocksdb\db\db_impl\db_impl.cc` 的 `NewInternalIterator(...)`
  - `D:\program\rocksdb\table\merging_iterator.cc`
  - `D:\program\rocksdb\db\db_iter.cc`
- 当前结论：
  - Iterator 的底层是 `mem/imm/SST iterators -> MergingIterator -> DBIter`。
  - `Get()` 是单 key 短路查找；Iterator 是多路有序流合并与可见性过滤。
- 是否需要后续回看：
  - `yes`
  - 范围扫描、`MergingIterator`、`DBIter` 的 reverse/merge 细节后续可以继续拆。

### 外部高价值问题

- 本节不额外引入外部问题。
- 原因：
  - Day 009 的目标是先从当前本地源码建立读路径主骨架。
  - block cache、Bloom filter、prefix seek、partitioned index/filter 的外部讨论更适合在后续读优化章节引入。

## 常见误区或易混点

### 误区 1：`Get()` 就是直接查 SST

不对。

`Get()` 先走：

1. memtable
2. immutable memtable
3. current Version 中的 SST

SST 是未在内存层找到决定性结果之后才进入的路径。

### 误区 2：`SuperVersion` 就是 snapshot

不对。

- `SuperVersion` 固定对象集合
- snapshot 固定 sequence 可见上界

它们一起构成一次读的稳定语义，但职责不同。

### 误区 3：filter 命中就表示 key 存在

不对。

filter 只能做快速否定：

- 不匹配：通常可以跳过
- 匹配：只表示“可能存在”

最终仍然要进入 index/data block，并让 `GetContext` 判断结果。

### 误区 4：`MultiGet()` 等于 for 循环调用 `Get()`

不对。

`MultiGet()` 会建立批量上下文：

- 排序 key
- 按 CF 分组
- 共享 snapshot / SuperVersion 获取
- memtable 和 SST 层批处理
- 在 table reader 层复用 filter / cache / I/O 优化机会

### 误区 5：Iterator 只是在 SST 文件上移动

不对。

Iterator 的内部来源包括：

- mutable memtable
- immutable memtables
- L0 SST
- L1+ SST

真正返回给用户前，还要经过 `DBIter` 的可见性和删除/merge 语义处理。

## 设计动机

读路径的设计核心是“把稳定性、层级查找和格式细节分层”。

第一层，`DBImpl` 负责 API 语义：

- 确定 read options
- 获取 `SuperVersion`
- 确定 snapshot sequence
- 选择 Get / MultiGet / Iterator 对应主链

第二层，`Version` 负责 LSM 文件集合：

- 当前有哪些 SST
- 哪些文件可能包含 key
- L0 与 L1+ 的查找方式有什么不同

第三层，`TableCache / TableReader` 负责物理表读取：

- table reader 如何打开和缓存
- filter/index/data block 如何协同
- block cache / no-IO / prefetch 如何参与

这种分层让 RocksDB 能把读路径优化拆到不同层次，而不用让 `DBImpl::Get()` 直接理解所有 SST 内部细节。

## 横向对比

和传统 B+Tree 存储引擎相比，RocksDB 的读路径有一个明显差异：

- B+Tree 通常沿着一棵树从 root page 查到 leaf page
- LSM/RocksDB 则是在多个有序层级中查找，并靠 sequence number 和层级顺序决定可见结果

这带来两个直接后果：

1. RocksDB 的点查可能需要查多个位置，尤其是 L0 文件较多或 cache/filter 效果不好时
2. RocksDB 的范围扫描必须合并多个来源，所以 `MergingIterator + DBIter` 是核心结构

这也是为什么 RocksDB 后续有大量读优化主题：

- block cache
- Bloom filter
- prefix seek
- partitioned index/filter
- compaction 降低重叠范围

## 工程启发

Day 009 最值得记的工程点有三个。

第一，稳定视图显式建模。

`SuperVersion` 把读线程需要的对象集合打包起来，而不是让读线程到处追当前指针。这种方式能让读路径和后台状态切换解耦。

第二，点查状态机集中在 `GetContext`。

memtable、SST、row cache 都可以把候选 internal key 交给同一个状态机处理，避免每一层都重新实现 value/delete/merge/range tombstone 语义。

第三，Iterator 路径明确分成 internal stream 和 user-visible stream。

`MergingIterator` 只负责合并 internal key；`DBIter` 再负责转换成用户结果。这种边界非常清楚，也解释了为什么范围扫描是单独一套机制，而不是点查的重复调用。

## 今日小结

Day 009 把读路径的第一层骨架串起来了：

- `Get()`：
  - 获取 `SuperVersion`
  - 确定 snapshot sequence
  - 构造 `LookupKey`
  - 按 `mem -> imm -> current Version` 查找
  - 进入 SST 后走 `Version -> TableCache -> TableReader -> BlockBasedTable`
- `MultiGet()`：
  - 不是循环 `Get`
  - 它会排序、分组、分批，用 `MultiGetContext` 和 `FilePickerMultiGet` 批量推进
- `Iterator()`：
  - 构造 internal iterator tree
  - 用 `MergingIterator` 合并多个来源
  - 用 `DBIter` 输出用户可见 key/value

如果只记一句话：

`RocksDB 读路径的本质，是在一个 SuperVersion 稳定视图上，把 memtable、immutable memtable 和 Version 中的 SST 按新旧顺序接起来，再由 GetContext 或 DBIter 处理可见性与删除/merge 语义。`

## 明日衔接

Day 010 建议进入：`Snapshot / Sequence Number / 可见性语义`。

自然衔接点是：

- `GetImpl()` 为什么先拿 `SuperVersion` 再取 sequence
- `LookupKey` 里的 `kValueTypeForSeek` 如何影响 internal key 查找
- `GetContext::CheckCallback()` 与 `DBIter::IsVisible()` 如何过滤不可见版本
- snapshot 与 flush/compaction 并发时，为什么还能保持读一致性

## 复习题

1. `SuperVersion` 和 snapshot 在读路径里的职责分别是什么？
2. `DBImpl::GetImpl()` 为什么按 `mem -> imm -> current Version` 的顺序查？
3. `Version::Get()` 中 `FilePicker` 为什么要区分 L0 和 L1+？
4. `GetContext::SaveValue()` 为什么可能返回“继续查更老版本”？
5. `MultiGet()` 和循环调用 `Get()` 的主要区别是什么？
6. `Iterator` 路径里 `MergingIterator` 和 `DBIter` 的职责边界是什么？
