# 1 <= equations.length <= 500
# 0.0 < values[i] <= 20.0
from collections import defaultdict
from typing import List, Set

EPS = 1e-5


class Solution:
    def checkContradictions(self, equations: List[List[str]], values: List[float]) -> bool:
        """检查方程是否存在矛盾
        
        从每个点出发dfs 检查 start => cur 这条边是否与给定的边的描述存在矛盾
        O(n^2)
        """

        def dfs(cur: str, curValue: float, visited: Set[str], start: str) -> bool:
            if cur in adjMap[start] and abs(adjMap[start][cur] - curValue) > EPS:
                return True
            for next in adjMap[cur]:
                if next in visited:
                    continue
                visited.add(next)
                if dfs(next, curValue * adjMap[cur][next], visited, start):
                    return True

            return False

        adjMap = defaultdict(lambda: defaultdict(lambda: 0.0))
        for (u, v), w in zip(equations, values):
            if u == v and abs(w - 1) > EPS:
                return True
            if v in adjMap[u] and abs(adjMap[u][v] - w) > EPS:
                return True
            adjMap[u][v] = w
            if u in adjMap[v] and abs(adjMap[v][u] - 1 / w) > EPS:
                return True
            adjMap[v][u] = 1 / w

        for start in adjMap:
            if dfs(start, 1.0, set([start]), start):
                return True

        return False


print(
    Solution().checkContradictions(
        equations=[["a", "b"], ["b", "c"], ["a", "c"]], values=[3, 0.5, 1.5]
    )
)

