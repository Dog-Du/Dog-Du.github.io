---
date: '2023-11-15T20:10:02'
tags:
- 数据结构与算法
- AVL
- 平衡树
categories:
- 算法与数据结构
title: AVL树全代码实现与验证
slug: algo-avl-tree-full-impl
summary: 按定义、旋转、插入删除三个层次整理 AVL 树手写过程，并通过洛谷 P3369 与 P1177 的代码记录验证实现正确性。
commentTerm: "AVL树全代码实现与验证 | DogDu's blog"
featureimage: "images/covers/cover_02_sky.webp"
---
<!--more-->
建议先了解 AVL 树的定义、平衡因子与四种基本旋转，再来看这篇实现记录。

这篇文章的重点不是重新讲一遍教科书定义，而是把“手写 AVL”这件事真正落到代码上：如何设计节点信息、如何维护高度、插入和删除时在什么位置检查失衡，以及如何把旋转逻辑写得稳定可复用。

我最初尝试过沿用教材里的非递归写法，在节点中维护 bf 和 parent，但实现过程非常拧巴：删除后的回溯修正尤其容易写乱。后来改成递归版本，并统一用 height 推导平衡状态，代码结构才变得清晰很多。

先把一个核心结论说清楚：AVL 树的失衡修正只有四种基本类型——LL、LR、RR、RL。只要数据结构和回溯规则设计正确，插入和删除都不会凭空冒出“第五种旋转”。后文的代码就是围绕这个原则展开的。


## 定义

```cpp
struct AVLNode{
    AVLNode*left,*right;//没有parent，所以需要递归，因为递归，所以简单
    int key,value;
    int height;//因为bf可以由height算出，所以存height
};
```
这里我用AVL树做桶排，用洛谷的P1177排序做简单的验证，所以有一个value表示key的个数。而且不要把bf直接存进AVL树节点中，不然会变的不幸！！！（也可以自己尝尝试试）
```cpp
class AVLTree{
private:
    AVLNode* tree;//所有空指针全部指向tree，方便更新高度和计算平衡因子
    int Size;

public:
    AVLTree(){
        tree=new AVLNode;
        tree->height=0;//设置成0
        tree->left=tree->right=tree;//全部都指向头结点
        Size=0;
    }

```

在类的定义中，为了方便后面的代码，我设置了一个头结点，把高度设置成0，把全部的空节点都指向头结点，不会触摸到空指针，也方便处理。

给出几个辅助函数：

```cpp
    void newnode(AVLNode*&p,int& val)
    {
        p=new AVLNode;
        p->key=val;
        p->value=1;
        p->left=p->right=tree;//指向tree
        p->height=1;
        ++Size;
    }

    void update(AVLNode*&p)//更新高度
    {
        if(p==tree)return;//如果是tree，不更新高度，一直为0
        p->height=max(p->left->height,p->right->height)+1;
    }

    int factor(AVLNode*&p)//获得bf
    {
        if(p==tree)return 0;
        return p->left->height-p->right->height;//返回因子
    }
```

注意factor和update一定要特判是否是头结点，因为实际上在删除函数的递归平衡中会出现头结点（我已经试过删之后会出现什么了。）

## 旋转

看左右旋转：

```cpp
    void lrotate(AVLNode*&T)//左旋
    {
        AVLNode*r=T->right;
        T->right=r->left;
        r->left=T;
        T=r;

        update(T->left),update(T);
    }

    void rrotate(AVLNode*&T)//右旋
    {
        AVLNode*l=T->left;
        T->left=l->right;
        l->right=T;
        T=l;

        update(T->right),update(T);
    }
```

一定要注意把T当做引用型参数。因为在平衡之后下一步需要进一步循环的时候就改变对象了。

非常重要的check函数帮忙平衡：

