---
date: '2025-10-05T11:14:11.000Z'
tags:
- C++
- Rocksdb
categories:
- 数据库与论文
title: Rocksdb：skiplist
slug: db-rocksdb-skiplist
summary: 结合 RocksDB 源码梳理 SkipList 的节点结构、迭代器设计与多读单写并发控制方式。
commentTerm: "Rocksdb：skiplist | DogDu's blog"
commentDiscussionNumber: 22
lastmod: '2025-10-06T10:54:29.284Z'
featureimage: "images/covers/cover_07_city.webp"
---
面试时被问到 `skiplist` 怎么做并发控制，当时回答得不够扎实，所以回来专门看了一遍 RocksDB 的实现，顺手把结构和设计思路记下来。


<!--more-->

## SkipList

代码文件在 [memtable/skiplist.h](https://github.com/facebook/rocksdb/blob/bdf5a8fffbc271dba1868e391409839aeee9b546/memtable/skiplist.h) ，这个版本的 `skiplist` 支持多读单写的无锁并发，如果需要多写的并发安全，则需要外部进行互斥，目前这个版本的跳表似乎已经被弃置。

## 结构

重要的结构是 `class SkipList` 、`struct SkipList::Node` 和 `class SkipList::Iterator`

### class SkipList

`class SkipList` 成员变量如下：

```cpp
const uint16_t kMaxHeight_;
const uint16_t kBranching_;
const uint32_t kScaledInverseBranching_;

// Immutable after construction
Comparator const compare_;
Allocator* const allocator_;  // Allocator used for allocations of nodes
Node* const head_;            // Modified only by Insert().

// Read racily by readers, but stale values are ok.
RelaxedAtomic<int> max_height_;  // Height of the entire list

// Used for optimizing sequential insert patterns. Tricky.
// prev_[i] for i up to max_height_ is the predecessor of prev_[0] and
// prev_height_ is the height of prev_[0].
// prev_[0] can only be equal to head_ before insertion, in which case
// max_height_ and prev_height_ are 1.
// prev_ 用于优化顺序插入模式。
// 对于 up to max_height_ 的 i，prev_[i] 是 prev_[0] 的前驱。
// prev_height_ 是 prev_[0] 的高度。
// prev_[0] 只能在插入之前等于 head_，在这种情况下 max_height_ 和
// prev_height_ 都是 1。
int32_t prev_height_;
Node** prev_;
```


非常好理解的成员变量，可能比较疑惑的是 `prev_height_` 和 `prev_` ，这两个是用来记录上一次插入的位置，用以优化顺序插入。

### struct SkipList::Node

`struct SkipList::Node` 成员变量如下：

```cpp
public:
  Key const key;

private:
  // Array of length equal to the node height.
  // next_[0] is lowest level link.
  AcqRelAtomic<Node*> next_[1];
```


`key` 就是用来存储的键，显然在这里 `Key` 应该是一个指向数据内存的指针。

接下来的 `next_[1]` 是一个常见的 struct hack，在支持柔性数组的 C99 中可以直接写成 `next_[]`，但 C++ 并不支持柔性数组，所以写成这样。

当然这么进行内存布局的话，就要求这个结构体不能以数组在内存紧密相挨，因为它实际的内存大小大于编译器以为的。

看一下 `NewNode` 方法就知道其用意了。

```cpp
template <typename Key, class Comparator>
typename SkipList<Key, Comparator>::Node*
SkipList<Key, Comparator>::NewNode(const Key& key, int height) {
  char* mem = allocator_->AllocateAligned(
      sizeof(Node) + sizeof(AcqRelAtomic<Node*>) * (height - 1));
  return new (mem) Node(key);
}
```


不过，从这个函数中可以留意到，`AcqRelAtomic<Node *>` 必须是一个简单的类型，能够支持这种操作。

那么它可以嘛？肯定是可以的。

`AcqRelAtomic<Node *>` 继承于 `RelaxedAtomic<Node *>`，其类型本身没有定义任何成员变量。

`RelaxedAtomic<Node *>` 内部只有一个 `std::atomic<Node *>` 的成员变量。

`std::atomic<Node *>` 类型中只有一个定义如下的成员变量：

```cpp
// Align 1/2/4/8/16-byte types to at least their size.
static constexpr int _S_min_alignment =
    (sizeof(_Tp) & (sizeof(_Tp) - 1)) || sizeof(_Tp) > 16 ? 0 : sizeof(_Tp);
static constexpr int _S_alignment        = _S_min_alignment > alignof(_Tp) ? _S_min_alignment : alignof(_Tp);
alignas(_S_alignment) _Tp _M_i _GLIBCXX20_INIT(_Tp());
```


对应到这里，也就是内部只有一个指针变量，同时是内存对齐的。可以供随意摆弄。

### class SkipList::Iterator

`class SkipList::Iterator` 成员变量如下：

```cpp
const SkipList* list_;
Node* node_;
```


很简单。

## 方法

因为跳表实现本身不难，比较有趣的是其并发实现，和部分方法的实现。

### Next, Prev

```cpp
template <typename Key, class Comparator>
inline void SkipList<Key, Comparator>::Iterator::Next() {
  assert(Valid());
  node_ = node_->Next(0);
}

template <typename Key, class Comparator>
inline void SkipList<Key, Comparator>::Iterator::Prev() {
  // Instead of using explicit "prev" links, we just search for the
  // last node that falls before key.
  assert(Valid());
  node_ = list_->FindLessThan(node_->key);
  if (node_ == list_->head_) {
    node_ = nullptr;
  }
}
```


对比迭代器这两个方法，可以发现，迭代器如果反向迭代，那么只会重新搜索，而不会像正向迭代那样直接修改指针指向下一个节点。

这是因为实现中 `SkipList::Node` 没有存储反向的指针，只存储了正向的指针。

我想这可能跟并发的实现相关，因为如果存储两个指针的话，在插入一个节点的时候，每层需要修改四个指针，新节点尚好，但在新节点进行发布 (release) 的时候，是没办法同时修改前后两个节点的两个指针的，这可能会让读者读到中间状态而困惑。

比如： prev <-> node <-> next

node 把自己的指针的 prev 和 next 已经做好了修改，然后修改 prev 和 next 其中之一，假设先修改 prev 再修改 next；那么在修改 prev 后，修改 next 前，读者可能会读到 prev->next != next->prev；

### FindLessThan

```cpp
template <typename Key, class Comparator>
typename SkipList<Key, Comparator>::Node*
SkipList<Key, Comparator>::FindLessThan(const Key& key, Node** prev) const {
  Node* x = head_;
  int level = GetMaxHeight() - 1;
  // KeyIsAfter(key, last_not_after) is definitely false
  Node* last_not_after = nullptr;
  while (true) {
    assert(x != nullptr);
    Node* next = x->Next(level);
    // 断言1：表示排序
    assert(x == head_ || next == nullptr || KeyIsAfterNode(next->key, x));
    // 断言2：没有超过
    assert(x == head_ || KeyIsAfterNode(key, x));
    if (next != last_not_after && KeyIsAfterNode(key, next)) {
      // Keep searching in this list
      x = next;
    } else {
      if (prev != nullptr) {
        prev[level] = x;
      }
      if (level == 0) {
        return x;
      } else {
        // Switch to next list, reuse KeyIUsAfterNode() result
        last_not_after = next;
        level--;
      }
    }
  }
}
```


`FindLessThan` 用于查找最后一个 key < key。同时会填充 prev 参数表示各层级的 prev 节点。

在这里每一次循环代表层内步进一次（`if (next != last_not_after && KeyIsAfterNode(*key*, next))`），或者层间步进一次(`else`)

写的让我比较疑惑，如果让我写，我肯定会写成一个双重循环，外层代表层级循环，内存代表层内循环。

就像下面这样：

```cpp
template <typename Key, class Comparator>
typename SkipList<Key, Comparator>::Node*
SkipList<Key, Comparator>::FindLessThan(const Key& key, Node** prev) const {
  Node* x = head_;
  Node* last_not_after = nullptr;
  for (int level = GetMaxHeight() - 1; level >= 0; --level) {
    Node* next = x->Next(level);
    while (next != last_not_after && KeyIsAfterNode(key, next)) {
      x = next;
      next = x->Next(level);
    }

    if (prev != nullptr) {
      prev[level] = x;
    }

    last_not_after = next;
  }
  return x;
}
```


没有选择使用双重循环可能有效率上的考量，可能可以减少一定的分支判断，也可能只是编写者个人习惯。

### Insert

#### SkipList::Insert

`memtable/skiplist.h` 中的 `SkipList::Insert`：

```cpp
template <typename Key, class Comparator>
void SkipList<Key, Comparator>::Insert(const Key& key) {
  // fast path for sequential insertion
  if (!KeyIsAfterNode(key, prev_[0]->NoBarrier_Next(0)) &&
      (prev_[0] == head_ || KeyIsAfterNode(key, prev_[0]))) {
    assert(prev_[0] != head_ || (prev_height_ == 1 && GetMaxHeight() == 1));

    // Outside of this method prev_[1..max_height_] is the predecessor
    // of prev_[0], and prev_height_ refers to prev_[0].  Inside Insert
    // prev_[0..max_height - 1] is the predecessor of key.  Switch from
    // the external state to the internal
    for (int i = 1; i < prev_height_; i++) {
      prev_[i] = prev_[0];
    }
  } else {
    // TODO(opt): we could use a NoBarrier predecessor search as an
    // optimization for architectures where memory_order_acquire needs
    // a synchronization instruction.  Doesn't matter on x86
    FindLessThan(key, prev_);
  }

  // Our data structure does not allow duplicate insertion
  assert(prev_[0]->Next(0) == nullptr || !Equal(key, prev_[0]->Next(0)->key));

  int height = RandomHeight();
  if (height > GetMaxHeight()) {
    for (int i = GetMaxHeight(); i < height; i++) {
      prev_[i] = head_;
    }
    // fprintf(stderr, "Change height from %d to %d\n", max_height_, height);

    // It is ok to mutate max_height_ without any synchronization
    // with concurrent readers.  A concurrent reader that observes
    // the new value of max_height_ will see either the old value of
    // new level pointers from head_ (nullptr), or a new value set in
    // the loop below.  In the former case the reader will
    // immediately drop to the next level since nullptr sorts after all
    // keys.  In the latter case the reader will use the new node.
    max_height_.StoreRelaxed(height);
  }

  Node* x = NewNode(key, height);
  for (int i = 0; i < height; i++) {
    // NoBarrier_SetNext() suffices since we will add a barrier when
    // we publish a pointer to "x" in prev[i].
    x->NoBarrier_SetNext(i, prev_[i]->NoBarrier_Next(i));
    prev_[i]->SetNext(i, x);
  }
  prev_[0] = x;
  prev_height_ = height;
}
```

#### InlineSkipList::Insert

`memtable/inlineskiplist.h` 中的 `InlineSkipList::Insert`：

```cpp
template <class Comparator>
template <bool UseCAS>
bool InlineSkipList<Comparator>::Insert(const char* key, Splice* splice,
                                         bool allow_partial_splice_fix) {
  Node* x = reinterpret_cast<Node*>(const_cast<char*>(key)) - 1;
  const DecodedKey key_decoded = compare_.decode_key(key);
  int height = x->UnstashHeight();
  assert(height >= 1 && height <= kMaxHeight_);

  int max_height = max_height_.LoadRelaxed();
  while (height > max_height) {
    if (max_height_.CasWeakRelaxed(max_height, height)) {
      max_height = height;
      break;
    }
  }
  assert(max_height <= kMaxPossibleHeight);

  int recompute_height = 0;
  if (splice->height_ < max_height) {
    splice->prev_[max_height] = head_;
    splice->next_[max_height] = nullptr;
    splice->height_ = max_height;
    recompute_height = max_height;
  } else {
    while (recompute_height < max_height) {
      if (splice->prev_[recompute_height]->Next(recompute_height) !=
          splice->next_[recompute_height]) {
        ++recompute_height;
      } else if (splice->prev_[recompute_height] != head_ &&
                 !KeyIsAfterNode(key_decoded,
                                 splice->prev_[recompute_height])) {
        if (allow_partial_splice_fix) {
          Node* bad = splice->prev_[recompute_height];
          while (splice->prev_[recompute_height] == bad) {
            ++recompute_height;
          }
        } else {
          recompute_height = max_height;
        }
      } else if (KeyIsAfterNode(key_decoded, splice->next_[recompute_height])) {
        if (allow_partial_splice_fix) {
          Node* bad = splice->next_[recompute_height];
          while (splice->next_[recompute_height] == bad) {
            ++recompute_height;
          }
        } else {
          recompute_height = max_height;
        }
      } else {
        break;
      }
    }
  }
  assert(recompute_height <= max_height);
  if (recompute_height > 0) {
    RecomputeSpliceLevels(key_decoded, splice, recompute_height);
  }

  bool splice_is_valid = true;
  if (UseCAS) {
    for (int i = 0; i < height; ++i) {
      while (true) {
        if (UNLIKELY(i == 0 && splice->next_[i] != nullptr &&
                     compare_(splice->next_[i]->Key(), key_decoded) <= 0)) {
          return false;
        }
        if (UNLIKELY(i == 0 && splice->prev_[i] != head_ &&
                     compare_(splice->prev_[i]->Key(), key_decoded) >= 0)) {
          return false;
        }
        assert(splice->next_[i] == nullptr ||
               compare_(x->Key(), splice->next_[i]->Key()) < 0);
        assert(splice->prev_[i] == head_ ||
               compare_(splice->prev_[i]->Key(), x->Key()) < 0);
        x->NoBarrier_SetNext(i, splice->next_[i]);
        if (splice->prev_[i]->CASNext(i, splice->next_[i], x)) {
          break;
        }
        FindSpliceForLevel<false>(key_decoded, splice->prev_[i], nullptr, i,
                                  &splice->prev_[i], &splice->next_[i]);
        if (i > 0) {
          splice_is_valid = false;
        }
      }
    }
  } else {
    for (int i = 0; i < height; ++i) {
      if (i >= recompute_height &&
          splice->prev_[i]->Next(i) != splice->next_[i]) {
        FindSpliceForLevel<false>(key_decoded, splice->prev_[i], nullptr, i,
                                  &splice->prev_[i], &splice->next_[i]);
      }
      if (UNLIKELY(i == 0 && splice->next_[i] != nullptr &&
                   compare_(splice->next_[i]->Key(), key_decoded) <= 0)) {
        return false;
      }
      if (UNLIKELY(i == 0 && splice->prev_[i] != head_ &&
                   compare_(splice->prev_[i]->Key(), key_decoded) >= 0)) {
        return false;
      }
      assert(splice->next_[i] == nullptr ||
             compare_(x->Key(), splice->next_[i]->Key()) < 0);
      assert(splice->prev_[i] == head_ ||
             compare_(splice->prev_[i]->Key(), x->Key()) < 0);
      assert(splice->prev_[i]->Next(i) == splice->next_[i]);
      x->NoBarrier_SetNext(i, splice->next_[i]);
      splice->prev_[i]->SetNext(i, x);
    }
  }
  if (splice_is_valid) {
    for (int i = 0; i < height; ++i) {
      splice->prev_[i] = x;
    }
    assert(splice->prev_[splice->height_] == head_);
    assert(splice->next_[splice->height_] == nullptr);
    for (int i = 0; i < splice->height_; ++i) {
      assert(splice->next_[i] == nullptr ||
             compare_(key, splice->next_[i]->Key()) < 0);
      assert(splice->prev_[i] == head_ ||
             compare_(splice->prev_[i]->Key(), key) <= 0);
      assert(splice->prev_[i + 1] == splice->prev_[i] ||
             splice->prev_[i + 1] == head_ ||
             compare_(splice->prev_[i + 1]->Key(), splice->prev_[i]->Key()) <
                 0);
      assert(splice->next_[i + 1] == splice->next_[i] ||
             splice->next_[i + 1] == nullptr ||
             compare_(splice->next_[i]->Key(), splice->next_[i + 1]->Key()) <
                 0);
    }
  } else {
    splice->height_ = 0;
  }
  return true;
}
```


insert 这个函数大概分为两个部分，前半部分的 splice 校验及修正，后半部分的正式插入。

先看前半部分。

```cpp
int max_height = max_height_.LoadRelaxed();
while (height > max_height) {
  if (max_height_.CasWeakRelaxed(max_height, height)) {
    max_height = height;
    break;
  }
}
assert(max_height <= kMaxPossibleHeight);
```


如果需要，则先对 `max_height_` 进行修改，这是第一步。

接下来是比较难理解的是 splice 矫正，这分为两个部分，一个是检查并得到从第几层开始修正，另一个则是正式的矫正。

```cpp
int recompute_height = 0;
if (splice->height_ < max_height) {
  splice->prev_[max_height] = head_;
  splice->next_[max_height] = nullptr;
  splice->height_ = max_height;
  recompute_height = max_height;
}
```
这里处理的是
splice
的
height
较低的情况，因为这个情况较难处理，所以直接放弃进行优化，直接在下面进行矫正时，从最顶层进行。
```cpp
} else {
  while (recompute_height < max_height) {
    if (splice->prev_[recompute_height]->Next(recompute_height) !=
        splice->next_[recompute_height]) {
      ++recompute_height;
    } else if (splice->prev_[recompute_height] != head_ &&
               !KeyIsAfterNode(key_decoded,
                               splice->prev_[recompute_height])) {
      if (allow_partial_splice_fix) {
        Node* bad = splice->prev_[recompute_height];
        while (splice->prev_[recompute_height] == bad) {
          ++recompute_height;
        }
      } else {
        recompute_height = max_height;
      }
    } else if (KeyIsAfterNode(key_decoded, splice->next_[recompute_height])) {
      if (allow_partial_splice_fix) {
        Node* bad = splice->next_[recompute_height];
        while (splice->next_[recompute_height] == bad) {
          ++recompute_height;
        }
      } else {
        recompute_height = max_height;
      }
    } else {
      break;
    }
  }
}
```


这里进行的操作是得到需要修正的所有层级，如果某一层完全套住了 key，那么就可以终止循环，因为 splice 遵从约束 prev[i+1].key <= prev[i].key < next[i].key <=next[i+1].key。

循环中有一组 if else。

第一个 `if (splice->prev_[recompute_height]->Next(recompute_height) !=splice->next_[recompute_height])` 表示 splice 中间插入了其他值，可能是 splice 过期了，所以需要进行修复，直接 ++recompute\_height。

第二个 `else if (splice->prev_[recompute_height] != head_ &&!KeyIsAfterNode(key_decoded,splice->prev_[recompute_height]))` 表示 key 在 splice 左边，需要修复。

第三个与第二个逻辑一致，表示 key 在 splice 右边，需要修复。

第四个则表示 key 完全落入 splice 中间，则可以推出循环，不需要继续修复。

```cpp
assert(recompute_height <= max_height);
if (recompute_height > 0) {
  RecomputeSpliceLevels(key_decoded, splice, recompute_height);
}
```


通过调用 `RecomputeSpliceLevels` 即可对 splice 进行修复，其逻辑与上面的描述一致。

其实这里修复是要求 splice 的 recompute\_height 层以及之下都能紧迫的套住 key。

而插入在这之后发生。

```cpp
bool splice_is_valid = true;
if (UseCAS) {
  for (int i = 0; i < height; ++i) {
    while (true) {
      if (UNLIKELY(i == 0 && splice->next_[i] != nullptr &&
                   compare_(splice->next_[i]->Key(), key_decoded) <= 0)) {
        return false;
      }
      if (UNLIKELY(i == 0 && splice->prev_[i] != head_ &&
                   compare_(splice->prev_[i]->Key(), key_decoded) >= 0)) {
        return false;
      }
      assert(splice->next_[i] == nullptr ||
             compare_(x->Key(), splice->next_[i]->Key()) < 0);
      assert(splice->prev_[i] == head_ ||
             compare_(splice->prev_[i]->Key(), x->Key()) < 0);
      x->NoBarrier_SetNext(i, splice->next_[i]);
      if (splice->prev_[i]->CASNext(i, splice->next_[i], x)) {
        break;
      }
      FindSpliceForLevel<false>(key_decoded, splice->prev_[i], nullptr, i,
                                &splice->prev_[i], &splice->next_[i]);
      if (i > 0) {
        splice_is_valid = false;
      }
    }
  }
}
```


先看一下支持并发插入的部分，这个部分假设 splice 是紧迫地套住 key 左右的，不过仍然会进行检查。

其实不难理解，指针修改从下到上可以尽快发现是否存在重复键，因为重复键需要返回失败，而已经修改的指针没办法安全的还原，所以必须从下到上修改。

于是第一步就是进行 key 的检查，是否存在重复键。

虽然先对插入的节点修改指针，最后使用 CAS 原子修改 prev 节点的指针指向。

如果 CAS 失败，说明可能存在其他线程并发的进行了插入，所以需要重新调用 `FindSpliceForLevel` 对 splice 进行重新紧迫，并进行下一次尝试。

splice\_is\_valid 用来指示是否 splice 是否在插入时进行了修改，因为如果插入时进行修改，可能会导致 splice 的约束遭到了破坏。

非并发插入部分的代码和并发插入部分的逻辑基本一致。

可以看到 splice 在插入过程中的作用，通过锁定范围，可以用来检查并发的冲突，非常的巧妙。

```cpp
if (splice_is_valid) {
  for (int i = 0; i < height; ++i) {
    splice->prev_[i] = x;
  }
  assert(splice->prev_[splice->height_] == head_);
  assert(splice->next_[splice->height_] == nullptr);
  for (int i = 0; i < splice->height_; ++i) {
    assert(splice->next_[i] == nullptr ||
           compare_(key, splice->next_[i]->Key()) < 0);
    assert(splice->prev_[i] == head_ ||
           compare_(splice->prev_[i]->Key(), key) <= 0);
    assert(splice->prev_[i + 1] == splice->prev_[i] ||
           splice->prev_[i + 1] == head_ ||
           compare_(splice->prev_[i + 1]->Key(), splice->prev_[i]->Key()) <
               0);
    assert(splice->next_[i + 1] == splice->next_[i] ||
           splice->next_[i + 1] == nullptr ||
           compare_(splice->next_[i]->Key(), splice->next_[i + 1]->Key()) <
               0);
  }
} else {
  splice->height_ = 0;
}
```


最后是收尾工作，对 splice 进行检查和保存当此结果。

如果 splice\_is\_valid == true，先修改 splice 的 prev，修改为指向插入的节点，保存当次结果，最后是进行一些检查，如果符合升序和非空。

如果 splice\_is\_valid == false，修改 splice 的 height 为 0 相当于标记了 splice 为一个无用值，在插入前会对 splice 进行检查 `if (splice->height_ < max_height)` 也有这个原因。

`memtable` 的方法参数太多了，看得有点头大，等看完了再做个总结。
