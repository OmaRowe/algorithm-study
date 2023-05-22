// https://ei1333.github.io/library/other/mo-tree.hpp
// https://oi-wiki.org/misc/mo-algo-on-tree/
// https://github.com/EndlessCheng/codeforces-go/blob/53262fb81ffea176cd5f039cec71e3bd266dce83/copypasta/mo.go#L301
// 处理树上的路径相关的离线查询.
// 一般的莫队只能处理线性问题，我们要把树强行压成序列。
// 通过欧拉序(括号序)转化成序列上的查询，然后用莫队解决。

package main

import (
	"fmt"
	"math"
	"math/bits"
	"sort"
	"strings"
)

// https://github.com/EndlessCheng/codeforces-go/blob/53262fb81ffea176cd5f039cec71e3bd266dce83/copypasta/mo.go#L301

type MoOnTree struct {
	tree    [][]Edge
	root    int
	in, vs  []int
	queries [][2]int
}

type Edge struct{ to, weight int }

func NewMoOnTree(tree [][]Edge, root int) *MoOnTree {
	return &MoOnTree{tree: tree, root: root}
}

// 添加从顶点u到顶点v的查询.
func (mo *MoOnTree) AddQuery(u, v int) { mo.queries = append(mo.queries, [2]int{u, v}) }

