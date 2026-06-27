# 本地参考源码仓库

这个目录用于存放学习、调研和写文章时需要源码级验证的外部开源项目。

推荐把相关仓库 clone 到这里：

```bash
git clone https://github.com/facebook/rocksdb.git local-repos/rocksdb
git clone https://github.com/mysql/mysql-server.git local-repos/mysql-server
```

`local-repos/*` 已在根目录 `.gitignore` 中忽略，clone 下来的外部仓库不会被提交到本站仓库。本文档会保留在 Git 中，用来说明目录用途。

在文章、提示词和工作流中引用外部源码时，优先使用仓库相对路径，例如：

```text
local-repos/rocksdb/db/db_impl/db_impl.cc
local-repos/mysql-server/storage/innobase/
```

如果对应源码仓库不存在，应先 clone；如果因为网络、权限或仓库不可用暂时无法 clone，需要记录阻塞原因，并且不要把未验证内容写成源码级结论。
