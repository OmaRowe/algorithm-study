**重み付き Union-Find**

1. 1250-格子游戏并查集`在线找环`
   两个轮流在相邻的点之间画上红边和蓝边：直到围成一个封闭的圈（面积不必为 1）为止，
   “封圈”的那个人就是赢家。因为棋盘实在是太大了，他们的游戏实在是太长了！
   `形成环：两个点在并查集里，并查集在线找环`

2. 1252-搭配购买`并查集+01背包`

Joe 觉得云朵很美，决定去山上的商店买一些云朵。
商店里有 n 朵云，云朵被编号为 1,2,…,n，并且每朵云都有一个价值。
但是商店老板跟他说，一些云朵要`搭配来买`才好，所以买一朵云则与这朵云有搭配的云都要买。
但是 Joe 的钱有限，所以他希望买的价值越多越好。
`先找连通块，看成一个物品即可`

3. 237-程序自动分析`扩展域并查集`
   给定 n 个形如 xi=xj 或 xi≠xj 的变量相等/不等的约束条件，请判定是否可以分别为每一个变量赋予恰当的值，使得上述所有约束条件同时被满足。

```Python
    a, b = map(int, input().split())
    if uf.isConnected(a, b):
        res -= 1
    uf.union(a, b + n)
    uf.union(a + n, b)
```

题目数值太大了，可以用`离散化=>排序去重+二分` 1e9=>1e6

4. 238-银河英雄传说`维护到根节点距离的并查集`
   有 T 条指令，每条指令格式为以下两种之一：
   M i j，表示让第 i 号战舰`所在列的全部战舰保持原有顺序`，`接`在第 j 号战舰所在列的尾部。
   C i j，表示询问第 i 号战舰与第 j 号战舰当前是否`处于同一列中`，如果在同一列中，它们之间间`隔了多少艘`战舰。

   `隔了多少艘战舰=>维护到根节点距离的并查集，前缀和`

5. 239-奇偶游戏`前缀和+扩展域并查集`

小 B 向小 A 提出了 M 个问题。
在每个问题中，小 B 指定两个数 l 和 r，小 A 回答 `S[l∼r] 中有奇数个 1 还是偶数个 1。`
机智的小 B 发现小 A 有可能在撒谎。
请你帮助小 B 检查这 M 个答案，并指出在至少多少个回答之后可以确定小 A 一定在撒谎。

Sn 表示前缀中 1 的个数，奇数等价于 s[r]与 s[l-1]`奇偶性不同`，偶数等价于`奇偶性相同`
`如果 x,y 同类，则 uf.union(x,y),uf.union(x+n,y+n)`
`如果 x,y 异类，则 uf.union(x,y+n),uf.union(x+n,y)`

并查集维护距离:
**乘法除法取对数就是加法减法 可以维护每个点到根节点的距离来维护各个值之间的传递关系**
