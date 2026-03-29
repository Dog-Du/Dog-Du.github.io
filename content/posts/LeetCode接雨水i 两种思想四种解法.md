---
date: '2023-10-23T11:18:53.000Z'
tags:
- 数据结构与算法
categories:
- 算法与数据结构
title: LeetCode接雨水i 两种思想四种解法
slug: algo-trapping-rain
summary: 围绕 LeetCode 接雨水题，总结单调栈、区间查询、动态规划与双指针四种经典解法及其思路差异。
commentTerm: "LeetCode接雨水i 两种思想四种解法 | DogDu's blog"
lastmod: '2025-04-04T11:32:10.709Z'
featureimage: "images/covers/cover_26_rain.webp"
---
这道题非常适合拿来对比不同解法的思维差异。核心视角主要有两类：一类是“以区间凹槽为中心”去找左右边界，另一类是“以单个柱子的贡献为中心”去算每个位置能接多少水。

下面按这个思路整理四种常见写法。


<!--more-->

## 解法一：单调栈

从某个柱子的角度看，只要后面存在一个高度不小于它的柱子，就有机会和中间区域形成一个盛水结构。这个版本用单调栈预处理左右边界，再分段统计贡献。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int ans = 0, n = height.size();
        vector<int> st, rear(n, -1), front(n, -1), add(n);

        add[0] = height[0];
        for (int i = 1; i < n; ++i)
            add[i] = add[i - 1] + height[i];

        for (int i = 0; i < n; ++i) {
            while (!st.empty() && height[st.back()] <= height[i]) {
                rear[st.back()] = i;
                st.pop_back();
            }
            st.push_back(i);
        }

        st.clear();
        for (int i = n - 1; i >= 0; --i) {
            while (!st.empty() && height[st.back()] < height[i]) {
                front[st.back()] = i;
                st.pop_back();
            }
            st.push_back(i);
        }

        for (int i = 0; i < n; ++i) {
            if (rear[i] == -1) break;
            ans += (rear[i] - i - 1) * height[i];
            ans -= (add[rear[i] - 1] - add[i]);
            i = rear[i] - 1;
        }

        for (int i = n - 1; i >= 0; --i) {
            if (front[i] == -1) break;
            ans += (i - front[i] - 1) * height[i];
            ans -= (add[i - 1] - add[front[i]]);
            i = front[i] + 1;
        }

        return ans;
    }
};
```

## 解法二：按单点贡献计算

从单个柱子的贡献出发，位置 `i` 的积水量等于 `min(左侧最高柱子, 右侧最高柱子) - 当前高度`。沿着这个视角，就能自然推出后面三种写法。

第一种朴素做法是双向枚举左右最大值，时间复杂度 `O(n^2)`，这里只略过不写。

### 线段树 / RMQ

```cpp
class Solution {
public:
    static const int maxn = 2e4 + 10;
    int t[maxn << 2];

    void build(int x, int l, int r, vector<int>& vec) {
        if (l == r) {
            t[x] = vec[l];
            return;
        }

        int mid = l + r >> 1;

        build(x << 1, l, mid, vec);
        build(x << 1 | 1, mid + 1, r, vec);

        t[x] = max(t[x << 1], t[x << 1 | 1]);
    }

    int query(int x, int l, int r, int L, int R) {
        if (l >= L && r <= R) return t[x];

        int mid = l + r >> 1, ans = -1;

        if (mid >= L) ans = max(ans, query(x << 1, l, mid, L, R));
        if (mid < R) ans = max(ans, query(x << 1 | 1, mid + 1, r, L, R));

        return ans;
    }

    int trap(vector<int>& height) {
        int n = height.size(), ans = 0;
        build(1, 0, n - 1, height);

        for (int i = 1, t; i < n - 1; ++i) {
            t = min(query(1, 0, n - 1, 0, i - 1), query(1, 0, n - 1, i + 1, n - 1)) - height[i];
            if (t > 0) ans += t;
        }

        return ans;
    }
};
```
###
动态规划
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size(), ans = 0;
        vector<int> lmax(n, -1), rmax(n, -1);

        lmax.front() = height.front();
        rmax.back() = height.back();

        for (int i = 1; i < n; ++i)
            lmax[i] = max(lmax[i - 1], height[i]);

        for (int i = n - 2; i >= 0; --i)
            rmax[i] = max(rmax[i + 1], height[i]);

        for (int i = 1, t; i < n - 1; ++i) {
            t = min(lmax[i - 1], rmax[i + 1]) - height[i];
            if (t > 0) ans += t;
        }

        return ans;
    }
};
```