// 处理每个查询.
//  add: 将数据添加到窗口.
//  remove: 将数据从窗口移除.
//  query: 查询窗口内的数据.
func (mo *MoOnTree) Run(add func(rootId int), remove func(rootId int), query func(qid int)) {
	n := len(mo.tree)
	q := len(mo.queries)

	vs := make([]int, 0, 2*n)
	tin := make([]int, n)
	tout := make([]int, n)

	var initTime func(v, fa int)
	initTime = func(v, fa int) {
		tin[v] = len(vs)
		vs = append(vs, v)
		for _, w := range mo.tree[v] {
			to := w.to
			if to != fa {
				initTime(to, v)
			}
		}
		tout[v] = len(vs)
		vs = append(vs, v)
	}
	initTime(mo.root, -1)
	lca := offlineLCA(mo.tree, mo.queries, mo.root)
	blockSize := int(math.Ceil(float64(2*n) / math.Sqrt(float64(q)))) // int(math.Round(math.Pow(float64(2*n), 2.0/3)))
	type Q struct{ lb, l, r, lca, qid int }
	qs := make([]Q, len(mo.queries))
	for i := range qs {
		v, w := mo.queries[i][0], mo.queries[i][1]
		if tin[v] > tin[w] {
			v, w = w, v
		}
		if lca_ := lca[i]; lca_ != v {
			qs[i] = Q{tout[v] / blockSize, tout[v], tin[w] + 1, lca_, i}
		} else {
			qs[i] = Q{tin[v] / blockSize, tin[v], tin[w] + 1, -1, i}
		}
	}

	sort.Slice(qs, func(i, j int) bool {
		a, b := qs[i], qs[j]
		if a.lb != b.lb {
			return a.lb < b.lb
		}
		if a.lb&1 == 0 {
			return a.r < b.r
		}
		return a.r > b.r
	})

	flip := make([]bool, n)
	f := func(u int) {
		flip[u] = !flip[u]
		if flip[u] {
			add(u)
		} else {
			remove(u)
		}
	}

	l, r := 0, 0
	for _, q := range qs {
		for ; r < q.r; r++ {
			f(vs[r])
		}
		for ; l < q.l; l++ {
			f(vs[l])
		}
		for l > q.l {
			l--
			f(vs[l])
		}
		for r > q.r {
			r--
			f(vs[r])
		}
		if q.lca >= 0 {
			f(q.lca)
		}
		query(q.qid)
		if q.lca >= 0 {
			f(q.lca)
		}
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// LCA离线.
func offlineLCA(graph [][]Edge, queries [][2]int, root int) []int {
	n := len(graph)
	ufa := newUnionFindArray(n)
	st, mark, ptr, res := make([]int, n), make([]int, n), make([]int, n), make([]int, len(queries))
	for i := 0; i < len(queries); i++ {
		res[i] = -1
	}
	top := 0
	st[top] = root
	for _, q := range queries {
		mark[q[0]]++
		mark[q[1]]++
	}
	q := make([][][2]int, n)
	for i := 0; i < n; i++ {
		q[i] = make([][2]int, 0, mark[i])
		mark[i] = -1
		ptr[i] = len(graph[i])
	}
	for i := range queries {
		q[queries[i][0]] = append(q[queries[i][0]], [2]int{queries[i][1], i})
		q[queries[i][1]] = append(q[queries[i][1]], [2]int{queries[i][0], i})
	}

	run := func(u int) bool {
		for ptr[u] != 0 {
			v := graph[u][ptr[u]-1].to
			ptr[u]--
			if mark[v] == -1 {
				top++
				st[top] = v
				return true
			}
		}
		return false
	}

	for top != -1 {
		u := st[top]
		if mark[u] == -1 {
			mark[u] = u
		} else {
			ufa.Union(u, graph[u][ptr[u]].to)
			mark[ufa.Find(u)] = u
		}

		if !run(u) {
			for _, v := range q[u] {
				if mark[v[0]] != -1 && res[v[1]] == -1 {
					res[v[1]] = mark[ufa.Find(v[0])]
				}
			}
			top--
		}
	}

	return res
}

func newUnionFindArray(n int) *_unionFindArray {
	parent, rank := make([]int, n), make([]int, n)
	for i := 0; i < n; i++ {
		parent[i] = i
		rank[i] = 1
	}

	return &_unionFindArray{
		Part:   n,
		rank:   rank,
		n:      n,
		parent: parent,
	}
}

type _unionFindArray struct {
	// 连通分量的个数
	Part int

	rank   []int
	n      int
	parent []int
}

func (ufa *_unionFindArray) Union(key1, key2 int) bool {
	root1, root2 := ufa.Find(key1), ufa.Find(key2)
	if root1 == root2 {
		return false
	}

	if ufa.rank[root1] > ufa.rank[root2] {
		root1, root2 = root2, root1
	}
	ufa.parent[root1] = root2
	ufa.rank[root2] += ufa.rank[root1]
	ufa.Part--
	return true
}

func (ufa *_unionFindArray) Find(key int) int {
	for ufa.parent[key] != key {
		ufa.parent[key] = ufa.parent[ufa.parent[key]]
		key = ufa.parent[key]
	}
	return key
}

func (ufa *_unionFindArray) IsConnected(key1, key2 int) bool {
	return ufa.Find(key1) == ufa.Find(key2)
}

func (ufa *_unionFindArray) GetGroups() map[int][]int {
	groups := make(map[int][]int)
	for i := 0; i < ufa.n; i++ {
		root := ufa.Find(i)
		groups[root] = append(groups[root], i)
	}
	return groups
}

func (ufa *_unionFindArray) Size(key int) int {
	return ufa.rank[ufa.Find(key)]
}

func (ufa *_unionFindArray) String() string {
	sb := []string{"unionFindArray:"}
	for root, member := range ufa.GetGroups() {
		cur := fmt.Sprintf("%d: %v", root, member)
		sb = append(sb, cur)
	}
	sb = append(sb, fmt.Sprintf("Part: %d", ufa.Part))
	return strings.Join(sb, "\n")
}

type BitArray struct {
	n    int
	log  int
	data []int
}

// 長さ n の 0で初期化された配列で構築する.
func NewBitArray(n int) *BitArray {
	return &BitArray{n: n, log: bits.Len(uint(n)), data: make([]int, n+1)}
}

// 配列で構築する.
func NewBitArrayFrom(arr []int) *BitArray {
	res := NewBitArray(len(arr))
	res.Build(arr)
	return res
}

func (b *BitArray) Build(arr []int) {
	if b.n != len(arr) {
		panic("len of arr is not equal to n")
	}
	for i := 1; i <= b.n; i++ {
		b.data[i] = arr[i-1]
	}
	for i := 1; i <= b.n; i++ {
		j := i + (i & -i)
		if j <= b.n {
			b.data[j] += b.data[i]
		}
	}
}

// 要素 i に値 v を加える.
func (b *BitArray) Apply(i int, v int) {
	for i++; i <= b.n; i += i & -i {
		b.data[i] += v
	}
}

// [0, r) の要素の総和を求める.
func (b *BitArray) Prod(r int) int {
	res := int(0)
	for ; r > 0; r -= r & -r {
		res += b.data[r]
	}
	return res
}

// [l, r) の要素の総和を求める.
func (b *BitArray) ProdRange(l, r int) int {
	return b.Prod(r) - b.Prod(l)
}

// 区間[0,k]の総和がx以上となる最小のkを求める.数列が単調増加であることを要求する.
func (b *BitArray) LowerBound(x int) int {
	i := 0
	for k := 1 << uint(b.log); k > 0; k >>= 1 {
		if i+k <= b.n && b.data[i+k] < x {
			x -= b.data[i+k]
			i += k
		}
	}
	return i
}

// 区間[0,k]の総和がxを上回る最小のkを求める.数列が単調増加であることを要求する.
func (b *BitArray) UpperBound(x int) int {
	i := 0
	for k := 1 << uint(b.log); k > 0; k >>= 1 {
		if i+k <= b.n && b.data[i+k] <= x {
			x -= b.data[i+k]
			i += k
		}
	}
	return i
}

func (b *BitArray) String() string {
	sb := []string{}
	for i := 0; i < b.n; i++ {
		sb = append(sb, fmt.Sprintf("%d", b.ProdRange(i, i+1)))
	}
	return fmt.Sprintf("BitArray: [%v]", strings.Join(sb, ", "))
}
