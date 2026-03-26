---
date: '2023-11-22T21:42:35'
tags:
- 数据结构与算法
- Treap
- 平衡树
categories:
- 算法与数据结构
title: Treap树堆带旋版本实现
slug: algo-treap-rotating
summary: 介绍带旋 Treap 的定义、插入删除策略与旋转维护方式，并用洛谷 P3369 的完整实现说明这类随机平衡树为何写起来足够直接。
commentTerm: "Treap树堆带旋版本实现 | DogDu's blog"
---

<!--more-->
带旋 Treap 的优势，在于它把“维持二叉搜索树有序性”和“维持随机堆性质”拆成了两件足够清楚的事：按 `key` 插入位置，按 `fix` 通过旋转恢复平衡。相比 AVL 树和红黑树，它的规则更少，因此非常适合作为第一棵“能真正手写出来的随机平衡树”。

## 定义：

1.节点定义不仅有key还有一个随机值fix

2.key满足二叉排序树

3.fix满足堆

因为treap用了随机数的机制，所以不容易被卡，能保持比较好的效率。常数比较小，也因为平衡条件简单，可以进行树合并和树分裂。

treap真的实现很简单，AVL，RB，B，splay，treap中实现最简单的应该就是treap，毕竟splay还需要六种旋转（追求一点效率的话）。

定义：

```cpp
struct Treapnode{
    int key,fix,Size;
    Treapnode*left,*right;
};

class Treap{
private:
    Treapnode*root;
    unsigned int Size;
    bool result;

public:
    Treap(){
        root=new Treapnode;
        root->left=root->right=root;//空指针全部指向头结点
        root->fix=-RAND_MAX;//把头结点置为最小值
        root->Size=0;
        srand(114514);//随机化
    }
```

查询函数：

```cpp
    Treapnode*search(int x)
    {
        auto*p=root->left,*q=root;

        while(p!=root)
        {
            if(p->key==x)return p;
            q=p;
            if(p->key>x)p=p->left;
            else p=p->right;
        }

        return nullptr;
    }

```

辅助函数：

```cpp

    void Rrotate(Treapnode*&now)
    {
        Treapnode*left=now->left;
        now->left=left->right;
        left->right=now;
        now=left;
        update(now->right),update(now);
    }

    void Lrotate(Treapnode*&now)
    {
        Treapnode*right=now->right;
        now->right=right->left;
        right->left=now;
        now=right;
        update(now->left),update(now);
    }
    void update(Treapnode*now)
    {
        if(now==root)return;
        now->Size=now->left->Size+now->right->Size+1;
    }

```

## 插入函数：

策略：找到插入位置之后，创建新节点，之后递归检查是否需要通过旋转调整fix值。

```cpp
    bool insert(int x)
    {
        result=false;
        insert(root->left,x);
        return result;
    }

    void insert(Treapnode*&now,int &key)//只有插入时需要旋转
    {
        if(now==root)
        {
            now=new Treapnode;
            now->fix=rand()+RAND_MAX;//避免为负数
            now->left=now->right=root;
            now->key=key;
            now->Size=1;
            result=true;
            return;
        }
        else if(now->key>key)insert(now->left,key);
        else insert(now->right,key);//允许重复插入

        check(now);//检查，并更新Size
    }

    void check(Treapnode*&now)
    {
        if(now->fix<now->left->fix)//左孩子大，右旋
            Rrotate(now);
        else if(now->fix<now->right->fix)//右孩子大，左旋
            Lrotate(now);
        else
            update(now);//不然更新Size，
    }
```

## 删除函数：

根据treap定义可以知道，找到删除位置之后，把如果只有一个孩子替代即可，不然找前驱，替代之，然后直接删除前驱即可。整个删除函数均不需要旋转（我写的版本，实际上如果删除策略为：把待删除节点旋转至叶子，之后直接删除的话，有多次旋转，这样处理的Treap，随机性可能更好。）

