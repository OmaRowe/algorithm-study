# 有一个只含有 'Q', 'W', 'E', 'R' 四种字符，且长度为 n 的字符串。
# 假如在该字符串中，这四个字符都恰好出现 n/4 次，那么它就是一个「平衡字符串」。
# s.length 是 4 的倍数

# 请通过「替换`一个子串`」的方式，使原字符串 s 变成一个「平衡字符串」。
# 请返回待替换子串的最小可能长度。
# !此题的特别之处在于counter是记录滑窗外的字符
from collections import Counter


# 子串:滑动窗口
class Solution:
    def balancedString(self, s: str) -> int:
        counter = Counter(s)
        res = n = len(s)
        left = 0

        for right, char in enumerate(s):
            counter[char] -= 1
            # 平衡条件达成时，移动指针
            # !如果窗口外的小，那么可以将窗口内的补成缺少的字符，达到平均值。
            # 如果窗口外的某个字符大于平均值，
            # 那个多出来的字符需要被替换成其他字符，这样仅仅将窗口内的字符替换是达不到要求的
            while left < n and all(n / 4 >= counter[c] for c in "QWER"):
                res = min(res, right - left + 1)
                counter[s[left]] += 1
                left += 1

        return res


print(Solution().balancedString("QQWE"))
