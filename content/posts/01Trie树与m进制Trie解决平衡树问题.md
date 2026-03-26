---
date: '2023-11-29T22:03:08'
tags:
- 数据结构与算法
- Trie
- 平衡树
categories:
- 算法与数据结构
title: 01Trie树与m进制Trie解决平衡树问题
slug: algo-trie-balanced-tree
summary: 从 01Trie 与 m 进制 Trie 两种建模方式出发，讨论它们如何模拟平衡树题目的有序集合操作，并给出基于洛谷 P3369 与 P1177 的实现与验证。
commentTerm: "01Trie树与m进制Trie解决平衡树问题 | DogDu's blog"
---

<!--more-->
## 用作普通平衡树

Trie 通常被看作字符串或位运算问题里的工具，但如果把视角切到“维护一个有序集合”，会发现 01Trie 和普通平衡树其实有不少相通之处。本文就是从这个角度出发，讨论它如何去模拟插入、删除、排名、前驱后继这类典型平衡树操作。

在洛谷 P3369 这类题目里，我们未必需要给节点额外挂 `value`；但如果把它扩展成 `<int, type>` 形式的映射结构，01Trie 的行为会很像一棵只在叶子节点保存值的 B+ 树：内部节点负责导航，真正的数据则落在最底层叶子上。

之所以会有这种相似性，是因为这里把树高统一处理成固定的 `maxlog`。无论插入还是查询，每个数都会沿着同样深度的位路径往下走，直到叶子位置才真正对应到具体值；而这些叶子从左到右又天然保持有序，因此可以进一步支持顺序统计类操作。

## 从最低位开始呢？

当然我们也可以不统一扩大位数，而是把数字从最后一位开始进行插入操作（比如：6 = 110 我们的处理顺序为 0 -> 1 -> 1 即和上面的写法反过来了），这样它就和没有B+树类似之处了，而这个时候我们可以说实现了路径在一定程度上的缩小。

那么这个时候我们怎么判断一个点是否是终端节点呢（即可能拥有value值的节点）？这样判断就好了：now->size != now->child[0]->size + now->child[1]->size 。 如果不等于，说明有一些数字在这里“停下了”，也就是位数结束了，这个和前缀树是一样的处理。

很有趣吧，虽然这样就没办法写这道题目了，因为当前节点的左孩子不一定比当前节点小，当前节点的右孩子不一定比当前节点大，这里我会给出这种思路实现的map的代码实现。

## m进制Trie的一点小思考：

01Trie只是Trie的一种特殊情况而已，可以用于普通平衡树，那么可以进一步想到，之所以是01是因为计算机二进制下运算比较方便，我们当然可以用十进制，八进制等等写出来 0~9Trie，0~7Trie，这个时候树高会进一步降低（比如使用十进制，树高可能可以控制在8或者9），如果从最高位开始那么这个时候就更像B+树了（节点上存的key值变得多了），又因为叶子结点还是升序的，所以可以使用二分查找或者顺序查找提高效率。

这些思考就是m进制从最高位开始的Trie的基本思路，后面会给出代码实现，因为思想一致，不再过多赘述。

## 01Trie普通平衡树P3369代码实现与AC记录。

