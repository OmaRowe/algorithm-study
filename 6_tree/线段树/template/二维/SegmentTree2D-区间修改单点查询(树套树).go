// 树套树(线段树套动态开点线段树) 二维区间修改单点查询

package main

import (
	"fmt"
	"sort"
)

// https://leetcode.cn/problems/subrectangle-queries/
type SubrectangleQueries struct {
	seg *SegmentTree2D
}

func Constructor(rectangle [][]int) SubrectangleQueries {
	seg := NewSegmentTree2D(len(rectangle), len(rectangle[0]))
	for i, row := range rectangle {
		for j, v := range row {
			seg.Update(i, i, j, j, v)
		}
	}
	return SubrectangleQueries{seg: seg}
}

func (this *SubrectangleQueries) UpdateSubrectangle(row1 int, col1 int, row2 int, col2 int, newValue int) {
	this.seg.Update(row1, col1, row2, col2, newValue)
}

func (this *SubrectangleQueries) GetValue(row int, col int) int {
	return this.seg.Get(row, col)
}

func main() {
	obj := Constructor([][]int{{1, 2, 1}, {4, 3, 4}, {3, 2, 1}, {1, 1, 1}})
	fmt.Println(obj.GetValue(0, 2))
	obj.UpdateSubrectangle(0, 0, 3, 2, 5)
	fmt.Println(obj.GetValue(0, 2))
	fmt.Println(obj.GetValue(3, 1))
	obj.UpdateSubrectangle(3, 0, 3, 2, 10)
	fmt.Println(obj.GetValue(3, 1))
	fmt.Println(obj.GetValue(0, 2))

}

/**
 * Your SubrectangleQueries object will be instantiated and called as such:
 * obj := Constructor(rectangle);
 * obj.UpdateSubrectangle(row1,col1,row2,col2,newValue);
 * param_2 := obj.GetValue(row,col);
 */

// RangeAssignPointGet
const INF int = 1e18

type Id = int

func id() Id { return INF }
func composition(parent, child Id) Id {
	if parent == INF {
		return child
	}
	return parent
}

func sortedSet(xs []int) (getRank func(int) int) {
	set := make(map[int]struct{}, len(xs))
	for _, v := range xs {
		set[v] = struct{}{}
	}
	sorted := make([]int, 0, len(set))
	for k := range set {
		sorted = append(sorted, k)
	}
	sort.Ints(sorted)
	getRank = func(x int) int { return sort.SearchInts(sorted, x) }
	return
}

type SegmentTree2D struct {
	sz  int
	seg []*Node
}

// [0, row-1] * [0, col-1]
//  值域很大时,需要先将点离散化.
func NewSegmentTree2D(row, col int) *SegmentTree2D {
	sz := 1
	for sz < row {
		sz <<= 1
	}
	seg := make([]*Node, 2*sz-1)
	for i := range seg {
		seg[i] = CreateSegmentTree(0, col)
	}
	return &SegmentTree2D{sz: sz, seg: seg}
}

// (row1,col1) 到 (row2,col2) 闭区间更新.
//  0<=row1<row2<row, 0<=col1<col2<col
func (sg *SegmentTree2D) Update(row1, col1, row2, col2 int, val Id) {
	row2++
	col2++
	sg.update(row1, row2, col1, col2, val, 0, 0, sg.sz)
}

func (sg *SegmentTree2D) Get(row, col int) Id {
	row += sg.sz - 1
	res := sg.seg[row].Get(col)
	for row > 0 {
		row = (row - 1) >> 1
		res = composition(res, sg.seg[row].Get(col))
	}
	return res
}

func (sg *SegmentTree2D) update(a, b, lower, upper int, x Id, k, l, r int) {
	if r <= a || b <= l {
		return
	} else if a <= l && r <= b {
		sg.seg[k].Update(lower, upper-1, x) // 内部的动态开点线段树是左闭右闭区间, 所以这里要-1
	} else {
		sg.update(a, b, lower, upper, x, 2*k+1, l, (l+r)>>1)
		sg.update(a, b, lower, upper, x, 2*k+2, (l+r)>>1, r)
	}
}

//
//
//
// 指定区间上下界建立线段树
func CreateSegmentTree(lower, upper int) *Node {
	root := newNode(lower, upper)
	return root
}

type Node struct {
	left, right           int
	leftChild, rightChild *Node
	lazy                  Id
}

func (o *Node) Update(left, right int, lazy Id) {
	if left <= o.left && o.right <= right {
		o.lazy = composition(lazy, o.lazy)
		return
	}

	o.pushDown()
	mid := (o.left + o.right) >> 1
	if left <= mid {
		o.leftChild.Update(left, right, lazy)
	}
	if right > mid {
		o.rightChild.Update(left, right, lazy)
	}
}

func (o *Node) Get(pos int) Id {
	if o.left == o.right {
		return o.lazy
	}
	o.pushDown()
	mid := (o.left + o.right) >> 1
	if pos <= mid {
		return o.leftChild.Get(pos)
	}
	return o.rightChild.Get(pos)
}

func newNode(left, right int) *Node {
	return &Node{left: left, right: right, lazy: id()}
}

func (o *Node) pushDown() {
	mid := (o.left + o.right) >> 1
	if o.leftChild == nil {
		o.leftChild = newNode(o.left, mid)
	}
	if o.rightChild == nil {
		o.rightChild = newNode(mid+1, o.right)
	}
	if o.lazy != id() {
		o.leftChild.lazy = composition(o.lazy, o.leftChild.lazy)
		o.rightChild.lazy = composition(o.lazy, o.rightChild.lazy)
		o.lazy = id()
	}
}
