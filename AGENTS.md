# Repository Instructions

## Default

- Keep changes scoped to the user's request.
- Prefer reading existing files and patterns before making edits.
- When adding or updating files, keep content concise and maintainable.

## RocksDB Learning Workflow

When the user asks to learn, discuss, review, or persist RocksDB study content in this repository, follow [AGENTS-learning-rocksdb.md](D:\program\Dog-Du.github.io\AGENTS-learning-rocksdb.md) as the task-specific rule set.

Key points:

- Use `D:\program\rocksdb` as the local source-of-truth codebase.
- Treat external materials as question sources and context only; prioritize:
  - official RocksDB docs
  - GitHub Wiki
  - GitHub Issues
  - GitHub Discussions
  - then Stack Overflow, Zhihu, linux.do, and high-quality blogs
- Verify important external claims against the local RocksDB code before treating them as conclusions.
- Persist generated study content under `content/posts`.
- Keep the RocksDB study index file unique and stable at `content/posts/learning-rocksdb-day000-index.md`; update it instead of creating dated index variants.
- Use the `learning-rocksdb-dayXXX-YYYY-MM-DD-<topic>.md` naming scheme for new RocksDB learning files.
- Treat the daily article as the primary knowledge document and the index file as lightweight navigation.
- Prefer Mermaid diagrams when structures, relationships, call flows, or state transitions are easier to understand visually.
- Treat `design motivation`, `cross-system comparison`, and `engineering takeaways` as optional structured lenses on top of the main study path, not as separate primary tracks.
- Use the default learning path unless existing study files indicate a better next gap:
  - architecture / LSM
  - DB open path
  - write path / WAL / memtable / flush
  - SST / block-based table
  - read path / iterator / snapshot
  - disk I/O / file abstractions / on-disk roles / table reader / caching and buffering
  - manifest / version metadata
  - compaction
  - cache / bloom / prefix seek / partition index
  - column family
  - transactions / concurrency control
  - background work / recovery
  - tuning and deep dives
