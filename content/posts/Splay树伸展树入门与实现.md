---
date: '2023-11-22T22:21:30'
tags:
- 数据结构与算法
- Splay
- 平衡树
title: Splay树伸展树入门与实现
slug: algo-splay-tree
summary: 围绕伸展操作的直觉、旋转策略与删除流程，整理 Splay 树的核心实现，并结合洛谷 P3369 给出完整代码与实战记录。
commentTerm: "Splay树伸展树入门与实现 | DogDu's blog"
---

<!--more-->
## 前言

Splay的思想非常简单：把每次访问的节点旋转至根节点。

这主要是基于一个思想：刚刚被访问的节点及其周围节点有更高概率再次被访问。

这种思想很多算法都有应用：比如LRU，B树的一部分思想，磁盘页缓存。

显然在旋转中，如果P为父亲节点，L为左孩子，那么P右旋之后，L就变成了父亲，即L向上走了一位。这就是Splay的思想方法。

为什么叫伸展树呢？因为伸展树不注重深度，变成一条链是非常有可能的事情，花枝招展是它的常态，但是它的均摊时间复杂度仍然是O(logn），而且它在结构体的定义中不需要任何多余信息，比如：RB树中的color，AVL树中的bf或者height，treap中的fix。Splay都没有，而且实现起来比较简单（除了treap之外最简单的，而且如果不追求效率，甚至更简单。）同时因为没有任何硬性的平衡要求，Splay的拓展性很好，可以支持split和merge，算是一种放之四海而皆准的平衡树。

Splay在[Data Structure Visualization (USFCA)](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html)也有，可以欣赏一下它的花枝招展（离谱形状）。

唯一需要注意的一点就是：每次询问，包括get_val,get_next等，之后都必须把节点旋转至根，不然效率极低。Splay树真的可以做到把经常询问的节点保持在极低的高度，查询速度极快，但是要是出题人卡的话，感觉很容易卡。

## 定义：

```cpp

struct Splaynode{
    int key,Size;
    Splaynode*left,*right;
};

class SplayTree{
private:
    unsigned int Size;
    bool result,isGrandson;//isGrandson表示point所指向的节点是否在当前节点的孙子上
    Splaynode*root,*point;//point指向需要旋转到根节点的节点。
public:
    SplayTree(){
        Size=0;
        result=false;
        root=new Splaynode;
        root->Size=0;
        root->left=root->right=root;
    }
```

## 查询函数及辅助函数：

```cpp
    Splaynode*search(int x)
    {
        point=nullptr;
        isGrandson=false;
        search(root->left,x);
        return point;
    }
    void search(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            point=nullptr;
            isGrandson=false;
            return;
        }
        else if(now->key>key)search(now->left,key);
        else if(now->key<key)search(now->right,key);
        else
        {
            point=now;
            return;
        }

        Splay(now);//调整函数，之后说
    }
    void Rrotate(Splaynode*&now)
    {
        Splaynode*left=now->left;
        now->left=left->right;
        left->right=now;
        now=left;
        update(now->right),update(now);
    }
    void Lrotate(Splaynode*&now)
    {
        Splaynode*right=now->right;
        now->right=right->left;
        right->left=now;
        now=right;
        update(now->left),update(now);
    }
```

## 插入：

策略：找到位置，然后插入，之后把该节点伸展至根。

```cpp
    bool insert(int x)//别人说会深度减半，我实在是没看出来怎么减半了（那是因为这个时候没有处理三点一线）
    {
        point=nullptr;
        result=false;
        isGrandson=false;
        insert(root->left,x);
        return result;
    }

    void insert(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            now=new Splaynode;
            now->left=now->right=root;
            now->key=key;
            now->Size=1;
            point=now;
            isGrandson=false;
            return;
        }
        else if(now->key>key)insert(now->left,key);
        else insert(now->right,key);

        Splay(now);
    }
```

## Splay函数：

策略：

如果当前是祖父节点，则分LL，LR，RL，RR，其中LL，RR为三点一线，需要特殊处理。

特殊处理：LL型是先把祖父右旋，再把新的父节点右旋，这样在节点为4以上的时候高度会减半。

RR同理。LR，RL不需要特殊处理，只需要先旋转父亲，再旋转祖父即可。

如果不是祖父节点，判断当前是否是根节点，如果是根节点，则左旋或者右旋即可，如果不是根节点，isGrandson更新为true。

（实际上如果不处理三点一线的话，根本不需要isGrandson变量，在左边就右旋，在右边就左旋，一共只需要五行即可。但这样的话高度会比较高，而且这不是花枝招展，而且直愣愣的一条链。）

```cpp

    void Splay(Splaynode*&now)//处理三点一线的
    {
        if(point==nullptr)return;

        if(isGrandson)
        {
            if(now->right->right==point)//三点一线，先父亲
            {
                Lrotate(now);
                Lrotate(now);
            }
            else if(now->right->left==point)//不是三点一线，所以还是先儿子
            {
                Rrotate(now->right);
                Lrotate(now);
            }
            else if(now->left->left==point)//三点一线，先父亲
            {
                Rrotate(now);
                Rrotate(now);
            }
            else if(now->left->right==point)//不是三点一线，所以还是先儿子
            {
                Lrotate(now->left);
                Rrotate(now);
            }
            isGrandson=false;
        }
        else
        {
            if(now==root->left)//如果是根，需要特殊处理，这就相当于 n%2 当然是有零有一，这里就是在处理一
            {
                if(now->left==point)
                    Rrotate(now);
                else if(now->right==point)
                    Lrotate(now);
                isGrandson=false;
            }
            else
            {
                isGrandson=true;
                update(now);
            }
        }
    }

    void Splay(Splaynode*&now)//不处理三点一线的
    {
        if(point==nullptr)return;
        else if(point==now->left)
            Rrotate(now);
        else if(point==now->right)
            Lrotate(now);
    }

```

## 删除函数：

有两种方法：

1.先找前驱，值替换并且删除节点之后，把该节点旋转到根。

2.先把该节点旋转到根，再找前驱，值替换并且删除节点。

我选择了第二种，原因是我看的文章是第二种策略，事后我才想起来第一种策略实际上更优。

```cpp
public:
    bool erase(int x)
    {
        point=nullptr;
        result=false;
        isGrandson=false;
        erase(root->left,x);

        if(result)
        {
            Splaynode*temp=root->left;
            if(temp->left==root)
            {
                root->left=temp->right;
                delete temp;
            }
            else if(temp->right==root)
            {
                root->left=temp->left;
                delete temp;
            }
            else
            {
                SuccessOr(temp->left,temp->key);
            }
            update(root->left);
        }

        return result;
    }
private:
    void SuccessOr(Splaynode*&now,int &key)
    {
        if(now->right==root)
        {
            Splaynode*temp=now;
            key=now->key;
            now=now->left;
            delete temp;
            return;
        }
        SuccessOr(now->right,key);
        update(now);
    }

    void erase(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            result=false;
            point=nullptr;
            isGrandson=false;
            return;
        }
        else if(now->key>key)erase(now->left,key);
        else if(now->key<key)erase(now->right,key);
        else
        {
            point=now;
            result=true;
            return;
        }

        Splay(now);
    }
```

## 完整代码：

```cpp
#include <iostream>
#include <algorithm>

#define ll long long

using namespace std;

//伸展树，很简单啊
//但是因为三点共线的时候没有进行特殊处理，所以在遇见特殊情况下效率不佳，过不了P1177 第三个点，因为高度太高爆栈了，处理了之后可以优雅的过
//但是处理了之后还是过不了 P3369 最后一个点被卡了，下载下来发现，好家伙，这就是在针对splay吧
//相当于对于一个序列 1-n 先问 1 然后伸展，伸展之后就开始 问 n/2 这就导致效率极低，被卡成了 N^2 几乎
//不过这种情况，只需要在每次的四个询问的时候进行伸展即可，之前的没有进行伸展，所以被卡掉了。

struct Splaynode{
    int key,Size;
    Splaynode*left,*right;
};

class SplayTree{
private:
    unsigned int Size;
    bool result,isGrandson;//isGrandson表示point所指向的节点是否在当前节点的孙子上
    Splaynode*root,*point;//point指向需要旋转到根节点的节点。

public:

    int get_rank(int x)
    {
        auto*now=root->left;
        int rank=1;

        while(now!=root&&now!=nullptr)
        {
            if(x<=now->key)
                now=now->left;
            else
            {
                rank+=now->left->Size+1;
                now=now->right;
            }
        }

        get_val(rank);
        return rank;
    }

    int get_val(int rank)
    {
        auto*now=root->left;

        while(now!=root&&now!=nullptr)
        {
            if(now->left->Size+1==rank)
                break;
            else if(now->left->Size>=rank)
                now=now->left;
            else
            {
                rank-=now->left->Size+1;
                now=now->right;
            }
        }

        search(now->key);
        return now->key;
    }
    int get_pre(int x)
    {
        auto*p=root->left;
        int pre;

        while(p!=root&&p!=nullptr)
        {
            if(p->key<x)pre=p->key,p=p->right;
            else p=p->left;
        }
        search(pre);
        return pre;
    }

    int get_next(int x)
    {
        auto*p=root->left;
        int next;

        while(p!=root&&p!=nullptr)
        {
            if(p->key>x)next=p->key,p=p->left;
            else p=p->right;
        }

        search(next);
        return next;
    }

    SplayTree(){
        Size=0;
        result=false;
        root=new Splaynode;
        root->Size=0;
        root->left=root->right=root;
    }

    bool insert(int x)//别人说会深度减半，我实在是没看出来怎么减半了
    {
        point=nullptr;
        result=false;
        isGrandson=false;
        insert(root->left,x);
        return result;
    }

    bool erase(int x)
    {
        point=nullptr;
        result=false;
        isGrandson=false;
        erase(root->left,x);

        if(result)
        {
            Splaynode*temp=root->left;
            if(temp->left==root)
            {
                root->left=temp->right;
                delete temp;
            }
            else if(temp->right==root)
            {
                root->left=temp->left;
                delete temp;
            }
            else
            {
                SuccessOr(temp->left,temp->key);
            }
            update(root->left);
        }

        return result;
    }

    Splaynode*search(int x)
    {
        point=nullptr;
        isGrandson=false;
        search(root->left,x);
        return point;
    }

private: 

    void update(Splaynode*now)
    {
        if(now==root)return;
        now->Size=now->left->Size+now->right->Size+1;
    }

    void SuccessOr(Splaynode*&now,int &key)
    {
        if(now->right==root)
        {
            Splaynode*temp=now;
            key=now->key;
            now=now->left;
            delete temp;
            return;
        }
        SuccessOr(now->right,key);
        update(now);
    }

    void erase(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            result=false;
            point=nullptr;
            isGrandson=false;
            return;
        }
        else if(now->key>key)erase(now->left,key);
        else if(now->key<key)erase(now->right,key);
        else
        {
            point=now;
            result=true;
            return;
        }

        Splay(now);
    }

    void insert(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            now=new Splaynode;
            now->left=now->right=root;
            now->key=key;
            now->Size=1;
            point=now;
            isGrandson=false;
            return;
        }
        else if(now->key>key)insert(now->left,key);
        else insert(now->right,key);

        Splay(now);
    }

    void search(Splaynode*&now,int &key)
    {
        if(now==root)
        {
            point=nullptr;
            isGrandson=false;
            return;
        }
        else if(now->key>key)search(now->left,key);
        else if(now->key<key)search(now->right,key);
        else
        {
            point=now;
            return;
        }

        Splay(now);
    }

    void Splay(Splaynode*&now)
    {
        if(point==nullptr)return;

        if(isGrandson)
        {
            if(now->right->right==point)//三点一线，先父亲
            {
                Lrotate(now);
                Lrotate(now);
            }
            else if(now->right->left==point)//不是三点一线，所以还是先儿子
            {
                Rrotate(now->right);
                Lrotate(now);
            }
            else if(now->left->left==point)//三点一线，先父亲
            {
                Rrotate(now);
                Rrotate(now);
            }
            else if(now->left->right==point)//不是三点一线，所以还是先儿子
            {
                Lrotate(now->left);
                Rrotate(now);
            }
            isGrandson=false;
        }
        else
        {
            if(now==root->left)//如果是根，需要特殊处理，这就相当于 n%2 当然是有零有一，这里就是在处理一
            {
                if(now->left==point)
                    Rrotate(now);
                else if(now->right==point)
                    Lrotate(now);
                isGrandson=false;
            }
            else
            {
                isGrandson=true;
                update(now);
            }
        }
    }

    void Rrotate(Splaynode*&now)
    {
        Splaynode*left=now->left;
        now->left=left->right;
        left->right=now;
        now=left;
        update(now->right),update(now);
    }
    void Lrotate(Splaynode*&now)
    {
        Splaynode*right=now->right;
        now->right=right->left;
        right->left=now;
        now=right;
        update(now->left),update(now);
    }
};

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

    SplayTree it;
    int n;
    cin>>n;

    while(n--)
    {
        int op,x;
        cin>>op>>x;

        if(op==1)
        {
            it.insert(x);
        }
        else if(op==2)
        {
            it.erase(x);
        }
        else if(op==3)
        {
            cout<<it.get_rank(x)<<'\n';
        }
        else if(op==4)
        {
            cout<<it.get_val(x)<<'\n';
        }
        else if(op==5)
        {
            cout<<it.get_pre(x)<<'\n';
        }
        else if(op==6)
        {
            cout<<it.get_next(x)<<'\n';
        }
        else if(op==7)
        {
            cout<<it.search(x)->key<<endl;
        }
        
    } 

    // int a[n+1];

    // for(int i=1;i<=n;++i)
    // {
    //     cin>>a[i];
    //     it.insert(a[i]);
    // }

    // sort(a+1,a+1+n);

    // for(int i=1;i<=n;++i)
    // {
    //     auto res=it.search(a[i]);

    //     if(res!=nullptr)
    //         cout<<res->key<<' ';
        
    //     it.erase(a[i]);
    // }
    cout<<endl;
    system("pause");
    return 0;
}

```

## 洛谷P3369AC记录：

![](/img/CSDN/algo-splay-tree/cf395fc475d4de7089c5cbc977da523a.webp)
