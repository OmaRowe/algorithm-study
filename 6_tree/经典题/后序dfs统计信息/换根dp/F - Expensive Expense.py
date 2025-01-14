"""换根dp 昂贵的旅费

求从每个点作为根i 游览j的旅费最大值
从i到j的旅费 Eij = score[j] + ∑weight[k] (k是i到j的路径上的点)
n<=2e5
"""
from collections import defaultdict
import sys

sys.setrecursionlimit(int(1e9))
input = lambda: sys.stdin.readline().rstrip("\r\n")
MOD = 998244353
INF = int(4e18)

if __name__ == "__main__":
    from Rerooting import Rerooting

    E = int

    def e(root: int) -> E:
        return 0

    def op(childRes1: E, childRes2: E) -> E:
        return max(childRes1, childRes2)

    def composition(fromRes: E, parent: int, cur: int, direction: int) -> E:
        """direction: 0: cur -> parent, 1: parent -> cur"""
        """要不要游览当前城市"""
        weight = adjMap[parent][cur]
        if direction == 0:  # cur -> parent
            return max(fromRes, score[cur]) + weight
        return max(fromRes, score[parent]) + weight  # parent -> cur

    n = int(input())
    rerooting = Rerooting(n)
    adjMap = defaultdict(lambda: defaultdict(lambda: INF))
    for _ in range(n - 1):
        u, v, w = map(int, input().split())
        u, v = u - 1, v - 1
        rerooting.addEdge(u, v)
        adjMap[u][v] = w
        adjMap[v][u] = w

    score = list(map(int, input().split()))  # 每个点的观光费用
    res = rerooting.rerooting(e=e, op=op, composition=composition)
    print(*res, sep="\n")
