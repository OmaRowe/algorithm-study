golang 实现
**GoDS (Go Data Structures)\src\tree\fhqtreap\persistentfhqtreap**

[[模板] FHQ Treap 与可持久化平衡树](https://www.limstash.com/articles/201902/1231)

Treap 和 Splay 是两种常用的平衡树，它们都通过旋转来保证树的平衡，从而使得每次查询的复杂度为均摊 O(logn)

但是正是因为它们需要`旋转来保证时间复杂度`，在可持久化平衡树时给我们带来了麻烦，而 FHQ Treap 是一种非旋转二叉树，它基于函数式编程的思想，**由 split 和 merge 维护平衡树**

- Split: 将一棵树分成两棵树，一棵树的所有节点的值都小于等于 x，另一棵树的所有节点的值都大于 x
- Merge: 将两棵树合并成一棵树,其中 x 树中每个数均小于等于 y 树，那么按照随机附加域的大小进行合并

因为 FHQ Treap **不需要旋转，因此可以支持可持久化(拓扑结构不发生变化)**，与其他可持久化数据结构一样，我们使用一个 root 数组来表示不同版本对应的根
FHQ Treap 的持久化只需要**在 Split 过程中，基于原树复制一个一样的节点**，再进行操作

https://baobaobear.github.io/post/20191215-fhq-treap/
!163 普通平衡树 FHQ Treap https://www.bilibili.com/video/BV1kY4y1j7LC
164 文艺平衡树 FHQ Treap https://www.bilibili.com/video/BV1pd4y1D7Nu
169 可持久化平衡树 https://www.bilibili.com/video/BV1sB4y1L79D
