"""最长公共子序列 LCS模板"""

from functools import lru_cache
from typing import Any, Sequence


def LCS(seq1: Sequence["Any"], seq2: Sequence["Any"]) -> int:
    """返回LCS长度"""
    n1, n2 = len(seq1), len(seq2)
    res = 0
    dp = [[0] * (n2 + 1) for _ in range(n1 + 1)]
    for i in range(1, n1 + 1):
        for j in range(1, n2 + 1):
            if seq1[i - 1] == seq2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                res = max(res, dp[i][j])
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return res


def getLCS(s: str, t: str) -> str:
    """返回LCS"""
    n1, n2 = len(s), len(t)
    dp = [[0] * (n2 + 1) for _ in range(n1 + 1)]
    pre = [[(0, 0)] * (n2 + 1) for _ in range(n1 + 1)]
    for i in range(1, n1 + 1):
        for j in range(1, n2 + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                pre[i][j] = (i - 1, j - 1)
            else:
                if dp[i][j - 1] > dp[i][j]:
                    dp[i][j] = dp[i][j - 1]
                    pre[i][j] = (i, j - 1)
                if dp[i - 1][j] > dp[i][j]:
                    dp[i][j] = dp[i - 1][j]
                    pre[i][j] = (i - 1, j)

    res = []
    curI, curJ = n1, n2
    while 0 not in (curI, curJ):
        if curI - 1 < n1 and curJ - 1 < n2 and s[curI - 1] == t[curJ - 1]:
            res.append(s[curI - 1])
        curI, curJ = pre[curI][curJ]
    return "".join(res[::-1])


def LCS2(seq1: Sequence["Any"], seq2: Sequence["Any"]) -> int:
    """返回LCS长度"""

    @lru_cache(None)
    def dfs(i: int, j: int) -> int:
        if i == len(seq1) or j == len(seq2):
            return 0
        if seq1[i] == seq2[j]:
            return dfs(i + 1, j + 1) + 1
        else:
            return max(dfs(i + 1, j), dfs(i, j + 1))

    return dfs(0, 0)


if __name__ == "__main__":
    assert LCS("abc", "abcd") == 3
    assert LCS2("abc", "abcd") == 3
    assert getLCS("eabc", "abcde") == "abc"
