# 所有子集可能的异或数
# 子集的很多题都可以滚动更新
class Solution:
    def solve(self, nums):
        res = set()
        cur = set()
        for num in nums:
            cur = {num | pre for pre in cur} | {num}
            res |= cur
        return len(res)


print(Solution().solve(nums=[1, 2, 4]))
# We can form the numbers [1, 2, 3, 4, 6, 7]

# 1 == 1
# 2 == 2
# 4 == 4
# 1 | 2 == 3
# 2 | 4 == 6
# 1 | 2 | 4 == 7
