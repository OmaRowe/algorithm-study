package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
)

// 给出一个长为 n 的数列，以及 n 个操作，操作涉及区间加法，区间求和。
// 若 \mathrm{opt} = 0，表示将位于 [l, r] 的之间的数字都加 c。
// 若 \mathrm{opt} = 1，表示询问位于 [l, r] 的所有数字的和 \bmod (c+1)。

func main() {
	// https://loj.ac/p/6277
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var n int
	fmt.Fscan(in, &n)
	nums := make([]E, n)
	for i := range nums {
		fmt.Fscan(in, &nums[i])
	}

	sqrt := NewSqrtDecomposition(nums, 1+int(math.Sqrt(float64(n))))
	for i := 0; i < n; i++ {
		var op, l, r, c int
		fmt.Fscan(in, &op, &l, &r, &c)
		l--

		if op == 0 {
			sqrt.Update(l, r, c)
		} else {
			res := 0
			sqrt.Query(l, r, func(cur E) {
				res += cur
				res %= c + 1
			}, c+1)
			if res < 0 {
				res += c + 1
			}
			fmt.Fprintln(out, res)
		}
	}
}

type E = int  // 需要查询的值的类型
type Id = int // 懒标记的类型

// 例子:区间求和
type Block struct {
	// dont modify
	id, start, end int // 0 <= id < bs, 0 <= start <= end <= n
	nums           []E // block内的原序列

	// !to do
	sum     E
	lazyAdd Id
}

// 初始化块内数据(只会调用一次)
func (b *Block) Init() {
	b.Build()
}

// 重构
func (b *Block) Build() {
	b.sum = 0
	for i := range b.nums {
		b.sum += b.nums[i]
	}
}
func (b *Block) QueryPart(start, end int, k int) E {
	res := 0
	for i := start; i < end; i++ {
		res += b.nums[i] + b.lazyAdd // !查询时才加上懒标记
		res %= k
	}
	if res < 0 {
		res += k
	}
	return res
}
func (b *Block) UpdatePart(start, end int, lazy Id) {
	for i := start; i < end; i++ {
		b.nums[i] += lazy
	}
}
func (b *Block) QueryAll(k int) E {
	res := (b.sum + b.lazyAdd*(b.end-b.start)) % k
	if res < 0 {
		res += k
	}
	return res
}
func (b *Block) UpdateAll(lazy Id) { b.lazyAdd += lazy }

//
//
//
// dont modify the template below
//
//
//

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
