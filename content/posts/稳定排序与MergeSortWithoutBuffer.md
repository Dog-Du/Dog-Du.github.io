---
date: '2024-01-14T20:09:54'
tags:
- 数据结构与算法
- 排序
categories:
- 算法与数据结构
title: 稳定排序与MergeSortWithoutBuffer
slug: algo-stable-sort-without-buffer
summary: 围绕稳定排序需求，介绍 MergeSortWithoutBuffer 的核心思想、rotate 技巧以及小 buffer 优化，讨论如何在更低额外空间下完成归并。
commentTerm: "稳定排序与MergeSortWithoutBuffer | DogDu's blog"
featureimage: "images/covers/cover_16_forest.webp"
---
<!--more-->
稳定排序的关键要求，是在比较结果相同的情况下保留元素原有的相对顺序。`std::sort` 很快，但它不是稳定排序；如果又希望保持“基于比较”的通用性，又不愿意接受普通归并排序 `O(n)` 的额外空间，那么就会自然走到 **MergeSortWithoutBuffer** 这条路上。

这类算法的核心观察很直接：额外空间主要消耗在 merge 阶段，所以要优化空间，就要改造 merge 本身。本文介绍的做法，是通过 `rotate` 把两段有序区间重新拼接，再递归处理左右子问题，从而在更低额外空间下完成稳定归并。

举个例子：对于 `1 3 5 7 9 11 | 2 4 6 8 10`，可以先在较长的一段里取中点 `5`，再到后半段找到第一个不小于它的位置 `6`，然后把中间区间做一次 `rotate`，序列会变成 `1 3 2 4 5 7 9 11 6 8 10`。此时问题被拆成两个更小的归并子问题，继续递归即可。

为了降低递归归并的常数，文中还额外讨论了两个常见优化：小规模区间直接切换到插入排序，以及引入一个很小的 buffer 来加速短区间合并。代码部分为了练习迭代器风格接口，直接把指针当作 `RandomAccessIterator` 使用。

### rotate函数

```cpp
void reverse(int *first,int *last)//翻转
{
    --last;
    while(last-first>0)
        swap(*(last--),*(first++));
}

void rotate(int *first,int *middle,int *last)//以middle为中心，翻转位置
{
    reverse(first,last);

    int *new_middle=first+(last-middle);

    reverse(first,new_middle);
    reverse(new_middle,last);
}
```

### MergeSortWithoutBuffer函数

其中：if(len1+len2<BufferN) 是小于合并临界值时，改用buffer合并，当然也可以改为直接使用插入排序。

```cpp
//感觉上这个函数的时间复杂度可能在 O(n+m) 到 O((n+m)log(n+m)) 之间，常数比较原本的mergesort大
void MergeWithoutBuffer(int *first,int *middle,int *last)//不需buffer的归并,核心代码.
{
    int len1=middle-first,len2=last-middle;

    if(len1==0||len2==0)return;

    if(len1+len2==2)
    {
        if(*middle<*first)
            swap(*middle,*first);
        return;
    }

    if(len1+len2<BufferN)
    {
        MergeWithBuffer(first,middle,last,buffer);
        return;
    }

    int len11=0,len22=0;
    int *first_cut=first,*second_cut=middle;

    if(len1>len2)
    {
        len11=len1/2;
        first_cut+=len11;
        second_cut=lower_bound(middle,last,*first_cut);
        len22=second_cut-middle;
    }
    else
    {
      len22=len2/2;
      second_cut+=len22;
      first_cut=upper_bound(first,middle,*second_cut);
      len11=first_cut-first;
    }

    rotate(first_cut,middle,second_cut);
    //print(first,last);
    int *new_middle=first_cut+(second_cut-middle);
    
    //分成了两部分.
    MergeWithoutBuffer(first,first_cut,new_middle);
    MergeWithoutBuffer(new_middle,second_cut,last);
}
```

### 完整代码

使用少量Buffer：

