1.  树的最长路径
    无权树的`直径`为边长条数最多的一条路径

    - 可以用两次 bfs 的方法做，也可以用有权树的 dp 解法做

    有权树的`直径`为边长之和加起来最长的路径

    - `dp 算法: 以任何一个点出发, 找到距离该点最远的 2 条路径, 加起来就是结果`

2.  树的中心
    很难想的题目，直接在外面开几个数组保存子节点的信息
    dfs 两次，子结点更新父结点向下的最远距离,父结点更新子结点`非向下`的最远距离
3.  数字转换-`森林中树的最长路`
    因数筛求 1-n 每个数的约数之和
4.  二叉苹果树-`带依赖条件的背包问题`
    `dfs(root,select)以 root 为根的子树上选择 select 个节点，所有节点的权值最大和是多少`

5.  皇宫看守
    树上的状态机 dp
    状态机树形 DP，求最小花费
    dp[u][0] 当前点 u 被父结点覆盖
    dp[u][1] 当前点 u 被子结点覆盖
    dp[u][2] 当前点 u 驻兵

**树形 dp:正图的 dfs 等价于反图的拓扑排序**
