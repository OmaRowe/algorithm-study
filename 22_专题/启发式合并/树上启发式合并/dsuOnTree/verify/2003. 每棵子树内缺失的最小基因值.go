// 所有子树 mex (mex从1开始)

package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

func smallestMissingValueSubtree(parents []int, nums []int) []int {
	n := len(parents)
	tree := make([][]Edge, n)
	for i := 1; i < n; i++ {
		tree[parents[i]] = append(tree[parents[i]], Edge{parents[i], i, 0})
	}

	// sl := NewSortedList(func(a, b V) int { return a - b }, n)
	// 二分查找mex
	// findMex := func() int {
	// 	left, right := 0, sl.Len()-1
	// 	for left <= right {
	// 		mid := (left + right) >> 1
	// 		diff := sl.At(mid) - (mid + 1)
	// 		if diff >= 1 {
	// 			right = mid - 1
	// 		} else {
	// 			left = mid + 1
	// 		}
	// 	}
	// 	return left + 1
	// }

	res := make([]int, n)
	mex, counter := 1, map[int]int{}
	update := func(root int) {
		counter[nums[root]]++
		for counter[mex] > 0 {
			mex++
		}
	}
	query := func(root int) {
		res[root] = mex
	}
	clear := func(root int) {
		counter[nums[root]]--
		if counter[mex] == 0 && nums[root] < mex {
			mex = nums[root]
		}
	}
	reset := func() {}

	dfu := NewDSUonTree(tree, 0)
	dfu.Run(update, query, clear, reset)
	return res
}

type DSUonTree struct {
	g                        [][]Edge
	n                        int
	subSize, euler, down, up []int
	idx                      int
	root                     int
}

type Edge struct{ from, to, weight int }

func NewDSUonTree(tree [][]Edge, root int) *DSUonTree {
	res := &DSUonTree{
		g:       tree,
		n:       len(tree),
		subSize: make([]int, len(tree)),
		euler:   make([]int, len(tree)),
		down:    make([]int, len(tree)),
		up:      make([]int, len(tree)),
		root:    root,
	}

	res.dfs1(root, -1)
	res.dfs2(root, -1)
	return res
}

// update:添加root处的贡献
// query:查询root的子树的贡献并更新答案
// clear:退出轻儿子时清除root处的贡献
// reset:退出轻儿子时重置所有值(如果需要的话)
func (d *DSUonTree) Run(
	update func(root int),
	query func(root int),
	clear func(root int),
	reset func(),
) {
	var dsu func(cur, par int, keep bool)
	dsu = func(cur, par int, keep bool) {
		for i := 1; i < len(d.g[cur]); i++ {
			if to := d.g[cur][i].to; to != par {
				dsu(to, cur, false)
			}
		}

		if d.subSize[cur] != 1 {
			dsu(d.g[cur][0].to, cur, true)
		}

		if d.subSize[cur] != 1 {
			for i := d.up[d.g[cur][0].to]; i < d.up[cur]; i++ {
				update(d.euler[i])
			}
		}

		update(cur)
		query(cur)
		if !keep {
			for i := d.down[cur]; i < d.up[cur]; i++ {
				clear(d.euler[i])
			}
			if reset != nil {
				reset()
			}
		}
	}

	dsu(d.root, -1, false)
}

// 每个结点的欧拉序起点.
func (d *DSUonTree) Id(root int) int {
	return d.down[root]
}

func (d *DSUonTree) dfs1(cur, par int) int {
	d.subSize[cur] = 1
	if len(d.g[cur]) >= 2 && d.g[cur][0].to == par {
		d.g[cur][0], d.g[cur][1] = d.g[cur][1], d.g[cur][0]
	}
	for i := range d.g[cur] {
		next := d.g[cur][i].to
		if next == par {
			continue
		}
		d.subSize[cur] += d.dfs1(next, cur)
		if d.subSize[next] > d.subSize[d.g[cur][0].to] {
			d.g[cur][0], d.g[cur][i] = d.g[cur][i], d.g[cur][0]
		}
	}
	return d.subSize[cur]
}

func (d *DSUonTree) dfs2(cur, par int) {
	d.euler[d.idx] = cur
	d.down[cur] = d.idx
	d.idx++
	for i := range d.g[cur] {
		next := d.g[cur][i].to
		if next == par {
			continue
		}
		d.dfs2(next, cur)
	}
	d.up[cur] = d.idx
}

