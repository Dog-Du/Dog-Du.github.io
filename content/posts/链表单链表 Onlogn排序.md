---
date: '2023-10-19T11:40:45.000Z'
tags:
- 数据结构与算法
categories:
- 算法与数据结构
title: 链表/单链表 O(nlogn)排序
slug: algo-list-sort
summary: 从 STL `list::sort()` 出发讨论为什么链表适合归并排序，并给出单链表 `O(n log n)` 排序实现。
commentTerm: "链表/单链表 O(nlogn)排序 | DogDu's blog"
commentDiscussionNumber: 39
lastmod: '2025-04-04T11:32:10.720Z'
---

写单链表的时候我突然想到一个问题：数组有 `sort`，那链表自己的 `O(n log n)` 排序范式到底是什么？

顺着这个问题往下查，很自然就会走到 `std::list::sort()`，也就能看到链表为什么天然适合归并排序。


<!--more-->

第一个想法：用quicksort，带头尾指针的双链表确实可以，但是效率不优，因为在选择pivot的时候只能选择最左端，很容易退化成冒泡，更别说单链表了压根就不能用了。

第二个想法：嗯嗯嗯....这种问题肯定前人已经解决过了。所以去看看stl库吧。

用C++ list库，然后写一行 .sort() 再看定义。

```cpp
template<typename _Tp, typename _Alloc>
    void
    list<_Tp, _Alloc>::
    sort()
    {
      // Do nothing if the list has length 0 or 1.
      if (this->_M_impl._M_node._M_next != &this->_M_impl._M_node
	  && this->_M_impl._M_node._M_next->_M_next != &this->_M_impl._M_node)
      {
        list __carry;
        list __tmp[64];
        list * __fill = __tmp;
        list * __counter;
	__try
	  {
	    do
	      {
		__carry.splice(__carry.begin(), *this, begin());
 		for(__counter = __tmp;
		    __counter != __fill && !__counter->empty();
		    ++__counter)
		  {
		    __counter->merge(__carry);
		    __carry.swap(*__counter);
		  }
		__carry.swap(*__counter);
		if (__counter == __fill)
		  ++__fill;
	      }
	    while ( !empty() ); 
    	for (__counter = __tmp + 1; __counter != __fill; ++__counter)
	      __counter->merge(*(__counter - 1));
	    swap( *(__fill - 1) );
	  }
	__catch(...)
	  {
	    this->splice(this->end(), __carry);
	    for (int __i = 0; __i < sizeof(__tmp)/sizeof(__tmp[0]); ++__i)
	      this->splice(this->end(), __tmp[__i]);
	    __throw_exception_again;
	  }
       }
     }
```

这里确实有点看不太懂。

