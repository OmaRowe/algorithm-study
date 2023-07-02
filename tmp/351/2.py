from functools import lru_cache
from typing import List, Tuple, Optional
from collections import defaultdict, Counter
from sortedcontainers import SortedList

MOD = int(1e9 + 7)
INF = int(1e20)

# 给你两个长度为 n 下标从 0 开始的整数数组 cost 和 time ，分别表示给 n 堵不同的墙刷油漆需要的开销和时间。你有两名油漆匠：


# 一位需要 付费 的油漆匠，刷第 i 堵墙需要花费 time[i] 单位的时间，开销为 cost[i] 单位的钱。
# 一位 免费 的油漆匠，刷 任意 一堵墙的时间为 1 单位，开销为 0 。但是必须在付费油漆匠 工作 时，免费油漆匠才会工作。
# 请你返回刷完 n 堵墙最少开销为多少。


# 免费油漆匠很厉害


# 选择时间之和>=half的集合使得cost最小
# !枚举免费刷的个数


def min2(a, b):
    return a if a < b else b


def max2(a, b):
    return a if a > b else b


# 仅凭时间无法确定 还与刷的个数有关


class Solution:
    def paintWalls2(self, cost: List[int], time: List[int]) -> int:
        pairs = list(zip(cost, time))
        timeSum = sum(time)
        n = len(pairs)
        dp = [INF] * (timeSum + 1)  # dp[index][timeSum] = costSum
        dp[0] = 0
        for c, t in pairs:
            ndp = dp[:]
            # 选
            for preT in range(timeSum):
                if preT + t > timeSum:
                    break
                ndp[preT + t] = min2(ndp[preT + t], dp[preT] + c)
            dp = ndp

        print(dp)
        res = INF
        for free in range(half + 1):  # 至少需要的时间
            sufMin = min(dp[n - free :])
            print(free, sufMin)

            res = min2(res, sufMin)
        return res

    # def paintWalls(self, cost: List[int], time: List[int]) -> int:
    #     # !枚举刷的个数
    #     pairs = list(zip(cost, time))
    #     n = len(pairs)
    #     res = INF
    #     half = (n + 1) // 2
    #     for x in range(1, half + 1):  # 枚举付费刷的个数,时间和>=n-x,使得cost最小
    #         ...


# cost = [1,2,3,2], time = [1,2,3,2]
print(Solution().paintWalls2(cost=[1, 2, 3, 2], time=[1, 2, 3, 2]))

# !时间肯定是一个状态