```cpp
    void check(AVLNode*&T)//check
    {
        int bf=factor(T);//获得因子

        if(bf>1)
        {
            int lf=factor(T->left);

            if(lf>0)rrotate(T);
            else lrotate(T->left),rrotate(T);
        }
        else if(bf<-1)
        {
            int rf=factor(T->right);

            if(rf<0)lrotate(T);
            else rrotate(T->right),lrotate(T);
        }
        else if(T!=tree)update(T);//如果平衡，并且非空，更新高度
    }
```

注意如果bf>1或者bf<-1时，需要平衡，之后 if(lf>0)显然右旋即可，但是为什么要写else呢？明明根据 LRLR , LLR 来讲，只剩下 lf==-1 的情况了啊，lf在bf>1的时候不可能为0啊，按照旋转的四个分类的话。为什么呢？

实际上，lf==0的情况是会发生的，确实当bf==2的时候，lf只会==1或者-1，但这仅限于插入的时候，如果带上删除的话，比如：当前左边高度为2且左节点bf为0，右边高度为1，删除右节点，这个时候就出现了bf==2而lf==0的情况。那这怎么办呢？不是说只有四种情况吗？

我帮你们试过了，这种情况下，LLR旋转或者LRLR旋转都是可以完成平衡的，达到的是相同的效果，可以自己画图试一下。既然如此，为什么不选择单旋呢？额，我试了一下这两个，发现OJ不知道为什么是LRLR的双旋反而快2ms，诡异。

其实上面的就是所有的难点了。

## 功能函数

来看insert函数：

```cpp
    AVLnode*search(int x)
    {
        AVLnode*ans;
        _search(tree->left,x,ans);
        return ans;
    }
    void _search(AVLnode*&now,int &key,AVLnode*&ans)
    {
        if(now==tree)
        {
            ans=nullptr;
            return;
        }
        else if(key>now->key)_search(now->right,key,ans);
        else if(key<now->key)_search(now->left,key,ans);
        else
        {
            ans=now;
            return;
        }

    }

     bool insert(int x)
    {
        bool flag;
        ins(tree->left,x,flag);
        return flag;
    }
    void ins(AVLnode*&now,int& key,bool &flag)
    {
        if(now==tree)
        {
            newnode(now,key);
            flag=1;
        }
        else if(key>now->key)ins(now->right,key,flag);
        else if(key<now->key)ins(now->left,key,flag);
        else
        {
            flag=0;
            ++now->value;
            return;
        }

        if(flag)
            check(now);
    }
```

search函数没啥好说的，很简单。

insert函数对public，ins函数是private，注意指针传递一定是引用型的，通过设置了一个引用型的flag判断是否进行了insert，如果没有insert，就直接不再平衡，常数的优化罢了。最后函数进行检查是否平衡，不平衡就通过check旋转。

```cpp
    bool erase(int x)
    {
        bool flag;
        del(tree->left,x,flag);
        return flag;
    }
        void del(AVLnode*&now,int&key,bool&flag)
    {
        if(now==tree)
        {
            flag=0;
            return;
        }
        else if(key>now->key)del(now->right,key,flag);
        else if(key<now->key)del(now->left,key,flag);
        else
        {
            AVLnode*temp=now,*l=now->left,*r=now->right;

            if(l==tree)now=r;
            else if(r==tree)now=l;
            else
            {
                now=find(l,l);//把这个节点剖下来

                if(now!=l)//如果不是直接为左边的
                    now->left=l;

                now->right=r;
            }

            --Size;
            flag=1;
            delete temp;
        }

        if(flag)
            check(now);
        return;
    }

    AVLnode* find(AVLnode*&now,AVLnode*fa)
    {
        AVLnode*res;

        if(now->right==tree)
        {
            res=now;
            fa->right=now->left;
        }
        else
        {
            res=find(now->right,now);
            check(now);
        }

        return res;
    }
```

删除策略：找直接前驱（数据结构-严蔚敏），然后指针替代，这个节点更方便于删除。最后delete被查找节点。find函数做的就是得到直接前驱的节点，最后还是递归检查就好了。

