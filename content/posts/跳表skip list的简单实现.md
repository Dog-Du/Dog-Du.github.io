---
date: '2024-01-22T11:18:53.000Z'
tags:
- 数据结构与算法
categories:
- 算法与数据结构
title: 跳表（skip list）的简单实现
slug: algo-skiplist-impl
summary: 给出一份基础跳表实现，说明随机层高、跨度维护以及排名、前驱后继等常见操作。
commentTerm: "跳表（skip list）的简单实现 | DogDu's blog"
lastmod: '2025-04-04T11:32:10.720Z'
featureimage: "images/covers/cover_13_beach.webp"
series:
- "跳表探索"
---
参考文章：[普通平衡树 - 跳表 - Tibrella 的隙间](https://www.luogu.com.cn/blog/tibrella/pu-tong-ping-heng-shu-tiao-biao)


<!--more-->

这篇文章给出一份偏基础版的跳表实现，核心关注点是随机层高、`span` 的维护，以及如何支持排名、按排名查询、前驱后继这些有序集合操作。

```cpp
#include <ctime>
#include <iostream>
#include <random>

#define ll long long

using namespace std;

// 总结：
// skip list 简单好写，空间复杂度为 O(p * MAX_LEVEL * n)，
// p 为创建新节点时向上长高的概率，这段程序里是 1/4。
// 因为 skip list 完全支持线性读写，所以将它封装成泛型容器也不困难，
// 尤其是迭代器也很好写；如果要支持 -- 操作，可能需要改成双向链表。
const int N = 1e5 + 10, MAX_LEVEL = 12;

std::random_device seed;
std::minstd_rand rng(seed()); // 生成随机数

struct Node {
    int level; // 其实写成 const 更好，这里偷懒了
    ll key;

    struct nodePointer {
        int span;     // 跨幅，方便 get_rank / find_by_rank，类似平衡树中的 node_count
        Node* pointer;

        nodePointer() : span(0), pointer(nullptr) {} // 新建时默认为空
        nodePointer(Node* x) : span(0), pointer(x) {}

        Node* operator->() { return pointer; }
        operator Node*() { return pointer; }
    } *next;

    // 一个节点在生成时就决定了自己的 level，之后不会再改变
    ~Node() { delete[] next; } // 析构时删除 next 数组
    Node() : key(0), level(0) {}
};

Node* new_node() {
    return new Node;
}

void del_node(Node* x) {
    delete x;
}

// 产生随机高度，其中 (rng() & 1) && (rng() & 1) 表示概率为 1/4
int random_level() {
    int ret = 1;
    while (ret < MAX_LEVEL && (rng() & 1) && (rng() & 1)) {
        ++ret;
    }
    return ret;
}

Node* create_node(const int& level, const ll& key) { // 生成一个节点
    Node* ret = new_node();
    ret->key = key;
    ret->level = level;
    ret->next = new Node::nodePointer[level];
    return ret;
}

Node* head = create_node(MAX_LEVEL, 0); // head 为头结点，减少分类讨论
int level = 0, length = 0;              // 显然它一定是最高层

void insert(const ll& key) {
    Node* cur = head;
    Node::nodePointer update[MAX_LEVEL];
    int lst_pos[MAX_LEVEL + 1]; // 记录每一层上一个节点的位置（下标），为维护 span 服务
    lst_pos[level] = 0;         // 下面从 level - 1 开始，故这里开 MAX_LEVEL + 1

    for (int i = level - 1; i >= 0; --i) {
        lst_pos[i] = lst_pos[i + 1]; // 往下爬，但是下标不动
        while (cur->next[i] && cur->next[i]->key < key) {
            lst_pos[i] += cur->next[i].span; // 下标加上跨幅
            cur = cur->next[i];
        }
        update[i] = cur; // 需要更新 span 和 next 的点
    }

    int newlevel = random_level(); // 新节点生成高度
    if (newlevel > level) {        // 如果大于现在的高度，那么需要更新
        for (int i = level; i < newlevel; ++i) {
            update[i] = head;            // 这些层目前只有头结点
            update[i]->next[i].span = length;
            lst_pos[i] = 0;
        }
        level = newlevel;
    }

    cur = create_node(newlevel, key); // update 数组已经记录了插入位置
    for (int i = 0; i < newlevel; ++i) {
        cur->next[i] = update[i]->next[i]; // 链表插入
        cur->next[i].span = update[i]->next[i].span - (lst_pos[0] - lst_pos[i]);
        // 更新新节点跨幅。lst_pos[0] 表示第 0 层前驱位置，lst_pos[i] 表示第 i 层前驱位置
        update[i]->next[i].pointer = cur; // 链表插入
        update[i]->next[i].span = lst_pos[0] - lst_pos[i] + 1;
    }

    for (int i = newlevel; i < level; ++i) { // newlevel 小于当前 level 时，上层跨幅加一
        ++update[i]->next[i].span;
    }
    ++length;
}

void erase(const ll& key) {
    Node* cur = head;
    Node::nodePointer update[MAX_LEVEL];

    for (int i = level - 1; i >= 0; --i) {
        while (cur->next[i] && cur->next[i]->key < key) {
            cur = cur->next[i];
        }
        update[i] = cur;
    }

    cur = cur->next[0]; // cur 指向应删除节点
    for (int i = 0; i < level; ++i) { // 更新跨幅和 next 指针
        if (update[i]->next[i] == cur) {
            update[i]->next[i].span += cur->next[i].span - 1;
            update[i]->next[i].pointer = cur->next[i].pointer;
        } else {
            --update[i]->next[i].span;
        }
    }

    while (level > 1 && !head->next[level - 1]) {
        // 节点删除后可能导致层数减少，判断标准为 head->next[level - 1] == nullptr
        --level;
    }

    del_node(cur);
    --length;
}

// 下面几个查找都比较直接
int get_rank(const ll& key) {
    Node* cur = head;
    int res = 0;
    for (int i = level - 1; i >= 0; --i) {
        while (cur->next[i] && cur->next[i]->key < key) {
            res += cur->next[i].span;
            cur = cur->next[i];
        }
    }
    return res + 1;
}

ll find_by_rank(int k) {
    Node* cur = head;
    for (int i = level - 1; i >= 0; --i) {
        while (cur->next[i] && k - cur->next[i].span > 0) {
            k -= cur->next[i].span;
            cur = cur->next[i];
        }
    }
    return cur->next[0]->key;
}

Node* prev(const ll& key) {
    Node* cur = head;
    for (int i = level - 1; i >= 0; --i) {
        while (cur->next[i] && cur->next[i]->key < key) {
            cur = cur->next[i];
        }
    }
    return cur;
}

Node* next(const ll& key) {
    Node* cur = head;
    for (int i = level - 1; i >= 0; --i) {
        while (cur->next[i] && cur->next[i]->key <= key) {
            cur = cur->next[i];
        }
    }
    return cur->next[0];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

#ifdef LOCAL
    clock_t c1 = clock();
    freopen("in.in", "r", stdin);
    freopen("out.out", "w", stdout);
#endif

    int n, op;
    ll x;
    cin >> n;

    while (n--) {
        cin >> op >> x;
        switch (op) {
        case 1:
            insert(x);
            break;
        case 2:
            erase(x);
            break;
        case 3:
            cout << get_rank(x) << '\n';
            break;
        case 4:
            cout << find_by_rank(x) << '\n';
            break;
        case 5:
            cout << prev(x)->key << '\n';
            break;
        case 6:
            cout << next(x)->key << '\n';
            break;
        }
    }

#ifdef LOCAL
    cout << "\nTime Used:\n" << clock() - c1 << " ms" << endl;
#endif

    return 0;
}
```
