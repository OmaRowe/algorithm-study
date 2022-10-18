# !n个区间选k个区间交集非空
# https://codeforces.com/problemset/problem/1420/D

# 输入 n, k (1≤k≤n≤3e5) 和 n 个闭区间，区间的范围在 [1,1e9]。
# 你需要从 n 个区间中选择 k 个区间，且这 k 个区间的交集不为空。
# 输出方案数模 998244353 的结果。

# https://codeforces.com/contest/1420/submission/176225922
# https://codeforces.com/contest/1420/submission/176225199

# 对于每个区间的左端点 L，可能存在某些选法，是以 L 为交集的左端点的。
# 如果有 m 个区间包含它，且左端点为 L 的区间有 c 个，那么交集包含 L 的方案数为 C(m, k) - C(m-c, k)，即减去不以 L 为交集左端点的方案数。

# 两种实现方案：扫描线 / 差分哈希表。

# 有关组合数的求法，请查阅相关资料。


# 输入
# 7 3
# 1 7
# 3 8
# 4 5
# 6 7
# 1 3
# 5 10
# 8 9
# 输出 9

# 输入
# 3 1
# 1 1
# 2 2
# 3 3
# 输出 3

# 输入
# 3 2
# 1 1
# 2 2
# 3 3
# 输出 0

# 输入
# 3 3
# 1 3
# 2 3
# 3 3
# 输出 1

# 输入
# 5 2
# 1 3
# 2 4
# 3 5
# 4 6
# 5 7
# 输出 7
