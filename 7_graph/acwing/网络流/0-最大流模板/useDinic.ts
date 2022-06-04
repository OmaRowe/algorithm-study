import assert from 'assert'

// class Edge<Vertex extends PropertyKey> {
//   constructor(
//     public readonly from: Vertex,
//     public readonly to: Vertex,
//     public readonly capacity: number,
//     public flow: number
//   ) {}
// }

// function* makeIter<T>(iterable: Iterable<T>): Generator<T, undefined, undefined> {
//   yield* iterable
//   return void 0
// }

/**
 * @param start (虚拟)源点
 * @param end (虚拟)汇点
 *
 * @description Dinic求最大流 时间复杂度：O(V^2*E)
 */
function useDinic<Vertex extends PropertyKey = number>(start: Vertex, end: Vertex) {
  const adjMap = new Map<Vertex, Map<Vertex, number>>() // 残量图

  function addEdge(from: Vertex, to: Vertex, capacity: number): void {
    !adjMap.has(from) && adjMap.set(from, new Map())
    let innerMap = adjMap.get(from)!
    innerMap.set(to, capacity) // 覆盖
    !adjMap.has(to) && adjMap.set(to, new Map())
    innerMap = adjMap.get(to)!
    if (!innerMap.has(from)) innerMap.set(from, 0) // 防止自环边影响
  }

  function work(): number {
    let res = 0
    let depth!: Map<Vertex, number>
    let curEdge: Map<Vertex, Iterator<Vertex, undefined, undefined>> // 当前弧优化

    while (true) {
      bfs()
      if ((depth.get(end) ?? -1) === -1) break
      curEdge = makeCurEdge(adjMap)
      while (true) {
        const delta = dfs(start, Infinity)
        if (delta === 0) break
        res += delta
      }
    }

    return res

    function bfs(): void {
      depth = new Map<Vertex, number>([[start, 0]])
      const visited = new Set<Vertex>([start])
      let queue: Vertex[] = [start]

      while (queue.length) {
        const nextQueue: Vertex[] = []
        const steps = queue.length
        for (let _ = 0; _ < steps; _++) {
          const cur = queue.pop()!
          for (const [next, remainFlow] of adjMap.get(cur) ?? []) {
            if (!visited.has(next) && remainFlow > 0) {
              visited.add(next)
              depth.set(next, depth.get(cur)! + 1)
              nextQueue.push(next)
            }
          }
        }

        queue = nextQueue
      }
    }

    /**
     * @param cur 当前点
     * @param minFlow 路径上的最小流量
     * @returns 增广路径上的最小流量
     */
    function dfs(cur: Vertex, minFlow: number): number {
      if (cur === end) return minFlow
      let res = 0 // 从cur开始向后面流的最大的流量

      while (true) {
        if (res >= minFlow) break
        const next = curEdge.get(cur)!.next().value
        if (next == void 0) break
        const remainFlow = adjMap.get(cur)!.get(next)!
        if ((depth.get(next) ?? -1) === (depth.get(cur) ?? -1) + 1 && remainFlow > 0) {
          const nextFlow = dfs(next, Math.min(minFlow - res, remainFlow))
          if (nextFlow === 0) depth.set(next, -1)
          res += nextFlow
          let innerMap = adjMap.get(cur)!
          innerMap.set(next, innerMap.get(next)! - nextFlow)
          innerMap = adjMap.get(next)!
          innerMap.set(cur, innerMap.get(cur)! + nextFlow)
        }
      }

      return res
    }
  }

  function makeCurEdge(
    reGraph: Map<Vertex, Map<Vertex, number>>
  ): Map<Vertex, IterableIterator<Vertex>> {
    const res = new Map<Vertex, IterableIterator<Vertex>>()
    for (const key of reGraph.keys()) res.set(key, reGraph.get(key)!.keys())
    return res
  }

  return {
    addEdge,
    work,
    reGraph: adjMap,
  }
}

if (require.main === module) {
  const dinic = useDinic<number>(1, 7)
  const edges = [
    [1, 2, 5],
    [1, 3, 6],
    [1, 4, 5],
    [2, 3, 2],
    [2, 5, 3],
    [3, 2, 2],
    [3, 4, 3],
    [3, 5, 3],
    [3, 6, 7],
    [4, 6, 5],
    [5, 6, 1],
    [6, 5, 1],
    [5, 7, 8],
    [6, 7, 7],
  ]

  for (const [u, v, w] of edges) dinic.addEdge(u, v, w)
  assert.strictEqual(dinic.work(), 14)
}

export { useDinic }
