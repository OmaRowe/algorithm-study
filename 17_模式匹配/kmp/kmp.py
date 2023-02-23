# 使用方式类似于AC自动机:
# KMP(pattern)：构造函数, pattern为模式串.
# Match(s,start): 返回模式串在s中出现的所有位置.
# Move(pos, char): 从当前状态pos沿着char移动到下一个状态, 如果不存在则移动到fail指针指向的状态.
# IsMatched(pos): 判断当前状态pos是否为匹配状态.

from typing import List


class KMP:
    """单模式串匹配"""

    @staticmethod
    def getNext(pattern: str) -> List[int]:
        next = [0] * len(pattern)
        j = 0
        for i in range(1, len(pattern)):
            while j and pattern[i] != pattern[j]:
                j = next[j - 1]
            if pattern[i] == pattern[j]:
                j += 1
            next[i] = j
        return next

    __slots__ = ("next", "_pattern")

    def __init__(self, pattern: str):
        self.next = self.getNext(pattern)
        self._pattern = pattern

    def matchAll(self, s: str, start=0) -> List[int]:
        res = []
        pos = 0
        for i in range(start, len(s)):
            pos = self.move(pos, s[i])
            if self.isMatched(pos):
                res.append(i - len(self._pattern) + 1)
                pos = 0
        return res

    def move(self, pos: int, char: str) -> int:
        assert 0 <= pos < len(self._pattern)
        while pos and char != self._pattern[pos]:
            pos = self.next[pos - 1]
        if char == self._pattern[pos]:
            pos += 1
        return pos

    def isMatched(self, pos: int) -> bool:
        return pos == len(self._pattern)


def getNext(needle: str) -> List[int]:
    """kmp O(n)求 `needle`串的 `next`数组

    `next[i]`表示`[:i+1]`这一段字符串中最长公共前后缀(不含这一段字符串本身,即真前后缀)的长度
    https://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html
    """
    next = [0] * len(needle)
    j = 0

    for i in range(1, len(needle)):
        while j and needle[i] != needle[j]:  # 1. fallback后前进：匹配不成功j往右走
            j = next[j - 1]

        if needle[i] == needle[j]:  # 2. 匹配：匹配成功j往右走一步
            j += 1

        next[i] = j

    return next


if __name__ == "__main__":
    next = getNext("aabaabaabaab")  # 模式串的next数组
    assert next == [0, 1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    kmp = KMP("aab")
    assert kmp.matchAll("aabaabaabaab") == [0, 3, 6, 9]
    assert kmp.matchAll("aabaabaabaab", 1) == [3, 6, 9]