type V = int

// type Value = interface{}

type node struct {
	left, right int
	size        int
	priority    uint64
	value       V
}

type SortedList struct {
	seed       uint64
	root       int
	comparator func(a, b V) int
	nodes      []node
}

func NewSortedList(comparator func(a, b V) int, initCapacity int) *SortedList {
	sl := &SortedList{
		seed:       uint64(time.Now().UnixNano()/2 + 1),
		comparator: comparator,
		nodes:      make([]node, 0, max(initCapacity, 16)),
	}

	dummy := &node{size: 0, priority: sl.nextRand()} // dummy node 0
	sl.nodes = append(sl.nodes, *dummy)
	return sl
}

func (sl *SortedList) Build(nums []V) int {
	n := len(nums)
	keys := make([]int, 0, n)
	for i := 0; i < n; i++ {
		keys = append(keys, sl.newNode(nums[i]))
	}

	// 将元素按照键值 key 排序，然后一个一个插入到当前的笛卡尔树中
	sort.Slice(keys, func(i, j int) bool {
		return sl.comparator(sl.nodes[keys[i]].value, sl.nodes[keys[j]].value) < 0
	})

	stack := []int{}
	pre := make([]int, n)
	for i := 0; i < n; i++ {
		pre[i] = -1
	}

	for i := 0; i < n; i++ {
		last := -1
		for len(stack) > 0 && sl.nodes[stack[len(stack)-1]].priority > sl.nodes[keys[i]].priority {
			last = stack[len(stack)-1]
			stack = stack[:len(stack)-1]
		}

		if len(stack) > 0 {
			pre[i] = stack[len(stack)-1]
		}
		if last != -1 {
			pre[last] = i
		}

		stack = append(stack, i)
	}

	root := -1
	for i := 0; i < n; i++ {
		if pre[i] != -1 {
			if i < pre[i] {
				sl.nodes[keys[pre[i]]].left = keys[i]
			} else {
				sl.nodes[keys[pre[i]]].right = keys[i]
			}
		} else {
			root = i
		}
	}

	sl.root = keys[root]
	sl.build(sl.root)
	return sl.root
}

func (sl *SortedList) build(root int) {
	nodeRef := &sl.nodes[root]
	if nodeRef.left != 0 {
		sl.build(nodeRef.left)
	}
	if nodeRef.right != 0 {
		sl.build(nodeRef.right)
	}
	sl.pushUp(root)
}

func (sl *SortedList) pushUp(root int) {
	sl.nodes[root].size = sl.nodes[sl.nodes[root].left].size + sl.nodes[sl.nodes[root].right].size + 1
}

func (sl *SortedList) Add(value V) {
	var x, y, z int
	sl.splitByValue(sl.root, value, &x, &y, false)
	z = sl.newNode(value)
	sl.root = sl.merge(sl.merge(x, z), y)
}

func (sl *SortedList) At(index int) V {
	n := sl.Len()
	if index < 0 {
		index += n
	}
	if index < 0 || index >= n {
		panic(fmt.Sprintf("%d index out of range: [%d,%d]", index, 0, n-1))
	}
	return sl.nodes[sl.kthNode(sl.root, index+1)].value
}

func (sl *SortedList) Pop(index int) V {
	n := sl.Len()
	if index < 0 {
		index += n
	}

	index += 1 // dummy offset
	var x, y, z int
	sl.splitByRank(sl.root, index, &y, &z)
	sl.splitByRank(y, index-1, &x, &y)
	res := sl.nodes[y].value
	sl.root = sl.merge(x, z)
	return res
}

func (sl *SortedList) Discard(value V) {
	var x, y, z int
	sl.splitByValue(sl.root, value, &x, &z, false)
	sl.splitByValue(x, value, &x, &y, true)
	y = sl.merge(sl.nodes[y].left, sl.nodes[y].right)
	sl.root = sl.merge(sl.merge(x, y), z)
}

// Remove [start, stop) from list.
func (sl *SortedList) Erase(start, stop int) {
	var x, y, z int
	start++ // dummy offset
	sl.splitByRank(sl.root, stop, &y, &z)
	sl.splitByRank(y, start-1, &x, &y)
	sl.root = sl.merge(x, z)
}

