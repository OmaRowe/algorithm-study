// 将字符串s分成若干段,保证每段都是回文串(段数>=2)
// 求最长的回文串的最大值
// 2<=len(s)<=50

package main

import (
	"bufio"
	"fmt"
	"os"
)

const INF int = 1 << 60

func main() {
	// https://yukicoder.me/problems/no/273

	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var s string
	fmt.Fscan(in, &s)
	n := len(s)
	dp1 := make([]int, n+3) // dp1[i]表示以i回文树位置为结尾的最长回文串的长度
	for i := range dp1 {
		dp1[i] = -INF
	}
	dp2 := make([]int, n+1) // dp2[i]表示前i个字符的最长回文串的长度
	for i := range dp2 {
		dp2[i] = -INF
	}

	tree := NewPalindromicTree("")
	dp2[0] = 1
	for i := 0; i < n; i++ {
		tree.AddChar(s[i])
		res := tree.UpdateDp(func(pos, start int) {
			if i+1-start == n {
				dp1[pos] = dp2[start]
			} else {
				dp1[pos] = max(dp2[start], i+1-start)
			}
		}, func(pos, pre int) {
			if tree.Nodes[pos].Len == n {
				dp1[pos] = max(dp1[pos], dp1[pre])
			} else {
				dp1[pos] = max(dp1[pos], max(dp1[pre], tree.Nodes[pos].Len))
			}
		})
		for _, p := range res {
			dp2[i+1] = max(dp2[i+1], dp1[p])
		}
	}

	fmt.Fprintln(out, dp2[n])
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

type PalindromicTree struct {
	Chars []byte
	Nodes []*Node
	ptr   int // 新添加一个字母后所形成的最长回文后缀表示的节点
}

type Node struct {
	Len       int          // 结点代表的回文串的长度
	Indexes   []int        // 以哪些索引结尾的最长回文后缀是当前回文串
	Fail      int          // 指向当前回文串的最长回文后缀的位置
	next      map[byte]int // 当前回文串前后都加上字符c形成的回文串
	deltaLink int          // 以当前回文串结尾的长度不同的回文串的位置(ertre -> e)?
}

func NewPalindromicTree(s string) *PalindromicTree {
	res := &PalindromicTree{}
	res.Nodes = append(res.Nodes, res.newNode(0, -1)) // 長さ -1 (奇数)
	res.Nodes = append(res.Nodes, res.newNode(0, 0))  // 長さ 0 (偶数)
	res.AddString(s)
	return res
}

// !添加一个字符,返回以这个字符为后缀的最长回文串的位置pos.
func (pt *PalindromicTree) AddChar(x byte) int {
	pos := len(pt.Chars)
	pt.Chars = append(pt.Chars, x)
	// 如果在这个回文串前后都加上字符c形成的回文串原串的后缀,那么就添加儿子,否则就沿着fail指针往上找
	cur := pt.findPrevPalindrome(pt.ptr)
	_, hasKey := pt.Nodes[cur].next[x]
	if !hasKey {
		pt.Nodes[cur].next[x] = len(pt.Nodes)
	}
	pt.ptr = pt.Nodes[cur].next[x]
	if !hasKey {
		pt.Nodes = append(pt.Nodes, pt.newNode(-1, pt.Nodes[cur].Len+2))
		if pt.Nodes[len(pt.Nodes)-1].Len == 1 {
			pt.Nodes[len(pt.Nodes)-1].Fail = 1
		} else {
			pt.Nodes[len(pt.Nodes)-1].Fail = pt.Nodes[pt.findPrevPalindrome(pt.Nodes[cur].Fail)].next[x]
		}

		if pt.diff(pt.ptr) == pt.diff(pt.Nodes[len(pt.Nodes)-1].Fail) {
			pt.Nodes[len(pt.Nodes)-1].deltaLink = pt.Nodes[pt.Nodes[len(pt.Nodes)-1].Fail].deltaLink
		} else {
			pt.Nodes[len(pt.Nodes)-1].deltaLink = pt.Nodes[len(pt.Nodes)-1].Fail
		}
	}

	pt.Nodes[pt.ptr].Indexes = append(pt.Nodes[pt.ptr].Indexes, pos)
	return pt.ptr
}

func (pt *PalindromicTree) AddString(s string) {
	if len(s) == 0 {
		return
	}
	for i := 0; i < len(s); i++ {
		pt.AddChar(s[i])
	}
}

// 在每次调用AddChar(x)之后使用,更新dp.
//  - init(pos, start): 初始化顶点pos的dp值,对应回文串s[start:].
//  - apply(pos, prePos): 用prePos(fail指针指向的位置)更新pos.
//  返回值: 本次更新的回文串的顶点.
func (pt *PalindromicTree) UpdateDp(init func(int, int), apply func(int, int)) (update []int) {
	i := len(pt.Chars) - 1
	id := pt.ptr
	for pt.Nodes[id].Len > 0 {
		init(id, i+1-pt.Nodes[pt.Nodes[id].deltaLink].Len-pt.diff(id))
		if pt.Nodes[id].deltaLink != pt.Nodes[id].Fail {
			apply(id, pt.Nodes[id].Fail)
		}
		update = append(update, id)
		id = pt.Nodes[id].deltaLink
	}
	return
}

// 求出每个顶点代表的回文串出现的次数.
func (pt *PalindromicTree) GetFrequency() []int {
	res := make([]int, pt.Size())
	for i := pt.Size() - 1; i > 0; i-- {
		res[i] += len(pt.Nodes[i].Indexes)
		res[pt.Nodes[i].Fail] += res[i] // 长回文包含短回文
	}
	return res
}

// 以当前字符结尾的回文串个数.
func (pt *PalindromicTree) CountPalindromes() int {
	res := 0
	for i := 1; i < pt.Size(); i++ {
		res += len(pt.Nodes[i].Indexes)
	}
	return res
}

// 输出每个顶点代表的回文串.
func (pt *PalindromicTree) GetPalindrome(pos int) []string {
	if pos == 0 {
		return []string{"-1"}
	}
	if pos == 1 {
		return []string{"0"}
	}
	res := []byte{}
	pt.outputDfs(0, pos, &res)
	pt.outputDfs(1, pos, &res)
	start := len(res) - 1
	if pt.Nodes[pos].Len&1 == 1 {
		start--
	}
	for i := start; i >= 0; i-- {
		res = append(res, res[i])
	}
	return []string{string(res)}
}

// 回文树中的顶点个数.(包含两个奇偶虚拟顶点)
func (pt *PalindromicTree) Size() int {
	return len(pt.Nodes)
}

// 返回pos位置的回文串顶点.
func (pt *PalindromicTree) GetNode(pos int) *Node {
	return pt.Nodes[pos]
}

// 当前位置的回文串长度减去当前回文串的最长后缀回文串的长度.
func (pt *PalindromicTree) diff(pos int) int {
	if pt.Nodes[pos].Fail <= 0 {
		return -1
	}
	return pt.Nodes[pos].Len - pt.Nodes[pt.Nodes[pos].Fail].Len
}

func (pt *PalindromicTree) newNode(suf, pLen int) *Node {
	return &Node{
		next:      make(map[byte]int),
		Fail:      suf,
		Len:       pLen,
		deltaLink: -1,
	}
}

// 沿着失配指针找到第一个满足 x+s+x 是原串回文后缀的位置.
func (pt *PalindromicTree) findPrevPalindrome(cur int) int {
	pos := len(pt.Chars) - 1
	for {
		rev := pos - 1 - pt.Nodes[cur].Len
		if rev >= 0 && pt.Chars[rev] == pt.Chars[len(pt.Chars)-1] {
			break
		}
		cur = pt.Nodes[cur].Fail
	}
	return cur
}

func (pt *PalindromicTree) outputDfs(v, id int, res *[]byte) bool {
	if v == id {
		return true
	}
	for key, next := range pt.Nodes[v].next {
		if pt.outputDfs(next, id, res) {
			*res = append(*res, key)
			return true
		}
	}
	return false
}
