---
date: '2024-01-22T10:44:53.000Z'
tags:
- 数据结构与算法
categories:
- 算法与数据结构
title: 树上启发式合并（dsu on tree）
slug: algo-dsu-on-tree
summary: 以颜色平衡树题为例讲解 dsu on tree 的保重儿子、删轻留重与统计维护思路。
commentTerm: "树上启发式合并（dsu on tree） | DogDu's blog"
lastmod: '2025-04-04T11:32:10.709Z'
---

参考视频：[【AgOHの算法胡扯】树上启发式合并（dsu on tree）](https://www.bilibili.com/video/BV1JE411d7tD/?spm_id_from=333.999.0.0)


<!--more-->

`dsu on tree` 的核心思想其实很朴素：始终保留重儿子的统计结果，把轻儿子的贡献往它上面合并。这样每个节点被“暴力加入统计结构”的次数是受控的，整体复杂度可以压到 `O(n log n)`。

题目：[P9233 [蓝桥杯 2023 省 A] 颜色平衡树 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P9233)

理解模板之后，这道题真正麻烦的地方只剩一个：如何 `O(1)` 判断一棵子树是不是“颜色平衡树”。

我们设计三个数组： **color[i],cnt[i],cntcnt[i],color[i]表示节点i的颜色，cnt[i]表示颜色i出现的次数，cntcnt[i]表示 颜色出现次数 i 的出现的次数。**

对于以x为根的子树，如果 设 **c=cnt[color[x]] , f=cntcnt[c] 如果 c*fsize[x] 那么他就是颜色平衡树。**原因：假设存在一个颜色出现的次数不等于c，那么必然 c*f < size[x]，这与c*fsize[x]矛盾，所以假设不成立。

当然，我们看到颜色个数这种问题，自然而然会想起来**莫队的模板题（**[P1903 [国家集训队] 数颜色 / 维护队列 - 洛谷 | 计算机科学教育新生态 (luogu.com.cn)](https://www.luogu.com.cn/problem/P1903)**）**，这题也可以用莫队解决，只是需要先dfs一遍进行线性化而已，还是上面一样的判断方法，判断的时间复杂度为O(1)，整体时间复杂度为O(n*根号n),可以通过本题。唯一需要注意一点的是，为了操作方便可能还要多存一个dfx表示时间戳x的原来的节点编号。

法一：启发式合并AC代码：

```cpp
#include <iostream>
#include <cmath>
#include <ctime>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;

const int maxn=200000+10;
vector<int> graph[maxn];

int n,root=1;
int color[maxn],son[maxn],t[2][maxn],siz[maxn];
//t[0][x]表示颜色x出现了几次，t[1][x]表示次数x出现的次数。

int ans=0,flag;//MINN,MAXN维护的是颜色出现的次数

void add(int x)
{
    t[1][t[0][x]]--;
    t[0][x]++;
    t[1][t[0][x]]++;
}

void del(int x)
{
    t[1][t[0][x]]--;
    t[0][x]--;
    t[1][t[0][x]]++;
}

void add_k(int now)
{
    add(color[now]);

    for(const auto&it : graph[now])
        if(it!=flag)add_k(it);
}


void del_k(int now)
{
    del(color[now]);

    for(const auto&it : graph[now])
        if(it!=flag)del_k(it);
}

void dfs(int now)
{
    int maxsize=-1;
    siz[now]=1;

    for(const auto&it : graph[now])
    {
        dfs(it);
        siz[now]+=siz[it];
        if(siz[it]>maxsize)
        {
            maxsize=siz[it];
            son[now]=it;
        }
    }
}


void dfs(int now,bool keep)
{
    for(const auto& it : graph[now])
        if(it != son[now])
            dfs(it,false);
    
    if(son[now]!=0)
    {
        dfs(son[now],true);
        flag=son[now];
    }

    add_k(now);
    flag=0;
    
    //这句话的含义是：color[now]出现的频次*这个频次的频次 ==  siz[now]，
    //则说明颜色出现最多的次数和颜色出现最小的次数相等。
    //原因是：如果存在一个颜色，其出现的频次不等于color[now]出现的频次，
    //那么，这个算式是小于size[now]的。
    if(t[0][color[now]]*t[1][t[0][color[now]]]==siz[now])
        ++ans;

    if(keep==false)
    {
        del_k(now);
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

#ifdef LOCAL
    clock_t c1 = clock();
    freopen("in.in","r",stdin);
    freopen("out.out","w",stdout);
#endif

//-------------------------------------------------

    cin>>n;

    for(int i=1,f;i<=n;++i)
    {
        cin>>color[i]>>f;
        graph[f].push_back(i);
    }

    dfs(root);
    dfs(root,true);

    cout << ans << endl;
//-------------------------------------------------

#ifdef LOCAL
    cout << "Time Used:\n" << clock() - c1 << " ms" << endl;
#endif

    //system("pause");
    return 0;
}
```
法二：莫队AC代码：
```cpp
#include <iostream>
#include <cmath>
#include <ctime>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;
 
const int maxn=200000+10;
vector<int> graph[maxn];

int n,root=1,tim=0,block;
int color[maxn],siz[maxn],dfn[maxn],dfx[maxn];
int cnt[maxn],cntcnt[maxn];

struct QUERY{
    int l,r;
    bool operator<(const QUERY& other)const{
        if(l/block==other.l/block)return r<other.r;
        return l<other.l;
    }
}query[maxn];

void dfs(int now)
{
    siz[now]=1;
    dfn[now]=++tim;
    dfx[tim]=now;

    for(const auto&it : graph[now])
    {
        dfs(it);
        siz[now]+=siz[it];
    }
}

void add(int x,int k)
{
    cntcnt[cnt[x]]--;
    cnt[x]+=k;
    cntcnt[cnt[x]]++;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

#ifdef LOCAL
    clock_t c1 = clock();
    freopen("in.in","r",stdin);
    freopen("out.out","w",stdout);
#endif

//-------------------------------------------------

    cin>>n;

    block=sqrt(n);

    for(int i=1,y;i<=n;++i)
    {
        cin>>color[i]>>y;
        graph[y].push_back(i);
    }

    dfs(root);

    for(int i=1;i<=n;++i)
        query[i]={dfn[i],dfn[i]+siz[i]-1};

    sort(query+1,query+1+n);

    int ans=0,l=1,r=1;
    add(color[dfn[1]],1);

    for(int i=1,c,f;i<=n;++i)
    {
        while(l<query[i].l)add(color[dfx[l++]],-1);
        while(l>query[i].l)add(color[dfx[--l]],1);
        while(r<query[i].r)add(color[dfx[++r]],1);
        while(r>query[i].r)add(color[dfx[r--]],-1);

        c=cnt[color[dfx[query[i].l]]],f=cntcnt[c];

        if(c*f==query[i].r-query[i].l+1)
            ++ans;
    }

    cout<<ans;
//-------------------------------------------------

#ifdef LOCAL
    cout << "\nTime Used: \n" << clock() - c1 << " ms" << endl;
#endif

    //system("pause");
    return 0;
}
```