print(
    Solution().checkContradictions(
        equations=[
            ["cvrxz", "bcgg"],
            ["s", "swz"],
            ["xtdk", "tdruc"],
            ["guwn", "xfbys"],
            ["uc", "xfbys"],
            ["uc", "by"],
            ["ilu", "ilu"],
            ["xfbys", "ieb"],
            ["mvyqt", "nkkso"],
            ["ilu", "geu"],
            ["nedpp", "zf"],
            ["arzgj", "guwn"],
            ["by", "t"],
            ["mvyqt", "qfi"],
            ["nkkso", "s"],
            ["w", "nedpp"],
            ["ts", "fdlve"],
            ["h", "t"],
            ["nkkso", "bqt"],
            ["bcgg", "hxqsj"],
            ["x", "ds"],
            ["guwn", "nedpp"],
            ["by", "guwn"],
            ["h", "uc"],
            ["bqt", "xtdk"],
            ["ca", "nedpp"],
            ["h", "bcgg"],
            ["ilu", "yl"],
            ["zqgiw", "lsf"],
            ["x", "qfi"],
            ["guwn", "swz"],
            ["mvyqt", "geu"],
            ["swz", "h"],
            ["h", "swz"],
            ["h", "bcgg"],
            ["nkkso", "bqt"],
            ["by", "xtdk"],
            ["me", "sk"],
            ["nedpp", "h"],
            ["ts", "nedpp"],
            ["xqci", "guwn"],
            ["ts", "lsf"],
            ["qfi", "ilu"],
            ["ca", "aqmc"],
            ["h", "s"],
            ["s", "ds"],
            ["h", "tdruc"],
            ["by", "by"],
            ["xfbys", "mvyqt"],
            ["xqci", "x"],
            ["zqgiw", "mvyqt"],
            ["fdlve", "ko"],
            ["hxqsj", "zqgiw"],
            ["sk", "zf"],
            ["me", "yl"],
            ["swz", "qfi"],
            ["guwn", "ds"],
            ["bcgg", "bcgg"],
            ["cvrxz", "fdlve"],
            ["aqmc", "ts"],
            ["h", "xqci"],
            ["tdruc", "h"],
            ["nkkso", "uc"],
            ["s", "s"],
            ["ca", "fdlve"],
            ["uc", "ts"],
            ["tdruc", "swz"],
            ["mvyqt", "qfi"],
            ["yl", "qfi"],
            ["yl", "ds"],
            ["h", "uc"],
            ["zqgiw", "x"],
            ["t", "h"],
            ["by", "ilu"],
            ["qfi", "arzgj"],
            ["uc", "xqci"],
            ["ilu", "qfi"],
            ["h", "uc"],
            ["w", "ilu"],
            ["zqgiw", "ca"],
            ["t", "ilu"],
            ["by", "uc"],
            ["zf", "ds"],
            ["sk", "yl"],
            ["nedpp", "t"],
            ["hxqsj", "t"],
            ["uc", "geu"],
            ["xqci", "ilu"],
            ["guwn", "geu"],
            ["tdruc", "me"],
            ["ieb", "swz"],
            ["geu", "ts"],
            ["x", "nkkso"],
            ["aqmc", "swz"],
            ["zf", "h"],
            ["fdlve", "tdruc"],
            ["x", "x"],
            ["cvrxz", "w"],
            ["lsf", "ko"],
            ["sk", "sk"],
            ["ko", "ts"],
            ["hxqsj", "xtdk"],
            ["xfbys", "zf"],
            ["h", "x"],
            ["s", "ts"],
            ["hxqsj", "tdruc"],
            ["xtdk", "tdruc"],
            ["hxqsj", "zf"],
            ["me", "ds"],
            ["zqgiw", "geu"],
            ["nedpp", "h"],
            ["w", "uc"],
            ["tdruc", "mvyqt"],
            ["cvrxz", "tdruc"],
            ["s", "qfi"],
            ["nkkso", "uc"],
            ["ko", "nkkso"],
            ["tdruc", "cvrxz"],
            ["x", "zqgiw"],
            ["uc", "xfbys"],
            ["s", "ds"],
            ["qfi", "s"],
            ["bcgg", "ts"],
            ["hxqsj", "cvrxz"],
            ["sk", "cvrxz"],
            ["xtdk", "geu"],
            ["bcgg", "w"],
            ["aqmc", "arzgj"],
            ["bcgg", "qfi"],
            ["ca", "cvrxz"],
            ["ts", "cvrxz"],
            ["zf", "ko"],
            ["nkkso", "bqt"],
            ["swz", "me"],
            ["bqt", "by"],
            ["s", "ko"],
            ["uc", "aqmc"],
            ["ilu", "yl"],
            ["bcgg", "geu"],
            ["ds", "x"],
            ["bcgg", "qfi"],
            ["swz", "h"],
            ["w", "qfi"],
            ["nedpp", "tdruc"],
            ["lsf", "fdlve"],
            ["fdlve", "by"],
            ["cvrxz", "by"],
            ["ko", "nkkso"],
            ["tdruc", "ts"],
            ["h", "nkkso"],
            ["hxqsj", "qfi"],
            ["ds", "xfbys"],
            ["ko", "zf"],
            ["ca", "yl"],
            ["t", "swz"],
            ["ca", "ts"],
            ["zqgiw", "aqmc"],
            ["cvrxz", "s"],
            ["zf", "ieb"],
            ["h", "t"],
            ["w", "s"],
            ["cvrxz", "t"],
            ["uc", "w"],
            ["me", "sk"],
            ["ko", "arzgj"],
            ["ieb", "by"],
            ["x", "arzgj"],
            ["xfbys", "h"],
            ["yl", "uc"],
            ["guwn", "x"],
            ["lsf", "lsf"],
            ["h", "x"],
            ["ds", "nkkso"],
            ["guwn", "w"],
            ["geu", "guwn"],
            ["yl", "guwn"],
            ["cvrxz", "ca"],
            ["sk", "ds"],
            ["fdlve", "yl"],
            ["zf", "ca"],
            ["hxqsj", "bqt"],
            ["sk", "by"],
            ["geu", "guwn"],
            ["guwn", "ko"],
            ["ieb", "x"],
            ["ts", "me"],
            ["me", "swz"],
            ["swz", "ko"],
            ["ko", "h"],
            ["lsf", "fdlve"],
            ["nedpp", "xfbys"],
            ["h", "h"],
        ],
        values=[
            7.8125,
            10.0,
            10.0,
            12.5,
            12.5,
            10.0,
            1,
            16.0,
            12.5,
            6.25,
            15.625,
            12.5,
            4.0,
            15.625,
            10.0,
            1.6,
            10.0,
            10.0,
            16.0,
            5.0,
            6.25,
            12.5,
            0.1,
            0.25,
            4.0,
            12.5,
            20.0,
            7.8125,
            8.0,
            0.8,
            12.5,
            10.0,
            0.32,
            3.125,
            20.0,
            16.0,
            0.8,
            12.5,
            0.32,
            12.5,
            16.0,
            12.5,
            0.1024,
            1.5625,
            0.3125,
            0.9765625,
            20.0,
            1,
            0.0008,
            3.125,
            0.0064,
            1.6,
            0.00390625,
            5.0,
            0.04,
            0.0125,
            1.220703125,
            1,
            0.9765625,
            0.64,
            0.015625,
            0.05,
            8.0,
            1,
            10.0,
            1.0,
            0.15625,
            15.625,
            1.25,
            9.765625,
            0.25,
            0.125,
            0.1,
            0.0016,
            0.512,
            0.0625,
            9.765625,
            0.25,
            0.002048,
            0.64,
            0.0004,
            0.1,
            0.00625,
            0.0032,
            3.2,
            0.1,
            0.1,
            0.256,
            0.1,
            0.0390625,
            0.0625,
            10.0,
            0.64,
            8.0,
            0.02048,
            8.0,
            1,
            0.7629394531250006,
            1.28,
            1,
            0.0625,
            0.02,
            15.625,
            0.048828125,
            0.8,
            0.2,
            10.0,
            0.48828125,
            0.390625,
            0.064,
            0.32,
            0.128,
            0.000125,
            7.8125,
            0.125,
            8.0,
            0.0078125,
            0.128,
            8.0,
            12.5,
            0.9765625,
            8.0,
            0.0125,
            0.0256,
            0.262144,
            0.0125,
            0.09765625,
            0.0512,
            0.001953125,
            10.24,
            10.24,
            0.08192,
            16.0,
            0.25,
            5.0,
            12.8,
            1.5625,
            7.8125,
            0.00125,
            0.16,
            0.001953125,
            0.32,
            0.02,
            6.4,
            0.8,
            1.0,
            0.9765625,
            0.0078125,
            0.0125,
            0.03125,
            0.000390625,
            10.24,
            12.20703125,
            0.125,
            0.3125,
            1.0,
            1.0,
            0.12207031249999972,
            1.024,
            10.0,
            0.16,
            3.90625,
            7.8125,
            12.5,
            0.005,
            0.05,
            0.4096,
            0.32,
            8.0,
            0.1953125,
            1,
            0.048828125,
            0.1024,
            7.8125,
            10.0,
            8.0,
            0.09765625,
            0.03125,
            0.0125,
            0.00512,
            0.005,
            0.256,
            10.0,
            16.0,
            0.000976562500000003,
            3.125,
            4.0,
            1.28,
            0.25,
            0.8,
            1.0,
            1,
        ],
    )
)
