---
date: '2024-01-14T08:18:53.000Z'
tags:
- 数据结构与算法
categories:
- 算法与数据结构
title: std::sort的底层实现
slug: algo-std-sort
summary: 从 libstdc++ 源码切入分析 std::sort 的 introsort 策略，理解快排、堆排与插排如何组合工作。
commentTerm: "std::sort的底层实现 | DogDu's blog"
lastmod: '2025-04-04T11:32:10.709Z'
featureimage: "images/covers/cover_35_spring.webp"
---
想真正理解 `std::sort`，最直接的方法就是顺着源码往下看。它并不是单纯的一套快速排序，而是把快排、堆排和插排组合起来，形成一套兼顾平均性能和最坏情况上界的 introsort 策略。

下面先从源码片段切入，再看这三种排序是如何被拼接到一起的。

```cpp
template<typename _RandomAccessIterator, typename _Compare>
    _GLIBCXX20_CONSTEXPR
    inline void
    __partial_sort(_RandomAccessIterator __first,
		   _RandomAccessIterator __middle,
		   _RandomAccessIterator __last,
		   _Compare __comp)
    {
      std::__heap_select(__first, __middle, __last, __comp);
      std::__sort_heap(__first, __middle, __comp);
    }

  /// This is a helper function for the sort routine.
  template<typename _RandomAccessIterator, typename _Size, typename _Compare>
    _GLIBCXX20_CONSTEXPR
    void
    __introsort_loop(_RandomAccessIterator __first,
		     _RandomAccessIterator __last,
		     _Size __depth_limit, _Compare __comp)
    {
      while (__last - __first > int(_S_threshold))
	{
	  if (__depth_limit == 0)
	    {
	      std::__partial_sort(__first, __last, __last, __comp);
	      return;
	    }
	  --__depth_limit;
	  _RandomAccessIterator __cut =
	    std::__unguarded_partition_pivot(__first, __last, __comp);
	  std::__introsort_loop(__cut, __last, __depth_limit, __comp);
	  __last = __cut;
	}
    }

  template<typename _RandomAccessIterator, typename _Compare>
    _GLIBCXX20_CONSTEXPR
    inline void
    __sort(_RandomAccessIterator __first, _RandomAccessIterator __last,
	   _Compare __comp)
    {
      if (__first != __last)
	{
	  std::__introsort_loop(__first, __last,
				std::__lg(__last - __first) * 2,
				__comp);
	  std::__final_insertion_sort(__first, __last, __comp);
	}
    }
```



<!--more-->

通过上面的源码，我们知道了sort实际上使用了三种排序方法：heap\_sort,quick\_sort,insert\_sort。观察快排的循环，会发现快排使用了while循环降低了递归深度，可以进行一次模拟，这个和红黑树中的 M\_erase,M\_copy函数不谋而合（可以看我的红黑树课设。）而且，函数对快排进行了深度的限制，即：\_\_lg(last-first)*2，一旦超过这个深度，那么快排停止，如果剩余元素大于15则使用heap\_sort进行排序，不然，则使用insert\_sort进行排序。