## 完整代码和AC记录

最后看完整代码（对于P1177，因为没有写迭代器，只能以这种方式验证了....有时间一定写一个迭代器，前一段时间刚学二叉排序树迭代器怎么写，一定要找时间搓一个。）：

```cpp
#include <iostream>
#include <cmath>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;

struct AVLnode{
    AVLnode*left,*right;
    int height;
    int key,value;
};

class AVLTree{
private:
    int Size=0;
    AVLnode*root;
public:
    AVLTree(){
        root=new AVLnode;
        Size=0;
        root->left=nullptr;
        root->right=nullptr;
        root->height=0;
    }
    bool insert(int x)
    {
        bool flag;
        ins(root->left,x,flag);
        return flag;
    }
    bool erase(int x)
    {
        bool flag;
        del(root->left,x,flag);
        return flag;
    }
    AVLnode*search(int x)
    {
        AVLnode*ans;
        _search(root->left,x,ans);
        return ans;
    }
private:
    void del(AVLnode*&now,int&key,bool&flag)
    {
        if(now==root||now==nullptr)
        {
            flag=0;
            return;
        }
        else if(key>now->key)del(now->right,key,flag);
        else if(key<now->key)del(now->left,key,flag);
        else
        {
            AVLnode*temp=now,*l=now->left,*r=now->right;

            if(l==root)now=r;
            else if(r==root)now=l;
            else
            {
                now=find(l,l);//把这个节点剖下来

                if(now!=l)//如果不是直接为左边的
                    now->left=l;

                now->right=r;
            }

            --Size;
            flag=1;
            delete temp;
        }

        if(flag)
            check(now);
        return;
    }

    AVLnode* find(AVLnode*&now,AVLnode*fa)
    {
        AVLnode*res;

        if(now->right==root)
        {
            res=now;
            fa->right=now->left;
        }
        else
        {
            res=find(now->right,now);
            check(now);
        }

        return res;
    }

    void _search(AVLnode*&now,int &key,AVLnode*&ans)
    {
        if(now==root||now==nullptr)
        {
            ans=nullptr;
            return;
        }
        else if(key>now->key)_search(now->right,key,ans);
        else if(key<now->key)_search(now->left,key,ans);
        else
        {
            ans=now;
            return;
        }

    }

    void ins(AVLnode*&now,int& key,bool &flag)
    {
        if(now==root||now==nullptr)
        {
            newnode(now,key);
            flag=1;
        }
        else if(key>now->key)ins(now->right,key,flag);
        else if(key<now->key)ins(now->left,key,flag);
        else
        {
            flag=0;
            ++now->value;
            return;
        }

        if(flag)
            check(now);
    }

    void check(AVLnode*&T)
    {
        int bf=factor(T);

        if(bf>1)
        {
            int lf=factor(T->left);
            if(lf>0)Rrotate(T);
            else Lrotate(T->left),Rrotate(T);

        }
        else if(bf<-1)
        {
            int rf=factor(T->right);
            if(rf<0)Lrotate(T);
            else Rrotate(T->right),Lrotate(T);
        }
        else if(T!=root)update(T);
    }

    int factor(AVLnode*&T)
    {
        if(T==root)return 0;
        return T->left->height-T->right->height;
    }
    
    void Rrotate(AVLnode*&T)
    {
        AVLnode*L=T->left;
        T->left=L->right;
        L->right=T;
        T=L;
        update(T->right),update(T);
    }
    void Lrotate(AVLnode*&T)
    {
        AVLnode*R=T->right;
        T->right=R->left;
        R->left=T;
        T=R;
        update(T->left),update(T);
    }
    void update(AVLnode*&T)
    {
        if(T==root)return;
        T->height=max(T->left->height,T->right->height)+1;
    }
    void newnode(AVLnode*&T,int &key)
    {
        T=new AVLnode;
        T->left=T->right=root;
        T->height=1;
        T->key=key;
        T->value=1;
        ++Size;
    }
};
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

    int n;
    cin>>n;
    int a[n+1];
    AVLTree it;

    for(int i=1;i<=n;++i)
    {
        cin>>a[i];
        it.insert(a[i]);
    }

    sort(a+1,a+1+n);
    int tot=unique(a+1,a+1+n)-a-1;

    for(int i=1;i<=tot;++i)
    {
        int t=it.search(a[i])->value;
        while(t--)cout<<a[i]<<' ';
        it.erase(a[i]);
    }

    cout<<endl;
    system("pause");
    return 0;
}

```
![]
(/img/CSDN/algo-avl-tree-full-impl/86809b085806610a958bece8466c6b83.webp)
```cpp
#include <iostream>

using namespace std;

//删去了value,允许重复插入，方便处理get_val函数

struct AVLnode{
    AVLnode*left,*right;
    int height,Size;
    int key;
};

class AVLTree{
private:
    int Size=0;
    AVLnode*root;
public:
    AVLTree(){
        root=new AVLnode;
        Size=0;
        root->left=nullptr;
        root->right=nullptr;
        root->height=0;
        root->Size=0;
    }

    bool insert(int x)
    {
        bool flag;
        ins(root->left,x,flag);
        return flag;
    }
    bool erase(int x)
    {
        bool flag;
        del(root->left,x,flag);
        return flag;
    }
    AVLnode*search(int x)
    {
        AVLnode*ans;
        _search(root->left,x,ans);
        return ans;
    }

    int get_rank(int x)
    {
        AVLnode*now=root->left;
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
        AVLnode*now=root->left;

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
        AVLnode*p=root->left;
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
        AVLnode*p=root->left;
        int next;

        while(p!=root&&p!=nullptr)
        {
            if(p->key>x)next=p->key,p=p->left;
            else p=p->right;
        }

        return next;
    }

private:

    void del(AVLnode*&now,int&key,bool&flag)
    {
        if(now==root||now==nullptr)
        {
            flag=0;
            return;
        }
        else if(key>now->key)del(now->right,key,flag);
        else if(key<now->key)del(now->left,key,flag);
        else
        {
            AVLnode*temp=now,*l=now->left,*r=now->right;

            if(l==root)now=r;
            else if(r==root)now=l;
            else
            {
                now=find(l,l);//把这个节点剖下来

                if(now!=l)//如果不是直接为左边的
                    now->left=l;

                now->right=r;
            }

            --Size;
            flag=1;
            delete temp;
        }

        if(flag)
            check(now);
        return;
    }

    AVLnode* find(AVLnode*&now,AVLnode*fa)
    {
        AVLnode*res;

        if(now->right==root)
        {
            res=now;
            fa->right=now->left;
        }
        else
        {
            res=find(now->right,now);
            check(now);
        }

        return res;
    }

    void _search(AVLnode*&now,int &key,AVLnode*&ans)
    {
        if(now==root||now==nullptr)
        {
            ans=nullptr;
            return;
        }
        else if(key>now->key)_search(now->right,key,ans);
        else if(key<now->key)_search(now->left,key,ans);
        else
        {
            ans=now;
            return;
        }

    }

    void ins(AVLnode*&now,int& key,bool &flag)
    {
        if(now==root||now==nullptr)
        {
            newnode(now,key);
            flag=1;
        }
        else if(key>now->key)ins(now->right,key,flag);
        else ins(now->left,key,flag);

        if(flag)
            check(now);
    }

    void check(AVLnode*&T)
    {
        int bf=factor(T);

        if(bf>1)
        {
            int lf=factor(T->left);
            if(lf>0)Rrotate(T);
            else Lrotate(T->left),Rrotate(T);

        }
        else if(bf<-1)
        {
            int rf=factor(T->right);
            if(rf<0)Lrotate(T);
            else Rrotate(T->right),Lrotate(T);
        }
        else if(T!=root)update(T);
    }

    int factor(AVLnode*&T)
    {
        if(T==root)return 0;
        return T->left->height-T->right->height;
    }
    
    void Rrotate(AVLnode*&T)
    {
        AVLnode*L=T->left;
        T->left=L->right;
        L->right=T;
        T=L;
        update(T->right),update(T);
    }
    void Lrotate(AVLnode*&T)
    {
        AVLnode*R=T->right;
        T->right=R->left;
        R->left=T;
        T=R;
        update(T->left),update(T);
    }
    void update(AVLnode*&T)
    {
        if(T==root)return;
        T->height=max(T->left->height,T->right->height)+1;
        T->Size=T->left->Size+T->right->Size+1;
    }
    void newnode(AVLnode*&T,int &key)
    {
        T=new AVLnode;
        T->left=T->right=root;
        T->height=1;
        T->key=key;
        ++Size;
    }
};
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);

    int n;
    cin>>n;
    AVLTree it;

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
            int t=it.get_rank(x)-1;
            cout<<it.get_val(t)<<'\n';
        }
        else if(op==6)
        {
            int t=it.get_rank(x+1);
            cout<<it.get_val(t)<<'\n';
        }
    }

    cout<<endl;
    system("pause");
    return 0;
}
```