```cpp
#include <iostream>
#include <cmath>
using namespace std;

//01前缀树解决平衡树问题

const int maxn = 1e7 + 10, maxlog = ceil(log2(maxn));

//01Tire实现了类似平衡树的性质，左子树的都小于本身，右子树都大于本身。
//因为负数第一位为1，这和平衡树性质不符合，所以要把所有负数加一个极大值，转化成正数。

class Tire01
{
private:
    struct node//child[0]是0，child[1]是1。前缀
    {
        node *child[2];
        int size;
        node(node *p)
        {
            child[0] = child[1] = p;
            size = 0;
        }
    } *root;

    void clear(node*now)
    {
        if(now==root)return;
        clear(now->child[0]);
        clear(now->child[1]);
        delete now;
    }

public:

    void clear()
    {
        clear(root->child[0]);
        clear(root->child[1]);
        root->child[0]=root->child[1]=root;
    }

    ~Tire01()
    {
        clear();
        delete root;
    }

    Tire01()//设置头结点root，让所有空节点都指向root
    {
        root = new node(nullptr);
        root->child[0] = root->child[1] = root;
    }

    void insert(int x)
    {
        node *p = root;

        for (int i = maxlog, t; i >= 0; --i)//从最高位开始，这和数的比较从最高位开始是一致的
        {
            t = (x >> i) & 1;//这一位上的数字是0还是1

            if (p->child[t] == root)
                p->child[t] = new node(root);//如空，则新建

            p = p->child[t];
            ++p->size;
        }
    }

    void erase(int x)//删除则更简单，直接沿路删除即可，因为不需要释放空间，
    {
        node *p = root;

        for (int i = maxlog, t; i >= 0; --i)
        {
            t = (x >> i) & 1;
            p = p->child[t];
            --p->size;
        }
    }

    int get_val(int k)//根据排名获得值
    {
        node *p = root;
        int ans = 0;

        for (int i = maxlog; i >= 0; --i)
        {
            if (p->child[0]->size >= k)//如果左边大，就走左边
                p = p->child[0];
            else
            {
                ans |= (1 << i);//如果左边小，说明这一位为1,
                k -= p->child[0]->size;//减去左边的个数（对应在平衡树就是减去小于的个数）
                p = p->child[1];
            }

            if (p == root)
                break;
        }

        return ans - maxn;//记得减去maxn，处理了负数
    }

    int get_rank(int x)//根据值获得排名，注意，获得的是小于本身的个数！
    {
        int ans = 0;
        node *p = root;

        for (int i = maxlog; i >= 0; --i)
        {
            if ((x >> i) & 1)//为1，加上左子树的个数
            {
                ans += p->child[0]->size;
                p = p->child[1];
            }
            else
            {
                p = p->child[0];
            }

            if (p == root)
                break;
        }

        return ans;
    }

    int get_pre(int x)
    {
        return get_val(get_rank(x));//
    }

    int get_next(int x)
    {
        return get_val(get_rank(x + 1) + 1);//get_rank(x+1)获得了小于等于本身的个数，再加1，就是第一个大于本身的数。
    }
};

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    Tire01 it;
    int n;
    cin >> n;

    while (n--)
    {
        int op, x;
        cin >> op >> x;

        x += maxn;

        if (op == 1)
        {
            it.insert(x);
        }
        else if (op == 2)
        {
            it.erase(x);
        }
        else if (op == 3)
        {
            cout << it.get_rank(x) + 1 << '\n';//注意一定要加1，因为获得的是小于本身的个数
        }
        else if (op == 4)
        {
            cout << it.get_val(x - maxn) << '\n';
        }
        else if (op == 5)
        {
            cout << it.get_pre(x) << '\n';
        }
        else if (op == 6)
        {
            cout << it.get_next(x) << '\n';
        }
    }

    cout << endl;
    system("pause");
    return 0;
}
```

![](/img/CSDN/algo-trie-balanced-tree/4d2d045cb0d927a8c4f7c62fa25ae7f6.webp)

## 01Trie基于从最低位开始思路的桶排实现与AC记录（看起来效果一般）。

```cpp
#include <iostream>
#include <algorithm>
#include <cmath>
using namespace std;

//01前缀树实现map功能，从低位到高位进行操作

const int maxlog = 32;

class Tire01
{
private:
    struct node//child[0]是0，child[1]是1。前缀
    {
        node *child[2];
        int size,value;
        node(node *p)
        {
            child[0] = child[1] = p;
            size = 0;
        }
    } *root;

    void clear(node*now)
    {
        if(now==root)return;
        clear(now->child[0]);
        clear(now->child[1]);
        delete now;
    }

public:

    void clear()
    {
        clear(root->child[0]);
        clear(root->child[1]);
        root->child[0]=root->child[1]=root;
    }

    ~Tire01()
    {
        clear();
        delete root;
    }

    Tire01()//设置头结点root，让所有空节点都指向root
    {
        root = new node(nullptr);
        root->child[0] = root->child[1] = root;
    }

    void insert(int x,int value)
    {
        node *p = root;
        int t;

        while(x)//从最低位开始，到最高位结束
        {
            t = x & 1;//这一位上的数字是0还是1
            x>>=1;

            if (p->child[t] == root)
                p->child[t] = new node(root);//如空，则新建

            p = p->child[t];
            ++p->size;
        }

        p->value=value;

        //如果之前这个地方已经插入过了，那么应该清除这次的size记录
        if(p->size==p->child[0]->size+p->child[1]->size)
        {
            for (int i = 0; i <= maxlog && x; ++i)
            {
                p = p->child[x>>i&1];
                --p->size;
            }
        }

    }

    void erase(int x)//删除则更简单，直接沿路删除即可，因为不需要释放空间，
    {
        node *p = root;

        for (int i = 0; (x>>i) ; ++i)
        {
            p = p->child[x>>i&1];
            --p->size;

            if(p==root)break;
        }

        //如果不存在这个值，那么删除应该失败，所以把size加回来。
        if(p->size==p->child[0]->size+p->child[1]->size||p==root)
        {
            for (int i = 0; i <= maxlog && x; ++i)
            {
                p = p->child[x>>i&1];
                ++p->size;
            }
        }
    }

    node* search(int x)
    {
        node *p = root;

        while(x)
        {
            p = p->child[x&1];
            x>>=1;

            if(p==root)break;
        }

        //如果查询的非存value的节点，那么返回nullptr。
        if(p->size==p->child[0]->size+p->child[1]->size||p==root)return nullptr;
        return p;
    }
};

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    Tire01 it;
    int n;
    cin >> n;

    int a[n+1];
    
    for(int i=1;i<=n;++i)
    {
        cin>>a[i];
        
        auto res=it.search(a[i]);

        //实际上stl中[]符号返回的是引用，如果不存在则新建，我这里没有新建，所以毕竟先查询一次探探路
        if(res==nullptr)it.insert(a[i],1);//如果空，插入1
        else it.insert(a[i],res->value+1);//不为空，则+1
    }

    sort(a+1,a+1+n);

    int tot=unique(a+1,a+1+n)-a-1;

    for(int i=1;i<=tot;++i)
    {
        auto res=it.search(a[i]);

        while(res->value--)
        {
            cout<<a[i]<<' ';
        }
        
        it.erase(a[i]);
    }

    cout << endl;
    system("pause");
    return 0;
}
```