关于stl这里的源码解析，推荐：[C++ SGI STL 的 list::sort() 分析\_list.sort函数 c++-CSDN博客](https://blog.csdn.net/Ryansior/article/details/126848942)

解析的很清晰，用的是非递归的mergesort，尤其是运用splice函数和counter数组，充分发挥了链表的优势，如果数组用这种方法反而会变慢。

我这里只是用单链表进行了实践，双向链表也是一样的。

首先定义：

```cpp
typedef struct LIST {
    int data;
    LIST* next;
} *Linklist;
```
几个辅助函数：
```cpp
void init_list(Linklist& list) {
    Linklist p = new LIST;
    list = p;
    list->next = NULL;
}

// 尾插法初始化
void init(Linklist& list) {
    int n, x;
    Linklist p = list;

    cin >> n;
    while (n--) {
        cin >> x;

        Linklist temp = new LIST;
        temp->next = NULL;
        temp->data = x;

        p->next = temp;
        p = p->next;
    }
}

void show(Linklist& list) {
    Linklist p = list;

    while (p->next != NULL) {
        cout << p->next->data << ' ';
        p = p->next;
    }

    cout << endl;
    return;
}
```

然后是stl库中几个辅助函数的时间：

empty():

```cpp
bool empty(Linklist& p) {
    return p == NULL || p->next == NULL;
}
```
splice
():
因为只需要用到第一个节点，所以我这里只要了首节点。
```cpp
void splice_front(Linklist& head, Linklist& p) {
    Linklist temp = head->next;
    head->next = temp->next;
    temp->next = p->next;
    p->next = temp;
}
```
merge
():
```cpp
void list_merge(Linklist& list, Linklist& p) {
    Linklist it = list;
    Linklist p1 = list->next;
    Linklist p2 = p->next;

    while (p1 && p2) {
        if (p1->data < p2->data) {
            it->next = p1;
            p1 = p1->next;
        } else {
            it->next = p2;
            p2 = p2->next;
        }

        it = it->next;
    }

    if (!p1) it->next = p2;
    else it->next = p1;

    p->next = NULL;
}
```
最后是sort部分的函数：
```
void list_sort(Linklist& list) {
    if (list->next == NULL || list->next->next == NULL) return;

    Linklist carry = new LIST;
    Linklist counter[64];
    for (int i = 0; i < 64; ++i) {
        counter[i] = new LIST;
        counter[i]->next = NULL;
    }
    carry->next = NULL;

    int fill = 0;
    while (!empty(list)) {
        splice_front(list, carry);
        int i = 0;

        while (i < fill && !empty(counter[i])) {
            list_merge(counter[i], carry);
            swap(carry, counter[i++]);
        }

        swap(carry, counter[i]);
        if (i == fill) ++fill;
    }

    for (int i = 1; i < fill; ++i)
        list_merge(counter[i], counter[i - 1]);

    list->next = counter[fill - 1]->next;

    for (int i = 0; i < 64; ++i)
        delete counter[i];

    delete carry;
    return;
}
```
全部代码：
```cpp
#include <iostream>
#include <list>

#define ll long long

using namespace std;

typedef struct LIST {
    int data;
    LIST* next;
} *Linklist;

void init_list(Linklist& list) {
    Linklist p = new LIST;
    list = p;
    list->next = NULL;
}

// 尾插法初始化
void init(Linklist& list) {
    int n, x;
    Linklist p = list;

    cin >> n;
    while (n--) {
        cin >> x;

        Linklist temp = new LIST;
        temp->next = NULL;
        temp->data = x;

        p->next = temp;
        p = p->next;
    }
}

void show(Linklist& list) {
    Linklist p = list;

    while (p->next != NULL) {
        cout << p->next->data << ' ';
        p = p->next;
    }

    cout << endl;
    return;
}

bool empty(Linklist& p) {
    return p == NULL || p->next == NULL;
}

void splice_front(Linklist& head, Linklist& p) {
    Linklist temp = head->next;
    head->next = temp->next;
    temp->next = p->next;
    p->next = temp;
}

void list_merge(Linklist& list, Linklist& p) {
    Linklist it = list;
    Linklist p1 = list->next;
    Linklist p2 = p->next;

    while (p1 && p2) {
        if (p1->data < p2->data) {
            it->next = p1;
            p1 = p1->next;
        } else {
            it->next = p2;
            p2 = p2->next;
        }

        it = it->next;
    }

    if (!p1) it->next = p2;
    else it->next = p1;

    p->next = NULL;
}

void list_sort(Linklist& list) {
    if (list->next == NULL || list->next->next == NULL) return;

    Linklist carry = new LIST;
    Linklist counter[64];
    for (int i = 0; i < 64; ++i) {
        counter[i] = new LIST;
        counter[i]->next = NULL;
    }
    carry->next = NULL;

    int fill = 0;
    while (!empty(list)) {
        splice_front(list, carry);
        int i = 0;

        while (i < fill && !empty(counter[i])) {
            list_merge(counter[i], carry);
            swap(carry, counter[i++]);
        }

        swap(carry, counter[i]);
        if (i == fill) ++fill;
    }

    for (int i = 1; i < fill; ++i)
        list_merge(counter[i], counter[i - 1]);

    list->next = counter[fill - 1]->next;

    for (int i = 0; i < 64; ++i)
        delete counter[i];

    delete carry;
    return;
}
```

去洛谷试试吧：[P1177 【模板】排序 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P1177)

用时104ms

内存3.67MB

内存逼近O(logn)但是list的空间密度较低，所以内存较大，时间和数组的quicksort逼近了。让我怀疑在数组中 nlogn 的排序方法中mergesort之所以是 n 的空间复杂度，就是因为它实际上是为list设计的。