![](/img/CSDN/algo-avl-tree-full-impl/44dd84a66c78848e9443a2031ea20ac2.webp)

随便给大伙看一下我之前痛苦的代码，连一个insert也没有实现的版本（还有一个版本被我弄丢了。）

```cpp
#include <iostream>
#include <cmath>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>

#define ll long long

using namespace std;

typedef struct AVLNode
{
    AVLNode *l = nullptr, *r = nullptr, *p = nullptr;
    int data, bf = 0,value=0;
} *AVLTree;

class myAVLTree
{
private:
    AVLTree tree;
    int Size;

    void Lrotate(AVLTree &T)
    {
        AVLTree R = T->r;

        T->r = R->l;
        R->l = T;

        if (T->p->l == T)
            T->p->l = R;
        else
            T->p->r = R;

        R->p = T->p;
        T->p = R;

        if (T->r != nullptr)
            T->r->p = T;

        T->bf = R->bf = 0;
    }

    void Rrotate(AVLTree &T)
    {
        AVLTree L = T->l;

        T->l = L->r;
        L->r = T;

        if (T->p->l == T)
            T->p->l = L;
        else
            T->p->r = L;

        L->p = T->p;
        T->p = L;

        if (T->l != nullptr)
            T->l->p = T;

        T->bf = L->bf = 0;
    }

    void LLR(AVLTree &T)
    {
        Rrotate(T);
    }

    void LRLR(AVLTree &T)
    {
        AVLTree L = T->l;
        int bf = L->r->bf;

        Lrotate(T->l);
        Rrotate(T);

        if (bf == 1)
            T->bf = -1;
        else if (bf == -1)
            L->bf = 1;
    }

    void RRL(AVLTree &T)
    {
        Lrotate(T);
    }

    void RLRL(AVLTree &T)
    {
        AVLTree R = T->r;
        int bf = R->l->bf;

        Rrotate(T->r);
        Lrotate(T);

        if (bf == 1)
            R->bf = -1;
        else if (bf == -1)
            T->bf = 1;
    }

    void rebalance(AVLTree p, int k)
    {
        AVLTree f = p->p;

        while (f != tree)
        {
            if (f->l == p)
                f->bf += k;
            else
                f->bf -= k;

            if (f->bf == 0)
                break;
            else if (f->bf == 1 || f->bf == -1)
                p = f, f = f->p;
            else
            {
                if (f->bf == 2)
                {
                    if (p->bf == 1)
                        LLR(f);
                    else
                        LRLR(f);
                }
                else
                {
                    if (p->bf == -1)
                        RRL(f);
                    else
                        RLRL(f);
                }

                break;
            }
        }
    }

    int GetDepth(AVLTree root)
    {
        if (root == nullptr)
            return 0;
        return max(GetDepth(root->l), GetDepth(root->r)) + 1;
    }

    bool check(AVLTree root)
    {
        if (root == nullptr)
            return true;
        ;
        int l = GetDepth(root->l);
        int r = GetDepth(root->r);

        if (abs(l - r) > 1 || l - r != root->bf)
            return false;

        return check(root->l) && check(root->r);
    }

public:
    myAVLTree()
    {
        tree = new AVLNode;
        Size = 0;
    }

    bool insert(int x)
    {
        if (tree->l == nullptr)
        {
            tree->l = new AVLNode;
            tree->l->p = tree;
            tree->l->data = x;
            tree->l->value=1;
            ++Size;
            return true;
        }

        AVLNode *p = tree->l, *f = tree;

        while (p != nullptr)
        {
            if (p->data == x)
            {
                p->value++;
                return false;
            }

            f = p;

            if (x > p->data)
                p = p->r;
            else
                p = p->l;
        }

        p=new AVLNode;
        p->p=f;
        p->data=x;
        p->value=1;
        
        if(x>f->data)f->r=p;
        else f->l=p;

        while(p!=tree)
        {
            if(f->l==p)++f->bf;
            else --f->bf;

            if(f->bf==0)break;
            else if(f->bf==-1||f->bf==1)
                p=f,f=f->p;
            else
            {    
                if(f->bf==2)
                {
                    if(p->bf==1)LLR(f);
                    else LRLR(f);
                }
                else
                {
                    if(p->bf==-1)RRL(f);
                    else RLRL(f);
                }

                break;
            }
        }

        return true;
    }

    AVLTree search(int x)
    {
        AVLTree p = tree->l;

        while (p != nullptr)
        {
            if (p->data == x)
                return p;

            if (x > p->data)
                p = p->r;
            else
                p = p->l;
        }

        return nullptr;
    }

    bool erase(int x)
    {
        AVLTree p = tree->l;

        while (p != nullptr)
        {
            if (p->data == x)
                break;

            if (x > p->data)
                p = p->r;
            else
                p = p->l;
        }

        if (p == nullptr)
            return false;

        if (p->l == nullptr)
        {
            AVLTree f = p->p;

            if (f->l == p)
            {
                --f->bf;
                f->l = p->r;
            }
            else
            {
                ++f->bf;
                f->r = p->r;
            }

            if (p->r != nullptr)
                p->r->p = f;

            delete p;

            rebalance(f, -1);
        }
        else
        {
            AVLTree l = p->l;

            while (l->r != nullptr)
                l = l->r;

            p->data = move(l->data);

            if (l->p == p)
            {
                --p->bf;
                p->l = nullptr;
                free(l);
                rebalance(p, -1);
            }
            else
            {
                ++l->p->bf;
                l->p->r = nullptr;
                free(l);
                rebalance(p, -1);
            }
        }

        return true;
    }

    int getdepth()
    {
        return GetDepth(tree->l);
    }

    bool isAVLTree()
    {
        return check(tree->l);
    }
};
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    myAVLTree it;

    int n;

    cin >> n;

    while (n--)
    {
        int op, x;
        cin >> op;

        if (op == 1)
        {
            cin >> x;
            AVLTree p = it.search(x);

            if (p == nullptr)
                cout << "empty" << endl;
            else
                cout << p->data << endl;
        }
        else if (op == 2)
        {
            cin >> x;

            cout << it.insert(x) << endl;
        }
        else if (op == 3)
        {
            cin >> x;

            cout << it.erase(x) << endl;
        }
    }

    cout << endl;
    system("pause");
    return 0;
}

```

![](/img/CSDN/algo-avl-tree-full-impl/601010b0ec5a48faa6117e536b41403e.webp)

透过这几个名字或许也能感受到我当时的想法。