![](/img/CSDN/algo-trie-balanced-tree/8e1043982777dc50c62d33d6a6319760.webp)

## m进制Trie（以35进制为例）普通平衡树P3369代码实现与AC记录

```cpp
#include <iostream>
#include <cmath>
using namespace std;

//m进制Trie，和01Trie思想是一致的，
//先获得maxn，而且maxn必须是m的幂数
const int m=35,N=1e7+10, maxlog=ceil(log(N)/log(m)),maxn=pow(m,maxlog);

class m_Tire
{
private:
    struct node
    {
        node *child[m];
        int size;
        node(node *p)
        {
            for(int i=0;i<m;++i)child[i]=p;
            size = 0;
        }
    } *root;

    void clear(node*now)
    {
        if(now==root)return;
        
        for(int i=0;i<m;++i)
            clear(now->child[i]);
        delete now;
    }

public:

    void clear()
    {
        for(int i=0;i<m;++i)
        {
            clear(root->child[i]);
            root->child[i]=root;
        }
    }

    ~m_Tire()
    {
        clear();
        delete root;
    }

    m_Tire()//设置头结点root，让所有空节点都指向root
    {
        root = new node(nullptr);
        for(int i=0;i<m;++i)
            root->child[i]=root;
    }

    void insert(int x)
    {
        node *p = root;

        for (int power=maxn,t; power; power/=m)
        {
            t = (x / power)  % m;//获得这一位的数字，即余数

            if (p->child[t] == root)
                p->child[t] = new node(root);//如空，则新建

            p = p->child[t];
            ++p->size;
        }
    }

    void erase(int x)//删除则更简单，直接沿路删除即可，因为不需要释放空间，
    {
        node *p = root;

        for (int power=maxn, t; power; power/=m)
        {
            t = (x /power) % m;
            p = p->child[t];
            --p->size;
        }
    }

    int get_val(int k)//根据排名获得值
    {

        node *p = root;
        int ans = 0;

        for (int power=maxn,j,sum; power; power/=m)
        {
            for(j=0,sum=0;j<m&&sum<k;++j)//获得第一位sum大于等于地方
                sum+=p->child[j]->size;

            //if(sum>=k)
           // {

            k-=(sum-p->child[j-1]->size);//注意一定要减去小于本身的那些数的个数，这个时候j指向的是第一个大于等于，所以把左边的全部剪掉
            p=p->child[j-1];
            ans+=(j-1)*power;//注意细微的差别，这里也要加上

            //}

            //这部分是不被需要的，因为sum一定大于等于k，这是上面for循环所保证的。
            // else
            // {
            //     k-=sum;
            //     p=p->child[j];
            //     ans+=j*power;
            // }

            if (p == root)
                break;
        }

        return ans - maxn;//记得减去maxn，处理了负数
    }

    int get_rank(int x)//根据值获得排名，注意，获得的是小于本身的个数！
    {
        int ans = 0;
        node *p = root;

        for (int power=maxn,t,sum,i; power; power/=m)
        {
            for(i=0,sum=0,t=(x/power)%m;i<t;++i)
                sum+=p->child[i]->size;
            
            ans+=sum;
            p=p->child[t];

            if (p == root)
                break;
        }

        return ans;
    }

    int get_pre(int x)
    {
        return get_val(get_rank(x));//
    }

    int get_next(int x)
    {
        return get_val(get_rank(x + 1) + 1);//get_rank(x+1)获得了小于等于本身的个数，再加1，就是第一个大于本身的数。
    }
};

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    m_Tire it;
    int n;
    cin >> n;

    while (n--)
    {
        int op, x;
        cin >> op >> x;

        x += maxn;

        if (op == 1)
        {
            it.insert(x);
        }
        else if (op == 2)
        {
            it.erase(x);
        }
        else if (op == 3)
        {
            cout << it.get_rank(x) + 1 << '\n';//注意一定要加1，因为获得的是小于本身的个数
        }
        else if (op == 4)
        {
            cout << it.get_val(x - maxn) << '\n';
        }
        else if (op == 5)
        {
            cout << it.get_pre(x) << '\n';
        }
        else if (op == 6)
        {
            cout << it.get_next(x) << '\n';
        }
    }

    cout << endl;
    system("pause");
    return 0;
}
```
