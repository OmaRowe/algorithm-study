// SqrtDecomposition
// https://nyaannyaan.github.io/library/data-structure/square-root-decomposition.hpp

package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"sort"
)

func main() {
	// https://www.luogu.com.cn/problem/P2801
	// n<=1e6 q<=3000 k<=1e9
	// !区间更新:加法 区间查询:大于等于k的元素个数
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var n, q int
	fmt.Fscan(in, &n, &q)

	nums := make([]E, n)
	for i := range nums {
		fmt.Fscan(in, &nums[i])
	}

	sqrt := NewSqrtDecomposition(nums, 1+int(math.Sqrt(float64(n))))
	for i := 0; i < q; i++ {
		var op string
		fmt.Fscan(in, &op)
		if op == "M" {
			var start, end, add int
			fmt.Fscan(in, &start, &end, &add)
			start--
			sqrt.Update(start, end, add)
		} else {
			var start, end, k int
			fmt.Fscan(in, &start, &end, &k)
			start--
			res := 0
			sqrt.Query(start, end, func(cur E) { res += cur }, k) // 查询区间内大于等于k的元素个数
			fmt.Fprintln(out, res)
		}
	}
}

type E = int
type Id = int

type Block struct {
	// dont modify
	id, start, end int
	nums           []E // block内的原序列

	sorted  []E // 排序后的序列
	lazyAdd Id
}

// 初始化块内数据(只会调用一次)
func (b *Block) Init() {
	b.Build()
}

// 重构
func (b *Block) Build() {
	b.sorted = append(b.sorted[:0:0], b.nums...)
	sort.Ints(b.sorted)
}
func (b *Block) UpdateAll(lazy Id) { b.lazyAdd += lazy }
func (b *Block) UpdatePart(start, end int, lazy Id) {
	for i := start; i < end; i++ {
		b.nums[i] += lazy
	}
}
func (b *Block) QueryAll(k int) E {
	lower := sort.SearchInts(b.sorted, k-b.lazyAdd)
	return len(b.sorted) - lower
}
func (b *Block) QueryPart(start, end int, k int) E {
	res := 0
	for i := start; i < end; i++ {
		if b.nums[i]+b.lazyAdd >= k {
			res++
		}
	}
	return res
}

type SqrtDecomposition struct {
	n      int
	bs     int
	bls    []Block
	belong []int
}

// 指定维护的序列和分块大小初始化.
//
//	blockSize:分块大小,一般取根号n(300)
func NewSqrtDecomposition(nums []E, blockSize int) *SqrtDecomposition {
	nums = append(nums[:0:0], nums...)
	res := &SqrtDecomposition{
		n:      len(nums),
		bs:     blockSize,
		bls:    make([]Block, len(nums)/blockSize+1),
		belong: make([]int, len(nums)),
	}
	for i := range res.belong {
		res.belong[i] = i / blockSize
	}
	for i := range res.bls {
		res.bls[i].id = i
		res.bls[i].start = i * blockSize
		res.bls[i].end = min((i+1)*blockSize, len(nums))
		res.bls[i].nums = nums[res.bls[i].start:res.bls[i].end]
		res.bls[i].Init()
	}
	return res
}

// 更新左闭右开区间[start,end)的值.
//
//	0<=start<=end<=n
func (s *SqrtDecomposition) Update(start, end int, lazy Id) {
	if start >= end {
		return
	}
	id1, id2 := s.belong[start], s.belong[end-1]
	pos1, pos2 := start-s.bs*id1, end-s.bs*id2
	if id1 == id2 {
		s.bls[id1].UpdatePart(pos1, pos2, lazy)
		s.bls[id1].Build()
	} else {
		s.bls[id1].UpdatePart(pos1, s.bs, lazy)
		s.bls[id1].Build()
		for i := id1 + 1; i < id2; i++ {
			s.bls[i].UpdateAll(lazy)
		}
		s.bls[id2].UpdatePart(0, pos2, lazy)
		s.bls[id2].Build()
	}
}

// 查询左闭右开区间[start,end)的值.
//
//	0<=start<=end<=n
func (s *SqrtDecomposition) Query(start, end int, cb func(blockRes E), k int) {
	if start >= end {
		return
	}
	id1, id2 := s.belong[start], s.belong[end-1]
	pos1, pos2 := start-s.bs*id1, end-s.bs*id2
	if id1 == id2 {
		cb(s.bls[id1].QueryPart(pos1, pos2, k))
		return
	}
	cb(s.bls[id1].QueryPart(pos1, s.bs, k))
	for i := id1 + 1; i < id2; i++ {
		cb(s.bls[i].QueryAll(k))
	}
	cb(s.bls[id2].QueryPart(0, pos2, k))
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
