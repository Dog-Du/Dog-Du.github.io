---
date: '2023-10-23T11:18:53.000Z'
tags:
- 数据结构与算法
title: LeetCode接雨水i 两种思想四种解法
slug: algo-trapping-rain
commentTerm: "LeetCode接雨水i 两种思想四种解法 | DogDu's blog"
lastmod: '2025-04-04T11:32:10.709Z'
---

法一：以一个柱子为视角，一块地方有雨水等价于后面有一个的柱子的高度大于等于本身的高度。找到它，然后细细调试即可。用的是单调栈的思想。


<!--more-->

```cpp
class Solution { public:      int trap(vector<int>& height) {         int ans=0,n=height.size();         vector<int> st,rear(n,-1),front(n,-1),add(n);          add[0]=height[0];          for(int i=1;i<n;++i)             add[i]=add[i-1]+height[i];          for(int i=0;i<n;++i)         {             while(!st.empty()&&height[st.back()]<=height[i])             {                 rear[st.back()]=i;                 st.pop_back();             }             st.push_back(i);         }          st.clear();          for(int i=n-1;i>=0;--i)         {             while(!st.empty()&&height[st.back()]<height[i])             {                 front[st.back()]=i;                 st.pop_back();             }             st.push_back(i);         }          for(int i=0;i<n;++i)         {             if(rear[i]==-1)break;              ans+=(rear[i]-i-1)*height[i];              ans-=(add[rear[i]-1]-add[i]);              i=rear[i]-1;         }          for(int i=n-1;i>=0;--i)         {             if(front[i]==-1)break;              ans+=(i-front[i]-1)*height[i];              ans-=(add[i-1]-add[front[i]]);              i=front[i]+1;         }          return ans;     } };
```


![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

法二：从一个柱子的贡献度考虑，一个柱子贡献的积水量等于min(左边最大的柱子,右边最大的柱子)-本身高度。

从这个方法出发。

第一：双指针，从本身出发，然后更新左边最大值，从右边出发，更新右边最大值。时间复杂度：O(n^2) 略过不提。

第二：ST表或者线段树：既然是RMQ问题，那么可以考虑ST表或者线段树，实现O(logn)查询。这里选择的是线段树。时间复杂度：O(nlogn)

```cpp
class Solution { public:      static const int maxn=2e4+10;     int t[maxn<<2];      void build(int x,int l,int r,vector<int> & vec)     {         if(l==r)         {             t[x]=vec[l];             return;         }          int mid=l+r>>1;          build(x<<1,l,mid,vec);         build(x<<1|1,mid+1,r,vec);          t[x]=max(t[x<<1],t[x<<1|1]);     }      int query(int x,int l,int r,int L,int R)     {         if(l>=L&&r<=R)return t[x];          int mid=l+r>>1,ans=-1;          if(mid>=L)ans=max(ans,query(x<<1,l,mid,L,R));         if(mid<R)ans=max(ans,query(x<<1|1,mid+1,r,L,R));          return ans;     }      int trap(vector<int>& height) {         int n=height.size(),ans=0;         build(1,0,n-1,height);          for(int i=1,t;i<n-1;++i)         {             t=min(query(1,0,n-1,0,i-1),query(1,0,n-1,i+1,n-1))-height[i];             if(t>0)ans+=t;         }          return ans;     } };
```


![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

第三：我们发现这里的查询都是从端点出发的查询，很具有规律性，那么我们可以考虑存储对于每一个柱子来说左边的最大值和右边的最大值。即动态规划。时间复杂度：O(n)

```cpp
class Solution { public:     int trap(vector<int>& height) {         int n=height.size(),ans=0;         vector<int> lmax(n,-1),rmax(n,-1);          lmax.front()=height.front();         rmax.back()=height.back();          for(int i=1;i<n;++i)                 lmax[i]=max(lmax[i-1],height[i]);          for(int i=n-2;i>=0;--i)             rmax[i]=max(rmax[i+1],height[i]);                  for(int i=1,t;i<n-1;++i)         {             t=min(lmax[i-1],rmax[i+1])-height[i];              if(t>0)ans+=t;         }          return ans;     } };
```


![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)