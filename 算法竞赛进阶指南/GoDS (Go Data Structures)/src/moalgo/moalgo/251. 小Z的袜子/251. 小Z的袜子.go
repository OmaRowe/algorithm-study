package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"sort"
)

type fraction struct {
	fenzi, fenmu int
}

// 251. 小Z的袜子
// https://www.acwing.com/problem/content/253/
func main() {
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var n, q int
	fmt.Fscan(in, &n, &q)
	nums := make([]int, n)
	for i := range nums {
		fmt.Fscan(in, &nums[i])
	}

	// 对于每个询问在一行中输出分数A/B
	// !表示从该询问的区间[L,R]中随机抽出两只袜子颜色相同的概率。
	// 若该概率为0则输出0/1，否则输出的A/B必须为最简分数。
	counter := [100010]int{}
	pair := 0

	mo := NewMoAlgo(n, q, op{
		add: func(i, _ int) {
			v := nums[i]
			pair += counter[v]
			counter[v]++
		},
		remove: func(i, _ int) {
			v := nums[i]
			pair -= counter[v] - 1
			counter[v]--
		},
		query: func(qLeft, qRight int) fraction {
			len_ := qRight - qLeft + 1
			gcd_ := gcd(pair, len_*(len_-1)/2)
			return fraction{pair / gcd_, len_ * (len_ - 1) / 2 / gcd_}
		},
	})

	for i := 0; i < q; i++ {
		var l, r int
		fmt.Fscan(in, &l, &r)
		l--
		r--
		mo.AddQuery(l, r)
	}

	res := mo.Work()
	for _, v := range res {
		fmt.Fprintln(out, fmt.Sprintf("%d/%d", v.fenzi, v.fenmu))
	}
}

func gcd(a, b int) int {
	if b == 0 {
		return a
	}
	return gcd(b, a%b)
}

// type V = interface{}
// type R = interface{}
type V = int
type R = fraction

type MoAlgo struct {
	queryOrder int
	chunkSize  int
	buckets    [][]query
	op         op
}

type query struct{ qi, left, right int }

type op struct {
	// 将数据添加到窗口
	add func(index, delta int)
	// 将数据从窗口中移除
	remove func(index, delta int)
	// 更新当前窗口的查询结果
	query func(qLeft, qRight int) R
}

func NewMoAlgo(n, q int, op op) *MoAlgo {
	chunkSize := max(1, n/int(math.Sqrt(float64(q))))
	buckets := make([][]query, n/chunkSize+1)
	return &MoAlgo{chunkSize: chunkSize, buckets: buckets, op: op}
}

// 0 <= left <= right < n
func (mo *MoAlgo) AddQuery(left, right int) {
	index := left / mo.chunkSize
	mo.buckets[index] = append(mo.buckets[index], query{mo.queryOrder, left, right + 1})
	mo.queryOrder++
}

// 返回每个查询的结果
func (mo *MoAlgo) Work() []R {
	buckets, q := mo.buckets, mo.queryOrder
	res := make([]R, q)
	left, right := 0, 0

	for i, bucket := range buckets {
		if i&1 == 1 {
			sort.Slice(bucket, func(i, j int) bool { return bucket[i].right > bucket[j].right })
		} else {
			sort.Slice(bucket, func(i, j int) bool { return bucket[i].right < bucket[j].right })
		}

		for _, q := range bucket {
			// !窗口扩张
			for left > q.left {
				left--
				mo.op.add(left, -1)
			}
			for right < q.right {
				mo.op.add(right, 1)
				right++
			}

			// !窗口收缩
			for left < q.left {
				mo.op.remove(left, 1)
				left++
			}
			for right > q.right {
				right--
				mo.op.remove(right, -1)
			}

			res[q.qi] = mo.op.query(q.left, q.right-1)
		}
	}

	return res
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
