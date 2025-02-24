// #region
type Comparator<T, R extends 'number' | 'boolean'> = (
  a: T,
  b: T
) => R extends 'number' ? number : boolean

interface ITreapMultiSet<T> extends Iterable<T> {
  add: (...value: T[]) => this
  has: (value: T) => boolean
  delete: (value: T) => void

  bisectLeft: (value: T) => number
  bisectRight: (value: T) => number

  indexOf: (value: T) => number
  lastIndexOf: (value: T) => number

  at: (index: number) => T | undefined
  first: () => T | undefined
  last: () => T | undefined

  lower: (value: T) => T | undefined
  higher: (value: T) => T | undefined
  floor: (value: T) => T | undefined
  ceil: (value: T) => T | undefined

  shift: () => T | undefined
  pop: (index?: number) => T | undefined

  count: (value: T) => number

  keys: () => IterableIterator<T>
  values: () => IterableIterator<T>
  rvalues: () => IterableIterator<T>
  entries: () => IterableIterator<[number, T]>

  readonly size: number
}

class TreapNode<T = number> {
  value: T
  count: number
  size: number
  priority: number
  left: TreapNode<T> | null
  right: TreapNode<T> | null

  constructor(value: T) {
    this.value = value
    this.count = 1
    this.size = 1
    this.priority = Math.random()
    this.left = null
    this.right = null
  }

  static getSize(node: TreapNode<any> | null): number {
    return node?.size ?? 0
  }

  static getFac(node: TreapNode<any> | null): number {
    return node?.priority ?? 0
  }

  pushUp(): void {
    let tmp = this.count
    tmp += TreapNode.getSize(this.left)
    tmp += TreapNode.getSize(this.right)
    this.size = tmp
  }

  rotateRight(): TreapNode<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreapNode<T> = this
    const left = node.left
    node.left = left?.right ?? null
    left && (left.right = node)
    left && (node = left)
    node.right?.pushUp()
    node.pushUp()
    return node
  }

  rotateLeft(): TreapNode<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: TreapNode<T> = this
    const right = node.right
    node.right = right?.left ?? null
    right && (right.left = node)
    right && (node = right)
    node.left?.pushUp()
    node.pushUp()
    return node
  }
}

class TreapMultiSet<T = number> implements ITreapMultiSet<T> {
  private readonly root: TreapNode<T>
  private readonly compareFn: Comparator<T, 'number'>
  private readonly leftBound: T
  private readonly rightBound: T

  /**
   *
   * @param compareFn A compare function which returns boolean or number
   * @param leftBound defalut value is `-Infinity`
   * @param rightBound defalut value is `Infinity`
   * @description
   * create a `MultiSet`, compare elements using `compareFn`, which is increasing order by default.
   * @example
   * ```ts
   * interface Person {
        name: string
        age: number
    }

    const leftBound = {
        name: 'Alice',
        age: -Infinity,
    }

    const rightBound = {
        name: 'Bob',
        age: Infinity,
    }

    const sortedList = new TreapMultiSet<Person>(
        (a: Person, b: Person) => a.age - b.age,
        leftBound,
        rightBound
    )
   * ```
   */
  constructor(compareFn?: Comparator<T, 'number'>)
  constructor(compareFn: Comparator<T, 'number'>, leftBound: T, rightBound: T)
  constructor(
    compareFn: Comparator<T, any> = (a: any, b: any) => a - b,
    leftBound: any = -Infinity,
    rightBound: any = Infinity
  ) {
    this.root = new TreapNode<T>(rightBound)
    this.root.priority = Infinity
    this.root.left = new TreapNode<T>(leftBound)
    this.root.left.priority = -Infinity
    this.root.pushUp()

    this.leftBound = leftBound
    this.rightBound = rightBound
    this.compareFn = compareFn
  }

  get size(): number {
    return this.root.size - 2
  }

