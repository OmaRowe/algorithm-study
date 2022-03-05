from typing import List
from sortedcontainers import SortedList

# 启发式合并：在合并数组、集合等时，总是将元素数较少的那个数组/集合中的元素合并到元素数较多的那个数组/集合中
# 这样就可以保证合并的总复杂度为nlogn


# 2 <= n <= 10^5
# 1 <= nums[i] <= 10^5

# 在DFS过程中，将每个子树拥有的数的集合合并，得到当前节点拥有的数
class Solution:
    def smallestMissingValueSubtree(self, parents: List[int], nums: List[int]) -> List[int]:
        def findMex(tree: SortedList) -> int:
            """二分搜索缺失的第一个正整数,lc1539. 第 k 个缺失的正整数"""
            # MEX:Min Excluded
            left, right = 0, len(tree) - 1
            while left <= right:
                mid = (left + right) >> 1
                diff = tree[mid] - (mid + 1)
                if diff >= 1:
                    right = mid - 1
                else:
                    left = mid + 1
            return left + 1

        def dfs(cur: int, parent: int) -> SortedList:
            """dfs返回子树的集合，注意启发式合并"""
            curTree = SortedList()
            for next in adjList[cur]:
                if next == parent:
                    continue
                subTree = dfs(next, cur)
                # 启发式合并，小的合并到大的
                curTree, subTree = sorted((curTree, subTree), key=len, reverse=True)
                curTree += subTree

            curTree.add(nums[cur])
            res[cur] = findMex(curTree)
            return curTree

        n = len(parents)
        adjList = [[] for _ in range(n)]
        for i in range(1, n):
            adjList[parents[i]].append(i)

        res = [1] * n
        dfs(0, -1)
        return res


print(Solution().smallestMissingValueSubtree(parents=[-1, 0, 0, 2], nums=[1, 2, 3, 4]))
print(Solution().smallestMissingValueSubtree(parents=[-1, 0, 1, 0, 3, 3], nums=[5, 4, 6, 2, 1, 3]))

