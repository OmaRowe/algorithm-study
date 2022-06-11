// 先转置后镜像对称
/**
 Do not return anything, modify matrix in-place instead.
 NxN的矩阵
 */
const rotate = (matrix: number[][]): void => {
  const [ROW, COL] = [matrix.length, matrix[0].length]

  // 转置
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < r; c++) {
      ;[matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]]
    }
  }

  // 镜像
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < ROW >> 1; j++) {
      ;[matrix[i][j], matrix[i][ROW + ~j]] = [matrix[i][ROW + ~j], matrix[i][j]]
    }
  }

  // console.table(matrix)
}

rotate([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
])

export {}
