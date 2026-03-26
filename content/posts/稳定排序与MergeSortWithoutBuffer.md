---
date: '2024-01-14T20:09:54'
tags:
- 数据结构与算法
- 排序
title: 稳定排序与MergeSortWithoutBuffer
slug: algo-stable-sort-without-buffer
summary: 围绕稳定排序需求，介绍 MergeSortWithoutBuffer 的核心思想、rotate 技巧以及小 buffer 优化，讨论如何在更低额外空间下完成归并。
commentTerm: "稳定排序与MergeSortWithoutBuffer | DogDu's blog"
---

<!--more-->
排序有很多种，std::sort采用了quicksort+heapsort+insertsort的组合，但是这个排序是不稳定的，不能保证相同元素的原始的相对位置，即使insertsort是稳定的。回顾几大排序，其中，insertsort,selectsort,bucketsort,radixsort,mergesort是有序的，而其他的几个，都是不稳定的，但是我们的排序算法，不可能采用基数排序，因为这样只能对数字进行排序，较难对字符串进行排序，尤其是字符串很长的时候，我们需要选择比较的方法进行排序，这样灵活度也很高，可以重载一个小于号就进行排序，那么radix排序和bucketsort已经淘汰，剩下的三个算法只有mergesort是比较快的，可他致命的缺点是，它的空间复杂度为O(n)，这太大了，有些无法接受。那么怎么办呢？mergesortwithourbuffer就是答案。然后结合插入排序。

我们知道需要额外空间的时候仅仅是在merge的过程中，那么只要在这个过程中减少空间的使用即可。

对于： 1 3 5 7 9 11 2 4 6 8 10 first指向1，last指向10，middle指向2（middle表示first的end()和last的begin()）,我们先对长者下手，对前面任选一个数，比如 5 ，把这个位置记作first_cut，之后查找5在后者第一个大于等于5的位置，即 6 ，把这个位置记作 second_cut。之后我们对中间从first_cut到second_cut部分进行rotate，变成： 1 3 2 4 5 7 9 11 6 8 10 ，之后重新分割，新middle=first_cut+(second_cut-middle)，然后分别对 [1 3 2 4] [5 7 9 11 6 8 10]这两部分在递归调用merge算法，如果两个部分长度之和小于等于2，那么就可以不再继续合并。

考虑一定程度上的优化：因为不断递归，所以时间复杂度会高，一个合并（假设长度m，时间复杂度可能会达到 mlogm，递归栈的空间复杂度可能会达到 logm）：一个方法是，提供一个很少空间的buffer，比如buffer的长度为 logn ，这能极大提高效率（毕竟对数函数在 x 较小时增长最快）。另一个方法是：在归并长度比较短时直接使用插入排序，但是这样不好说时间复杂度会不会降低。

代码因为练习迭代器的原因，所以写成了指针传参的方法，把指针当做了RandomAccessIterator使用。

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
