import { BinaryTree } from '../Tree'
import { deserializeNode } from '../构建类/297二叉树的序列化与反序列化'

/**
 * @param {BinaryTree} root
 * @return {BinaryTree}
 * @description
 * 对位于 (row, col) 的每个结点而言，
 * 其左右子结点分别位于 (row + 1, col - 1) 和 (row + 1, col + 1) 。
 * 树的根结点位于 (0, 0) 。
 * @description 为了先记录最左边的信息，采用中序遍历
 */
const verticalTraversal = (root: BinaryTree | null): number[][] => {
  if (!root) return []

  const tmp: [number, number, number][] = []
  const inOrder = (root: BinaryTree, x: number, y: number) => {
    root.left && inOrder(root.left, x - 1, y + 1)
    tmp.push([x, y, root.val])
    root.right && inOrder(root.right, x + 1, y + 1)
  }
  inOrder(root, 0, 0)
  tmp.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  // x值为key的map
  const map = new Map<number, number[]>()
  for (const item of tmp) {
    map.set(item[0], map.get(item[0])?.concat(item[2]) || [item[2]])
  }

  return [...map.values()]
}

console.dir(verticalTraversal(deserializeNode([3, 9, 20, null, null, 15, 7])!), {
  depth: null,
})
// 输出：[[9],[3,15],[20],[7]]

export {}