```cpp
#include <iostream>
#include <cmath>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;

const int maxn=1e5+10,InsertMin=16,BufferN=65;

int a[maxn],buffer[BufferN];
int n;

void print(int *first,int *last)
{
    while(first!=last)
        cout<<*(first++)<<' ';
    cout<<endl;
}

void InsertSort(int *first,int *last)//插入排序
{
    for(int *i=first,*j;i!=last;++i)
        for(j=i;j!=first&&*j<*(j-1);--j)
            swap(*j,*(j-1));
    
}

void reverse(int *first,int *last)//翻转
{
    --last;
    while(last-first>0)
        swap(*(last--),*(first++));
}

void rotate(int *first,int *middle,int *last)//以middle为中心，翻转位置
{
    reverse(first,last);

    int *new_middle=first+(last-middle);

    reverse(first,new_middle);
    reverse(new_middle,last);
}

void MergeWithBuffer(int *first,int *middle,int *last,int buffer[])
{
    int *p1=first,*p2=middle,*p=buffer;

    while(p1!=middle&&p2!=last)
    {
        if(*p1<=*p2)
            *(p++)=std::move(*(p1++));
        else
            *(p++)=std::move(*(p2++));
    }

    while(p1!=middle)
        *(p++)=std::move(*(p1++));
    
    while(p2!=last)
        *(p++)=std::move(*(p2++));
    
    p=buffer;

    while(first!=last)
        *(first++)=std::move(*(p++));
}

//感觉上这个函数的时间复杂度可能在 O(n+m) 到 O((n+m)log(n+m)) 之间，常数比较原本的mergesort大
void MergeWithoutBuffer(int *first,int *middle,int *last)//不需buffer的归并,核心代码.
{
    int len1=middle-first,len2=last-middle;

    if(len1==0||len2==0)return;

    if(len1+len2==2)
    {
        if(*middle<*first)
            swap(*middle,*first);
        return;
    }

    if(len1+len2<BufferN)
    {
        MergeWithBuffer(first,middle,last,buffer);
        return;
    }

    int len11=0,len22=0;
    int *first_cut=first,*second_cut=middle;

    if(len1>len2)
    {
        len11=len1/2;
        first_cut+=len11;
        second_cut=lower_bound(middle,last,*first_cut);
        len22=second_cut-middle;
    }
    else
    {
      len22=len2/2;
      second_cut+=len22;
      first_cut=upper_bound(first,middle,*second_cut);
      len11=first_cut-first;
    }

    rotate(first_cut,middle,second_cut);
    //print(first,last);
    int *new_middle=first_cut+(second_cut-middle);
    
    //分成了两部分.
    MergeWithoutBuffer(first,first_cut,new_middle);
    MergeWithoutBuffer(new_middle,second_cut,last);
}

void MergeSortWithoutBuffer(int *first,int *last)//归并排序
{
    if(last-first<InsertMin)
    {
        InsertSort(first,last);
        return;
    }

    int *midlle=first+(last-first)/2;
    MergeSortWithoutBuffer(first,midlle);
    MergeSortWithoutBuffer(midlle,last);

    MergeWithoutBuffer(first,midlle,last);
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

    cin>>n;

    for(int i=1;i<=n;++i)    
        cin>>a[i];
    
    MergeSortWithoutBuffer(a+1,a+1+n);

    print(a+1,a+n+1);

    cout<<endl;
    system("pause");
    return 0;
}
```

![](/img/CSDN/algo-stable-sort-without-buffer/96b85a373827918e3d35fbbb866db210.webp)

改为插入排序：

```cpp
#include <iostream>
#include <cmath>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;

const int maxn=1e5+10,InsertMin=16,BufferN=33;

int a[maxn],buffer[BufferN];
int n;

void print(int *first,int *last)
{
    while(first!=last)
        cout<<*(first++)<<' ';
    cout<<endl;
}

void InsertSort(int *first,int *last)//插入排序
{
    for(int *i=first,*j;i!=last;++i)
        for(j=i;j!=first&&*j<*(j-1);--j)
            swap(*j,*(j-1));
    
}

void reverse(int *first,int *last)//翻转
{
    --last;
    while(last-first>0)
        swap(*(last--),*(first++));
}

void rotate(int *first,int *middle,int *last)//以middle为中心，翻转位置
{
    reverse(first,last);

    int *new_middle=first+(last-middle);

    reverse(first,new_middle);
    reverse(new_middle,last);
}

void MergeWithBuffer(int *first,int *middle,int *last,int buffer[])
{
    int *p1=first,*p2=middle,*p=buffer;

    while(p1!=middle&&p2!=last)
    {
        if(*p1<=*p2)
            *(p++)=std::move(*(p1++));
        else
            *(p++)=std::move(*(p2++));
    }

    while(p1!=middle)
        *(p++)=std::move(*(p1++));
    
    while(p2!=last)
        *(p++)=std::move(*(p2++));
    
    p=buffer;

    while(first!=last)
        *(first++)=std::move(*(p++));
}

//感觉上这个函数的时间复杂度可能在 O(n+m) 到 O((n+m)log(n+m)) 之间，常数比较原本的mergesort大
void MergeWithoutBuffer(int *first,int *middle,int *last)//不需buffer的归并,核心代码.
{
    int len1=middle-first,len2=last-middle;

    if(len1==0||len2==0)return;

    if(len1+len2==2)
    {
        if(*middle<*first)
            swap(*middle,*first);
        return;
    }

    if(len1+len2<BufferN)
    {
        InsertSort(first,last);
        //MergeWithBuffer(first,middle,last,buffer);
        return;
    }

    int len11=0,len22=0;
    int *first_cut=first,*second_cut=middle;

    if(len1>len2)
    {
        len11=len1/2;
        first_cut+=len11;
        second_cut=lower_bound(middle,last,*first_cut);
        len22=second_cut-middle;
    }
    else
    {
      len22=len2/2;
      second_cut+=len22;
      first_cut=upper_bound(first,middle,*second_cut);
      len11=first_cut-first;
    }

    rotate(first_cut,middle,second_cut);
    //print(first,last);
    int *new_middle=first_cut+(second_cut-middle);
    
    //分成了两部分.
    MergeWithoutBuffer(first,first_cut,new_middle);
    MergeWithoutBuffer(new_middle,second_cut,last);
}

void MergeSortWithoutBuffer(int *first,int *last)//归并排序
{
    if(last-first<InsertMin)
    {
        InsertSort(first,last);
        return;
    }

    int *midlle=first+(last-first)/2;
    MergeSortWithoutBuffer(first,midlle);
    MergeSortWithoutBuffer(midlle,last);

    MergeWithoutBuffer(first,midlle,last);
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

    cin>>n;

    for(int i=1;i<=n;++i)    
        cin>>a[i];
    
    MergeSortWithoutBuffer(a+1,a+1+n);

    print(a+1,a+n+1);

    cout<<endl;
    system("pause");
    return 0;
}
```

![](/img/CSDN/algo-stable-sort-without-buffer/e46c1cd77e4ad786f7ab6a5a7a281339.webp)