```cpp
    bool erase(int x)
    {
        result=false;
        erase(root->left,x);
        return result;
    }
    void SuccessOr(Treapnode*&now,int&key)//寻找继任者，赋值，之后移除
    {
        if(now->right==root)
        {
            Treapnode*temp=now;
            now=now->left;//注意写法，这是引用型参数的意义
            key=move(temp->key);
            delete temp;
            return;
        }

        SuccessOr(now->right,key);

        update(now);//更新Size即可，不需要旋转
    }

    void erase(Treapnode*&now,int &key)//删除函数中，从头至尾根本不需要旋转
    {
        if(now==root)
        {
            result=false;
            return;
        }
        else if(now->key>key)erase(now->left,key);
        else if(now->key<key)erase(now->right,key);
        else
        {
            if(now->left==root)
            {
                Treapnode*temp=now;
                now=now->right;
                delete temp;
                return;
            }
            else if(now->right==root)
            {
                Treapnode*temp=now;
                now=now->left;
                delete temp;
                return;
            }
            else
            {
                SuccessOr(now->left,now->key);
            }
        }

        update(now);
        return;
    }
```

## 全部代码：

```cpp
#include <iostream>
#include <algorithm>
#include <random>

#define ll long long

using namespace std;

//要求key大于左子树，小于右子树，fix大于两者
//思想：key的性质由二叉排序树保证，fix由旋转保证，而由fix引起的旋转保证了树的高度较低水平
//方法：左孩子fix大，右旋，右孩子fix大，左旋。很简单吧，删除的时候直接寻找继任者，根本不需要旋转

struct Treapnode{
    int key,fix,Size;
    Treapnode*left,*right;
};

class Treap{
private:
    Treapnode*root;
    unsigned int Size;
    bool result;

public:
    Treap(){
        root=new Treapnode;
        root->left=root->right=root;//空指针全部指向头结点
        root->fix=-RAND_MAX;//把头结点置为最小值
        root->Size=0;
        srand(114514);//随机化
    }

    bool insert(int x)
    {
        result=false;
        insert(root->left,x);
        return result;
    }

    bool erase(int x)
    {
        result=false;
        erase(root->left,x);
        return result;
    }

    Treapnode*search(int x)
    {
        auto*p=root->left,*q=root;

        while(p!=root)
        {
            if(p->key==x)return p;
            q=p;
            if(p->key>x)p=p->left;
            else p=p->right;
        }

        return nullptr;
    }

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

        return next;
    }

private:

    void update(Treapnode*now)
    {
        if(now==root)return;
        now->Size=now->left->Size+now->right->Size+1;
    }

    void SuccessOr(Treapnode*&now,int&key)//寻找继任者，赋值，之后移除
    {
        if(now->right==root)
        {
            Treapnode*temp=now;
            now=now->left;//注意写法，这是引用型参数的意义
            key=move(temp->key);
            delete temp;
            return;
        }

        SuccessOr(now->right,key);

        update(now);//更新Size即可，不需要旋转
    }

    void erase(Treapnode*&now,int &key)//删除函数中，从头至尾根本不需要旋转
    {
        if(now==root)
        {
            result=false;
            return;
        }
        else if(now->key>key)erase(now->left,key);
        else if(now->key<key)erase(now->right,key);
        else
        {
            if(now->left==root)
            {
                Treapnode*temp=now;
                now=now->right;
                delete temp;
                return;
            }
            else if(now->right==root)
            {
                Treapnode*temp=now;
                now=now->left;
                delete temp;
                return;
            }
            else
            {
                SuccessOr(now->left,now->key);
            }
        }

        update(now);
        return;
    }

    void insert(Treapnode*&now,int &key)//只有插入时需要旋转
    {
        if(now==root)
        {
            now=new Treapnode;
            now->fix=rand()+RAND_MAX;//避免为负数
            now->left=now->right=root;
            now->key=key;
            now->Size=1;
            result=true;
            return;
        }
        else if(now->key>key)insert(now->left,key);
        else insert(now->right,key);//允许重复插入

        check(now);//检查，并更新Size
    }

    void check(Treapnode*&now)
    {
        if(now->fix<now->left->fix)//左孩子大，右旋
            Rrotate(now);
        else if(now->fix<now->right->fix)//右孩子大，左旋
            Lrotate(now);
        else
            update(now);//不然更新Size，
    }

    void Rrotate(Treapnode*&now)
    {
        Treapnode*left=now->left;
        now->left=left->right;
        left->right=now;
        now=left;
        update(now->right),update(now);
    }

    void Lrotate(Treapnode*&now)
    {
        Treapnode*right=now->right;
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

    Treap it;
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
    cout<<endl;
    system("pause");
    return 0;
}

```

## 洛谷P3369AC记录（常数小就是好，没开O2）：

![](/img/CSDN/algo-treap-rotating/8037b38cea28350df0a45dc9f97e9990.webp)