  get height(): number {
    const getHeight = (node: TreapNode<T> | null): number => {
      if (node == null) return 0
      return 1 + Math.max(getHeight(node.left), getHeight(node.right))
    }

    return getHeight(this.root)
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns true if value is a member.
   */
  has(value: T): boolean {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): boolean => {
      if (node == null) return false
      if (compare(node.value, value) === 0) return true
      if (compare(node.value, value) < 0) return dfs(node.right, value)
      return dfs(node.left, value)
    }

    return dfs(this.root, value)
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Add value to sorted set.
   */
  add(...values: T[]): this {
    const compare = this.compareFn
    const dfs = (
      node: TreapNode<T> | null,
      value: T,
      parent: TreapNode<T>,
      direction: 'left' | 'right'
    ): void => {
      if (node == null) return
      if (compare(node.value, value) === 0) {
        node.count++
        node.pushUp()
      } else if (compare(node.value, value) > 0) {
        if (node.left) {
          dfs(node.left, value, node, 'left')
        } else {
          node.left = new TreapNode(value)
          node.pushUp()
        }

        if (TreapNode.getFac(node.left) > node.priority) {
          parent[direction] = node.rotateRight()
        }
      } else if (compare(node.value, value) < 0) {
        if (node.right) {
          dfs(node.right, value, node, 'right')
        } else {
          node.right = new TreapNode(value)
          node.pushUp()
        }

        if (TreapNode.getFac(node.right) > node.priority) {
          parent[direction] = node.rotateLeft()
        }
      }
      parent.pushUp()
    }

    values.forEach(value => dfs(this.root.left, value, this.root, 'left'))
    return this
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Remove value from sorted set if it is a member.
   * If value is not a member, do nothing.
   */
  delete(value: T): void {
    const compare = this.compareFn
    const dfs = (
      node: TreapNode<T> | null,
      value: T,
      parent: TreapNode<T>,
      direction: 'left' | 'right'
    ): void => {
      if (node == null) return

      if (compare(node.value, value) === 0) {
        if (node.count > 1) {
          node.count--
          node?.pushUp()
        } else if (node.left == null && node.right == null) {
          parent[direction] = null
        } else {
          // 旋到根节点
          if (node.right == null || TreapNode.getFac(node.left) > TreapNode.getFac(node.right)) {
            parent[direction] = node.rotateRight()
            dfs(parent[direction]?.right ?? null, value, parent[direction]!, 'right')
          } else {
            parent[direction] = node.rotateLeft()
            dfs(parent[direction]?.left ?? null, value, parent[direction]!, 'left')
          }
        }
      } else if (compare(node.value, value) > 0) {
        dfs(node.left, value, node, 'left')
      } else if (compare(node.value, value) < 0) {
        dfs(node.right, value, node, 'right')
      }

      parent?.pushUp()
    }

    dfs(this.root.left, value, this.root, 'left')
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns an index to insert value in the sorted set.
   * If the value is already present, the insertion point will be before (to the left of) any existing values.
   */
  bisectLeft(value: T): number {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): number => {
      if (node == null) return 0

      if (compare(node.value, value) === 0) {
        return TreapNode.getSize(node.left)
      } else if (compare(node.value, value) > 0) {
        return dfs(node.left, value)
      } else if (compare(node.value, value) < 0) {
        return dfs(node.right, value) + TreapNode.getSize(node.left) + node.count
      }

      return 0
    }

    // 因为有个lowerBound 所以-1
    return dfs(this.root, value) - 1
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns an index to insert value in the sorted set.
   * If the value is already present, the insertion point will be before (to the right of) any existing values.
   */
  bisectRight(value: T): number {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): number => {
      if (node == null) return 0

      if (compare(node.value, value) === 0) {
        return TreapNode.getSize(node.left) + node.count
      } else if (compare(node.value, value) > 0) {
        return dfs(node.left, value)
      } else if (compare(node.value, value) < 0) {
        return dfs(node.right, value) + TreapNode.getSize(node.left) + node.count
      }

      return 0
    }

    // 因为有个lowerBound 所以-1
    return dfs(this.root, value) - 1
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns the index of the first occurrence of a value in the set, or -1 if it is not present.
   */
  indexOf(value: T): number {
    const compare = this.compareFn
    let isExist = false

    const dfs = (node: TreapNode<T> | null, value: T): number => {
      if (node == null) return 0

      if (compare(node.value, value) === 0) {
        isExist = true
        return TreapNode.getSize(node.left)
      } else if (compare(node.value, value) > 0) {
        return dfs(node.left, value)
      } else if (compare(node.value, value) < 0) {
        return dfs(node.right, value) + TreapNode.getSize(node.left) + node.count
      }

      return 0
    }

    // 因为有个lowerBound 所以-1
    const res = dfs(this.root, value) - 1
    return isExist ? res : -1
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns the index of the last occurrence of a value in the set, or -1 if it is not present.
   */
  lastIndexOf(value: T): number {
    const compare = this.compareFn
    let isExist = false

    const dfs = (node: TreapNode<T> | null, value: T): number => {
      if (node == null) return 0

      if (compare(node.value, value) === 0) {
        isExist = true
        return TreapNode.getSize(node.left) + node.count - 1
      } else if (compare(node.value, value) > 0) {
        return dfs(node.left, value)
      } else if (compare(node.value, value) < 0) {
        return dfs(node.right, value) + TreapNode.getSize(node.left) + node.count
      }

      return 0
    }

    const res = dfs(this.root, value) - 1
    return isExist ? res : -1
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): T | undefined {
    if (index < 0) index += this.size
    if (index < 0 || index >= this.size) return undefined

    const dfs = (node: TreapNode<T> | null, rank: number): T | undefined => {
      if (node == null) return undefined

      if (TreapNode.getSize(node.left) >= rank) {
        return dfs(node.left, rank)
      } else if (TreapNode.getSize(node.left) + node.count >= rank) {
        return node.value
      } else {
        return dfs(node.right, rank - TreapNode.getSize(node.left) - node.count)
      }
    }

    const res = dfs(this.root, index + 2)
    return ([this.leftBound, this.rightBound] as any[]).includes(res) ? undefined : res
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Find and return the element less than `val`, return `undefined` if no such element found.
   */
  lower(value: T): T | undefined {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): T | undefined => {
      if (node == null) return undefined
      if (compare(node.value, value) >= 0) return dfs(node.left, value)

      const tmp = dfs(node.right, value)
      if (tmp == null || compare(node.value, tmp) > 0) {
        return node.value
      } else {
        return tmp
      }
    }

    const res = dfs(this.root, value) as any
    return res === this.leftBound ? undefined : res
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Find and return the element greater than `val`, return `undefined` if no such element found.
   */
  higher(value: T): T | undefined {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): T | undefined => {
      if (node == null) return undefined
      if (compare(node.value, value) <= 0) return dfs(node.right, value)

      const tmp = dfs(node.left, value)

      if (tmp == null || compare(node.value, tmp) < 0) {
        return node.value
      } else {
        return tmp
      }
    }

    const res = dfs(this.root, value) as any
    return res === this.rightBound ? undefined : res
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Find and return the element less than or equal to `val`, return `undefined` if no such element found.
   */
  floor(value: T): T | undefined {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): T | undefined => {
      if (node == null) return undefined
      if (compare(node.value, value) === 0) return node.value
      if (compare(node.value, value) >= 0) return dfs(node.left, value)

      const tmp = dfs(node.right, value)
      if (tmp == null || compare(node.value, tmp) > 0) {
        return node.value
      } else {
        return tmp
      }
    }

    const res = dfs(this.root, value) as any
    return res === this.leftBound ? undefined : res
  }

  /**
   *
   * @complexity `O(logn)`
   * @description Find and return the element greater than or equal to `val`, return `undefined` if no such element found.
   */
  ceil(value: T): T | undefined {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): T | undefined => {
      if (node == null) return undefined
      if (compare(node.value, value) === 0) return node.value
      if (compare(node.value, value) <= 0) return dfs(node.right, value)

      const tmp = dfs(node.left, value)

      if (tmp == null || compare(node.value, tmp) < 0) {
        return node.value
      } else {
        return tmp
      }
    }

    const res = dfs(this.root, value) as any
    return res === this.rightBound ? undefined : res
  }

  /**
   * @complexity `O(logn)`
   * @description
   * Returns the last element from set.
   * If the set is empty, undefined is returned.
   */
  first(): T | undefined {
    const iter = this.inOrder()
    iter.next()
    const res = iter.next().value
    return res === this.rightBound ? undefined : res
  }

  /**
   * @complexity `O(logn)`
   * @description
   * Returns the last element from set.
   * If the set is empty, undefined is returned .
   */
  last(): T | undefined {
    const iter = this.reverseInOrder()
    iter.next()
    const res = iter.next().value
    return res === this.leftBound ? undefined : res
  }

  /**
   * @complexity `O(logn)`
   * @description
   * Removes the first element from an set and returns it.
   * If the set is empty, undefined is returned and the set is not modified.
   */
  shift(): T | undefined {
    const first = this.first()
    if (first === undefined) return undefined
    this.delete(first)
    return first
  }

  /**
   * @complexity `O(logn)`
   * @description
   * Removes the last element from an set and returns it.
   * If the set is empty, undefined is returned and the set is not modified.
   */
  pop(index?: number): T | undefined {
    if (index == null) {
      const last = this.last()
      if (last === undefined) return undefined
      this.delete(last)
      return last
    }

    const toDelete = this.at(index)
    if (toDelete == null) return
    this.delete(toDelete)
    return toDelete
  }

  /**
   *
   * @complexity `O(logn)`
   * @description
   * Returns number of occurrences of value in the sorted set.
   */
  count(value: T): number {
    const compare = this.compareFn
    const dfs = (node: TreapNode<T> | null, value: T): number => {
      if (node == null) return 0
      if (compare(node.value, value) === 0) return node.count
      if (compare(node.value, value) < 0) return dfs(node.right, value)
      return dfs(node.left, value)
    }

    return dfs(this.root, value)
  }

  *[Symbol.iterator](): Generator<T, any, any> {
    yield* this.values()
  }

  /**
   * @description
   * Returns an iterable of keys in the set.
   */
  *keys(): Generator<T, any, any> {
    yield* this.values()
  }

  /**
   * @description
   * Returns an iterable of values in the set.
   */
  *values(): Generator<T, any, any> {
    const iter = this.inOrder()
    iter.next()
    const steps = this.size
    for (let _ = 0; _ < steps; _++) {
      yield iter.next().value
    }
  }

  /**
   * @description
   * Returns a generator for reversed order traversing the set.
   */
  *rvalues(): Generator<T, any, any> {
    const iter = this.reverseInOrder()
    iter.next()
    const steps = this.size
    for (let _ = 0; _ < steps; _++) {
      yield iter.next().value
    }
  }

  /**
   * @description
   * Returns an iterable of key, value pairs for every entry in the set.
   */
  *entries(): IterableIterator<[number, T]> {
    const iter = this.inOrder()
    iter.next()
    const steps = this.size
    for (let i = 0; i < steps; i++) {
      yield [i, iter.next().value]
    }
  }

  private *inOrder(root: TreapNode<T> | null = this.root): Generator<T, any, any> {
    if (root == null) return
    yield* this.inOrder(root.left)
    const count = root.count
    for (let _ = 0; _ < count; _++) {
      yield root.value
    }
    yield* this.inOrder(root.right)
  }

  private *reverseInOrder(root: TreapNode<T> | null = this.root): Generator<T, any, any> {
    if (root == null) return
    yield* this.reverseInOrder(root.right)
    const count = root.count
    for (let _ = 0; _ < count; _++) {
      yield root.value
    }
    yield* this.reverseInOrder(root.left)
  }
}
// #endregion

// 树套树
class SegmentTree {
  private readonly tree: TreapMultiSet[]
  private readonly nums: number[]
  private readonly size: number

  /**
   * @param size 区间右边界
   * @param nums 初始化数组
   */
  constructor(size: number, nums: number[]) {
    this.size = size
    this.nums = nums.slice()
    this.tree = Array.from({ length: size << 2 }, () => new TreapMultiSet())
    this._build(1, 1, this.size, nums)
  }

  /**
   * @description [l,r]里查询num的前驱
   */
  query(l: number, r: number, num: number): number {
    return this._query(1, l, r, 1, this.size, num)
  }

  /**
   * @description 将 pos 位置的数修改为 target。
   */
  update(pos: number, target: number): void {
    if (this.nums[pos - 1] === target) return

    this._update(1, pos, pos, 1, this.size, this.nums[pos - 1], target)
    this.nums[pos - 1] = target
  }

  private _build(root: number, left: number, right: number, nums: number[]): void {
    this.tree[root].add(-Infinity, Infinity)
    for (let i = left; i <= right; i++) {
      this.tree[root].add(nums[i - 1])
    }

    if (left === right) return

    const mid = Math.floor((left + right) / 2)
    this._build(root << 1, left, mid, nums)
    this._build((root << 1) | 1, mid + 1, right, nums)
  }

  private _query(rt: number, L: number, R: number, l: number, r: number, num: number): number {
    if (L <= l && r <= R) return this.tree[rt].lower(num) ?? -Infinity

    const mid = Math.floor((l + r) / 2)

    let res = -Infinity
    if (L <= mid) res = Math.max(res, this._query(rt << 1, L, R, l, mid, num))
    if (mid < R) res = Math.max(res, this._query((rt << 1) | 1, L, R, mid + 1, r, num))

    return res
  }

  private _update(
    rt: number,
    L: number,
    R: number,
    l: number,
    r: number,
    from: number,
    to: number
  ): void {
    this.tree[rt].delete(from)
    this.tree[rt].add(to)
    if (L <= l && r <= R) {
      return
    }

    const mid = Math.floor((l + r) / 2)

    if (L <= mid) this._update(rt << 1, L, R, l, mid, from, to)
    if (mid < R) this._update((rt << 1) | 1, L, R, mid + 1, r, from, to)
  }
}

if (require.main === module) {
  const nums = [3, 4, 2, 1, 5]
  const tree = new SegmentTree(nums.length, nums)
  console.log(tree.query(2, 4, 4)) // 2
  tree.update(3, 5)
  console.log(tree.query(2, 4, 4)) // 1
}

export {}
