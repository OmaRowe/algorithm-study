from typing import DefaultDict, List, Set, Tuple, Optional
from collections import defaultdict, Counter, deque


MOD = int(1e9 + 7)
INF = int(1e20)


def findCycleAndCalDepth(
    n: int, adjMap: DefaultDict[int, Set[int]], degrees: List[int], *, isDirected: bool
) -> Tuple[List[List[int]], List[int]]:
    depth = [0] * n
    queue = deque([(i, 0) for i in range(n) if degrees[i] == (0 if isDirected else 1)])
    visited = [False] * n
    while queue:
        cur, dist = queue.popleft()
        visited[cur] = True
        for next in adjMap[cur]:
            depth[next] = max(depth[next], dist + 1)
            degrees[next] -= 1
            if degrees[next] == (0 if isDirected else 1):
                queue.append((next, dist + 1))

    def dfs(cur: int, path: List[int]) -> None:
        if visited[cur]:
            return
        visited[cur] = True
        path.append(cur)
        for next in adjMap[cur]:
            dfs(next, path)

    cycleGroup = []
    for i in range(n):
        if visited[i]:
            continue
        path = []
        dfs(i, path)
        cycleGroup.append(path)

    return cycleGroup, depth


class Tarjan:
    INF = int(1e20)

    @staticmethod
    def getSCC(
        n: int, adjMap: DefaultDict[int, Set[int]]
    ) -> Tuple[int, DefaultDict[int, Set[int]], List[int]]:
        """Tarjan求解有向图的强连通分量

        Args:
            n (int): 结点0-n-1
            adjMap (DefaultDict[int, Set[int]]): 图

        Returns:
            Tuple[int, DefaultDict[int, Set[int]], List[int]]: SCC的数量、分组、每个结点对应的SCC编号
        """

        def dfs(cur: int) -> None:
            nonlocal dfsId, SCCId
            if visited[cur]:
                return
            visited[cur] = True

            order[cur] = low[cur] = dfsId
            dfsId += 1
            stack.append(cur)
            inStack[cur] = True

            for next in adjMap[cur]:
                if not visited[next]:
                    dfs(next)
                    low[cur] = min(low[cur], low[next])
                elif inStack[next]:
                    low[cur] = min(low[cur], order[next])  # 注意这里是order

            if order[cur] == low[cur]:
                while stack:
                    top = stack.pop()
                    inStack[top] = False
                    SCCGroupById[SCCId].add(top)
                    SCCIdByNode[top] = SCCId
                    if top == cur:
                        break
                SCCId += 1

        dfsId = 0
        order, low = [Tarjan.INF] * n, [Tarjan.INF] * n

        visited = [False] * n
        stack = []
        inStack = [False] * n

        SCCId = 0
        SCCGroupById = defaultdict(set)
        SCCIdByNode = [-1] * n

        for cur in range(n):
            if not visited[cur]:
                dfs(cur)

        return SCCId, SCCGroupById, SCCIdByNode


class Solution:
    def longestCycle2(self, edges: List[int]) -> int:
        """
        每个节点至多有一条出边
        外向基环树最大环
        """
        n = len(edges)
        adjMap = defaultdict(set)
        deg = [0] * n
        for u, v in enumerate(edges):
            if v == -1:
                continue
            adjMap[u].add(v)
            deg[v] += 1
        cycle, _ = findCycleAndCalDepth(n, adjMap, deg, isDirected=True)
        if not cycle:
            return -1
        return max(len(g) for g in cycle)

    def longestCycle(self, edges: List[int]) -> int:
        """
        求有向图的最大环(Tarjan缩点)
        """
        n = len(edges)
        adjMap = defaultdict(set)
        deg = [0] * n
        for u, v in enumerate(edges):
            if v == -1:
                continue
            adjMap[u].add(v)
            deg[v] += 1
        cycle, _ = findCycleAndCalDepth(n, adjMap, deg, isDirected=True)
        if not cycle:
            return -1
        return max(len(g) for g in cycle)


print(Solution().longestCycle(edges=[3, 3, 4, 2, 3]))
