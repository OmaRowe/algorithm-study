// https://ei1333.github.io/library/structure/heap/skew-heap.hpp
// https://nyaannyaan.github.io/library/data-structure/skew-heap.hpp

// !用于有向图最小生成树
// https://judge.yosupo.jp/problem/directedmst
// 特点:
// !1. 任意两个堆可以合并成一个堆 (meld)
// !2. 对堆中所有元素加上一个值 (add)

// Build(nums []E) []*SkewHeapNode
// Alloc(key E, index int) *SkewHeapNode

// Meld(x, y *SkewHeapNode) *SkewHeapNode

// Push(t *SkewHeapNode, key E, index int) *SkewHeapNode
// Pop(t *SkewHeapNode) *SkewHeapNode
// Top(t *SkewHeapNode) E

// Add(t *SkewHeapNode, lazy E) *SkewHeapNode

package main

import "fmt"

func main() {
	sk := NewSkewHeap(true)
	heaps := sk.Build([]E{1, 2, 3, 4, 5, 6, 7, 8, 9, 10})
	fmt.Println(heaps[1].Value)
	sk.Add(heaps[1], 10)
	fmt.Println(heaps[1].Value)
	newRoot := sk.Meld(heaps[2], heaps[1])
	fmt.Println(newRoot.Value)

	for i := 0; i < 10; i++ {
		newRoot = sk.Push(newRoot, E(i), i)
	}
	fmt.Println(newRoot.Value)
	for i := 0; i < 10; i++ {
		newRoot = sk.Pop(newRoot)
		fmt.Println(newRoot.Value)
	}
}

type E = int

type SkewHeapNode struct {
	Value       E
	Id          int
	lazy        E
	left, right *SkewHeapNode
}

type SkewHeap struct {
	isMin bool
}

func NewSkewHeap(isMin bool) *SkewHeap {
	return &SkewHeap{isMin: isMin}
}

func (sk *SkewHeap) Build(nums []E) []*SkewHeapNode {
	res := make([]*SkewHeapNode, len(nums))
	for i := range nums {
		res[i] = sk.Alloc(nums[i], i)
	}
	return res
}

func (sk *SkewHeap) Alloc(key E, id int) *SkewHeapNode {
	return &SkewHeapNode{Value: key, Id: id}
}

// 将(key,index)插入堆中，返回插入后的堆
func (sk *SkewHeap) Push(t *SkewHeapNode, key E, id int) *SkewHeapNode {
	return sk.Meld(t, sk.Alloc(key, id))
}

// 删除堆顶元素,返回删除后的堆
func (sk *SkewHeap) Pop(t *SkewHeapNode) *SkewHeapNode {
	return sk.Meld(t.left, t.right)
}

func (sk *SkewHeap) Top(t *SkewHeapNode) E {
	return t.Value
}

// 将x与y合并，返回`融合`后的堆(会破坏原来的x,y)
func (sk *SkewHeap) Meld(x, y *SkewHeapNode) *SkewHeapNode {
	sk.propagate(x)
	sk.propagate(y)
	if x == nil {
		return y
	}
	if y == nil {
		return x
	}
	if (x.Value < y.Value) != sk.isMin {
		x, y = y, x
	}
	x.right = sk.Meld(y, x.right)
	x.left, x.right = x.right, x.left
	return x
}

func (sk *SkewHeap) Add(t *SkewHeapNode, lazy E) *SkewHeapNode {
	if t == nil {
		return t
	}
	t.lazy += lazy
	sk.propagate(t)
	return t
}

func (sk *SkewHeap) propagate(t *SkewHeapNode) *SkewHeapNode {
	if t != nil && t.lazy != 0 {
		if t.left != nil {
			t.left.lazy += t.lazy
		}
		if t.right != nil {
			t.right.lazy += t.lazy
		}
		t.Value += t.lazy
		t.lazy = 0
	}
	return t
}
