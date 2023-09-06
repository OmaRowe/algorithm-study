package main

import (
	"bufio"
	"container/heap"
	"fmt"
	"os"
)

func main() {
	// https://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=GRL_6_A
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var n, m int
	fmt.Fscan(in, &n, &m)
	mf := NewPushRelabel(n)
	for i := 0; i < m; i++ {
		var u, v, c int
		fmt.Fscan(in, &u, &v, &c)
		mf.AddEdge(u, v, c)
	}

	fmt.Fprintln(out, mf.MaxFlow(0, n-1))
}

const INF int = 1e18

type edge struct{ to, rid, cap int }

type PushRelabel struct {
	graph [][]edge
}

func NewPushRelabel(n int) *PushRelabel {
	return &PushRelabel{
		graph: make([][]edge, n),
	}
}

func (pr *PushRelabel) AddEdge(from, to, cap int) {
	pr.graph[from] = append(pr.graph[from], edge{to, len(pr.graph[to]), cap})
	pr.graph[to] = append(pr.graph[to], edge{from, len(pr.graph[from]) - 1, 0})
}

func (pr *PushRelabel) MaxFlow(s, t int) int {
	n := len(pr.graph)
	dist := make([]int, n)
	for i := range dist {
		dist[i] = -1
	}

	dist[t] = 0
	cd := make([]int, 2*n)
	queue := []int{t}
	for len(queue) > 0 {
		v := queue[0]
		queue = queue[1:]
		cd[dist[v]]++
		for _, e := range pr.graph[v] {
			if w := e.to; dist[w] < 0 {
				dist[w] = dist[v] + 1
				queue = append(queue, w)
			}
		}
	}
	dist[s] = n

	exFlow := make([]int, n)
	pq := hp{d: dist}
	inQueue := make([]bool, n)
	push := func(v, f int, e *edge) {
		w := e.to
		e.cap -= f
		pr.graph[w][e.rid].cap += f
		exFlow[v] -= f
		exFlow[w] += f
		if w != s && w != t && !inQueue[w] {
			pq.push(w)
			inQueue[w] = true
		}
	}

	for i := range pr.graph[s] {
		if e := &pr.graph[s][i]; e.cap > 0 {
			push(s, e.cap, e)
		}
	}

	for pq.Len() > 0 {
		v := pq.pop()
		inQueue[v] = false
	o:
		for {
			for i := range pr.graph[v] {
				if e := &pr.graph[v][i]; e.cap > 0 && dist[e.to] < dist[v] {
					push(v, min(e.cap, exFlow[v]), e)
					if exFlow[v] == 0 {
						break o
					}
				}
			}

			dv := dist[v]
			if dv != -1 {
				if cd[dv]--; cd[dv] == 0 {
					for i, h := range dist {
						if i != s && i != t && dv < h && h <= n {
							dist[i] = n + 1
						}
					}
				}
			}

			minD := INF
			for _, e := range pr.graph[v] {
				if w := e.to; e.cap > 0 && dist[w] < minD {
					minD = dist[w]
				}
			}
			dist[v] = minD + 1
			cd[dist[v]]++
		}
	}

	return exFlow[t]
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

type hp struct{ vs, d []int }

func (h hp) Len() int              { return len(h.vs) }
func (h hp) Less(i, j int) bool    { return h.d[h.vs[i]] > h.d[h.vs[j]] }
func (h hp) Swap(i, j int)         { h.vs[i], h.vs[j] = h.vs[j], h.vs[i] }
func (h *hp) Push(v interface{})   { h.vs = append(h.vs, v.(int)) }
func (h *hp) Pop() (v interface{}) { a := h.vs; h.vs, v = a[:len(a)-1], a[len(a)-1]; return }
func (h *hp) push(v int)           { heap.Push(h, v) }
func (h *hp) pop() int             { return heap.Pop(h).(int) }
