/**
 * 链式前向星存图.边的编号从`0`开始.
 * @see {@link https://segmentfault.com/a/1190000043443360}
 *      {@link https://zhuanlan.zhihu.com/p/343092172}
 */
class ChainForwardStar {
  static fromAdjList(
    adjList: ArrayLike<ArrayLike<number>> | ArrayLike<ArrayLike<[next: number, weight: number]>>
  ): ChainForwardStar {
    const n = adjList.length
    let m = 0
    let hasWeight = true
    for (let cur = 0; cur < n; cur++) {
      const len = adjList[cur].length
      if (len && typeof adjList[cur][0] === 'number') hasWeight = false
      m += len
    }

    const res = new ChainForwardStar(n, m)
    if (hasWeight) {
      for (let cur = 0; cur < n; cur++) {
        const nexts = adjList[cur] as ArrayLike<[next: number, weight: number]>
        for (let i = 0; i < nexts.length; i++) {
          res.addDirectedEdge(cur, nexts[i][0], nexts[i][1])
        }
      }
      return res
    }

    for (let cur = 0; cur < n; cur++) {
      const nexts = adjList[cur] as ArrayLike<number>
      for (let i = 0; i < nexts.length; i++) {
        res.addDirectedEdge(cur, nexts[i], 1)
      }
    }
    return res
  }

  /**
   * preEdge[i]的下标:边的编号.
   * preEdge[i]的值:前向边的编号,如果不存在前向边,则为`-1`.
   * 邻接表中,2的邻居为[4,3],边2->3和边2->4的编号分别为4和3.
   * 那么pre[4]=3.
   */
  readonly preEdge: Int32Array

  /**
   * lastEdge[i]的下标:点的编号.
   * lastEdge[i]的值:最后一次出现的前向边的编号,如果不存在前向边,则为`-1`.
   */
  readonly lastEdge: Int32Array

  /**
   * toVertex[i]的下标:边的编号.
   * toVertex[i]的值:边的终点.
   */
  readonly edgeTo: Int32Array

  /**
   * `weight[i]`表示编号为`i`的边的权重.
   */
  readonly weight: number[]

  private readonly _n: number

  private _edgeId = 0

  constructor(n: number, m: number) {
    this.preEdge = new Int32Array(m + 1).fill(-1)
    this.lastEdge = new Int32Array(n + 1).fill(-1)
    this.edgeTo = new Int32Array(m + 1).fill(-1)
    this.weight = Array(m + 1).fill(0)
    this._n = n
  }

  /**
   * 添加一条从`from`到`to`的边,权重为`weight`.
   */
  addDirectedEdge(from: number, to: number, weight: number): void {
    const eid = this._edgeId++
    this.preEdge[eid] = this.lastEdge[from]
    this.lastEdge[from] = eid
    this.edgeTo[eid] = to
    this.weight[eid] = weight
  }

  removeDirectedEdge(from: number, to: number): void {
    let lastEdge = -1
    for (let eid = this.lastEdge[from]; ~eid; eid = this.preEdge[eid]) {
      const next = this.edgeTo[eid]
      if (next === to) {
        if (eid === this.lastEdge[from]) {
          this.lastEdge[from] = this.preEdge[eid]
        } else {
          this.preEdge[lastEdge] = this.preEdge[eid]
        }
        break
      }

      lastEdge = eid
    }
  }

  /**
   * 添加一条无向边,权重为`weight`.
   */
  addEdge(u: number, v: number, weight: number): void {
    this.addDirectedEdge(u, v, weight)
    this.addDirectedEdge(v, u, weight)
  }

  removeEdge(u: number, v: number): void {
    this.removeDirectedEdge(u, v)
    this.removeDirectedEdge(v, u)
  }

  enumerateNexts(
    cur: number,
    callbackfn: (next: number, weight: number, edgeId: number) => void
  ): void {
    for (let eid = this.lastEdge[cur]; ~eid; eid = this.preEdge[eid]) {
      callbackfn(this.edgeTo[eid], this.weight[eid], eid)
    }
  }

  toAdjList(): [next: number, weight: number, edgeId: number][][] {
    const res = Array(this._n)
    for (let cur = 0; cur < this._n; cur++) {
      const nexts: [next: number, weight: number, edgeId: number][] = []
      this.enumerateNexts(cur, (next, weight, edgeId) => {
        nexts.push([next, weight, edgeId])
      })
      // dont use reverse, too slow
      for (let i = 0; i < nexts.length >> 1; i++) {
        const tmp = nexts[i]
        nexts[i] = nexts[nexts.length - 1 - i]
        nexts[nexts.length - 1 - i] = tmp
      }
      res[cur] = nexts
    }
    return res
  }
}

export { ChainForwardStar }

if (require.main === module) {
  const adjList = [[1, 2], [2], [0, 3], [3]]
  const cfs = ChainForwardStar.fromAdjList(adjList)
  console.log(cfs.toAdjList())
  cfs.removeDirectedEdge(0, 1)
  console.log(cfs.toAdjList())
}