func (sl *SortedList) BisectLeft(value V) int {
	var x, y int
	sl.splitByValue(sl.root, value, &x, &y, true)
	res := sl.nodes[x].size
	sl.root = sl.merge(x, y)
	return res
}

func (sl *SortedList) BisectRight(value V) int {
	var x, y int
	sl.splitByValue(sl.root, value, &x, &y, false)
	res := sl.nodes[x].size
	sl.root = sl.merge(x, y)
	return res
}

func (sl *SortedList) String() string {
	sb := []string{"SortedList{"}
	values := []string{}
	for i := 0; i < sl.Len(); i++ {
		values = append(values, fmt.Sprintf("%v", sl.At(i)))
	}
	sb = append(sb, strings.Join(values, ","), "}")
	return strings.Join(sb, "")
}

func (sl *SortedList) Len() int {
	return sl.nodes[sl.root].size
}

func (sl *SortedList) kthNode(root int, k int) int {
	cur := root
	for cur != 0 {
		if sl.nodes[sl.nodes[cur].left].size+1 == k {
			break
		} else if sl.nodes[sl.nodes[cur].left].size >= k {
			cur = sl.nodes[cur].left
		} else {
			k -= sl.nodes[sl.nodes[cur].left].size + 1
			cur = sl.nodes[cur].right
		}
	}
	return cur
}

func (sl *SortedList) splitByValue(root int, value V, x, y *int, strictLess bool) {
	if root == 0 {
		*x, *y = 0, 0
		return
	}

	if strictLess {
		if sl.comparator(sl.nodes[root].value, value) < 0 {
			*x = root
			sl.splitByValue(sl.nodes[root].right, value, &sl.nodes[root].right, y, strictLess)
		} else {
			*y = root
			sl.splitByValue(sl.nodes[root].left, value, x, &sl.nodes[root].left, strictLess)
		}
	} else {
		if sl.comparator(sl.nodes[root].value, value) <= 0 {
			*x = root
			sl.splitByValue(sl.nodes[root].right, value, &sl.nodes[root].right, y, strictLess)
		} else {
			*y = root
			sl.splitByValue(sl.nodes[root].left, value, x, &sl.nodes[root].left, strictLess)
		}
	}

	sl.pushUp(root)
}

// Split by rank.
// Split the tree rooted at root into two trees, x and y, such that the size of x is k.
// x is the left subtree, y is the right subtree.
func (sl *SortedList) splitByRank(root, k int, x, y *int) {
	if root == 0 {
		*x, *y = 0, 0
		return
	}

	if k <= sl.nodes[sl.nodes[root].left].size {
		*y = root
		sl.splitByRank(sl.nodes[root].left, k, x, &sl.nodes[root].left)
		sl.pushUp(*y)
	} else {
		*x = root
		sl.splitByRank(sl.nodes[root].right, k-sl.nodes[sl.nodes[root].left].size-1, &sl.nodes[root].right, y)
		sl.pushUp(*x)
	}
}

func (sl *SortedList) merge(x, y int) int {
	if x == 0 || y == 0 {
		return x + y
	}

	if sl.nodes[x].priority < sl.nodes[y].priority {
		sl.nodes[x].right = sl.merge(sl.nodes[x].right, y)
		sl.pushUp(x)
		return x
	}
	sl.nodes[y].left = sl.merge(x, sl.nodes[y].left)
	sl.pushUp(y)
	return y
}

// Return all elements in index order.
func (sl *SortedList) InOrder() []V {
	res := make([]V, 0, sl.Len())
	sl.inOrder(sl.root, &res)
	return res
}

func (sl *SortedList) inOrder(root int, res *[]V) {
	if root == 0 {
		return
	}
	sl.inOrder(sl.nodes[root].left, res)
	*res = append(*res, sl.nodes[root].value)
	sl.inOrder(sl.nodes[root].right, res)
}

func (sl *SortedList) newNode(value V) int {
	node := &node{
		value:    value,
		size:     1,
		priority: sl.nextRand(),
	}
	sl.nodes = append(sl.nodes, *node)
	return len(sl.nodes) - 1
}

// https://nyaannyaan.github.io/library/misc/rng.hpp
func (sl *SortedList) nextRand() uint64 {
	sl.seed ^= sl.seed << 7
	sl.seed ^= sl.seed >> 9
	return sl.seed
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
