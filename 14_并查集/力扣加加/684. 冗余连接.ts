import { UnionFind } from '../0_并查集'

/**
 * @param {number[][]} edges
 * @return {number[]}
 * @description  树可以看成是一个连通且 无环 的 无向 图。
 * 请找出一条可以删去的边，删除后可使得剩余部分是一个有着 n 个节点的树。如果有多个答案，则返回数组 edges 中最后出现的边。
 */
const findRedundantConnection = function (edges: number[][]): number[] {
  const uf = new UnionFind()
  for (const [v, w] of edges) {
    uf.add(v).add(w)
    if (uf.isConnected(v, w)) return [v, w]
    uf.union(v, w)
  }
  return [Infinity, Infinity]
}

console.log(
  findRedundantConnection([
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 4],
    [1, 5],
  ])
)
// [1,4]

export {}
