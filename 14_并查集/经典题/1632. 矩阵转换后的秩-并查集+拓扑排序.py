from collections import defaultdict, deque
from typing import List

# 1632. 矩阵转换后的秩-并查集+拓扑排序
# 给你一个 m x n 的矩阵 matrix ，请你返回一个新的矩阵 answer ，
# 其中 answer[row][col] 是 matrix[row][col] 的`秩`。
# 1 <= m, n <= 500


class Solution:
    def matrixRankTransform(self, matrix: List[List[int]]) -> List[List[int]]:
        """
        大小关系:拓扑排序的deps
        相等的点秩相等，可视为一个点：并查集
        """
        row, col = len(matrix), len(matrix[0])
        uf = UnionFind(row * col + 10)

        # 1.首先把所有行和列中元素相同的节点合并
        for r in range(row):
            rowRecord = defaultdict(list)
            for c in range(col):
                rowRecord[matrix[r][c]].append(r * col + c)
            for points in rowRecord.values():
                for p1, p2 in zip(points, points[1:]):
                    uf.union(p1, p2)

        for c in range(col):
            colRecord = defaultdict(list)
            for r in range(row):
                colRecord[matrix[r][c]].append(r * col + c)
            for points in colRecord.values():
                for p1, p2 in zip(points, points[1:]):
                    uf.union(p1, p2)

        # 2. 建图
        adjList = defaultdict(list)
        indeg = [0] * (row * col)

        for r in range(row):
            row_ = sorted([(matrix[r][c], c) for c in range(col)])
            for p1, p2 in zip(row_, row_[1:]):
                root1, root2 = uf.find(r * col + p1[1]), uf.find(r * col + p2[1])
                if root1 != root2:
                    adjList[root1].append(root2)
                    indeg[root2] += 1

        for c in range(col):
            col_ = sorted([(matrix[r][c], r) for r in range(row)])
            for p1, p2 in zip(col_, col_[1:]):
                root1, root2 = uf.find(p1[1] * col + c), uf.find(p2[1] * col + c)
                if root1 != root2:
                    adjList[root1].append(root2)
                    indeg[root2] += 1

        # 3.拓扑排序，把入度等于0的节点加入队列，拓扑序dp求每个数的下界
        queue = deque([])
        for r in range(row):
            for c in range(col):
                id = r * col + c
                if indeg[id] == 0:
                    queue.append(id)

        dpMin = [1] * (row * col)
        while queue:
            cur = queue.popleft()
            for next in adjList[cur]:
                indeg[next] -= 1
                dpMin[next] = max(dpMin[next], dpMin[cur] + 1)
                if indeg[next] == 0:
                    queue.append(next)

        # 4.把结果放入矩阵
        res = [[0] * col for _ in range(row)]
        for r in range(row):
            for c in range(col):
                root = uf.find(r * col + c)
                res[r][c] = dpMin[root]
        return res


class UnionFind:
    def __init__(self, n: int):
        self.n = n
        self.count = n
        self.parent = list(range(n))
        self.rank = [1] * n

    def find(self, x: int) -> int:
        if x != self.parent[x]:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        rootX = self.find(x)
        rootY = self.find(y)
        if rootX == rootY:
            return False
        if self.rank[rootX] > self.rank[rootY]:
            rootX, rootY = rootY, rootX
        self.parent[rootX] = rootY
        self.rank[rootY] += self.rank[rootX]
        self.count -= 1
        return True

    def isConnected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)


if __name__ == "__main__":
    assert (Solution().matrixRankTransform(matrix=[[1, 2], [3, 4]])) == [[1, 2], [2, 3]]
