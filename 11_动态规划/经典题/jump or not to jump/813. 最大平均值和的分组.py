from typing import List
from functools import lru_cache
from itertools import accumulate

# 我们将给定的数组 A 分成 K 个相邻的非空子数组 ，我们的分数由每个子数组内的平均值的总和构成。计算我们所能得到的最大分数是多少。
# 注意我们必须使用 A 数组中的每一个数进行分组，并且分数不一定需要是整数。
# 1 <= A.length <= 100.
# 1 <= A[i] <= 10000.


class Solution:
    def largestSumOfAverages(self, nums: List[int], k: int) -> float:
        n = len(nums)
        preSum = [0] + list(accumulate(nums))

        @lru_cache(None)
        def dfs(cur: int, remain: int) -> float:
            if cur == n:
                return 0
            if remain == 1:
                return (preSum[-1] - preSum[cur]) / (n - cur)

            res = 0
            for i in range(cur, n):
                res = max(
                    res, (preSum[i + 1] - preSum[cur]) / (i - cur + 1) + dfs(i + 1, remain - 1)
                )

            return res

        return dfs(0, k)


print(Solution().largestSumOfAverages(nums=[9, 1, 2, 3, 9], k=3))
# 输出: 20
# 解释:
# A 的最优分组是[9], [1, 2, 3], [9]. 得到的分数是 9 + (1 + 2 + 3) / 3 + 9 = 20.
# 我们也可以把 A 分成[9, 1], [2], [3, 9].
# 这样的分组得到的分数为 5 + 2 + 6 = 13, 但不是最大值.
