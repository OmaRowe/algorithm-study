import assert from 'assert'

type MergeFunc = (a: number, b: number) => number

/**
 * @summary st表适用于可重复贡献问题/RMQ静态区间最值查询
 * @description 可重复贡献问题是指对于运算`opt`，满足`x opt x = x`，则对应的区间询问就是一个可重复贡献问题。
 *
 * 例如，最大值有 `max(a,a) = a`，gcd有 `gcd(a,a) = a` ，所以RMQ和区间GCD就是一个可重复贡献问题。
 * 像区间和就不具有这个性质，如果求区间和的时候采用的预处理区间重叠了，则会导致重曼部分被计算两次，这是我们所不愿意看到的。
 * 另外，opt还必须满足结合律才能使用ST表求解。
 *
 * @see {@link https://oi-wiki.org/ds/sparse-table/}
 */
class SparseTable {
  private readonly _size: number
  private readonly _mergeFunc: MergeFunc
  private readonly _dp: number[][]

  constructor(nums: ArrayLike<number>, mergeFunc: MergeFunc) {
    const n = nums.length
    const upper = Math.ceil(Math.log2(n)) + 1

    this._size = n
    this._mergeFunc = mergeFunc
    this._dp = Array.from({ length: n }, () => Array(upper).fill(0))
    for (let i = 0; i < n; i++) this._dp[i][0] = nums[i]

    for (let j = 1; j < upper; j++) {
      for (let i = 0; i < n; i++) {
        if (i + (1 << (j - 1)) >= n) break
        this._dp[i][j] = this._mergeFunc(this._dp[i][j - 1], this._dp[i + (1 << (j - 1))][j - 1])
      }
    }
  }

  /**
   * @returns [`left`,`right`] 闭区间的贡献值
   * @param left 0 <= left <= right < nums.length
   * @param right 0 <= left <= right < nums.length
   */
  query(left: number, right: number): number {
    // this._checkBoundsBeginEnd(left, right)
    const k = Math.floor(Math.log2(right - left + 1))
    return this._mergeFunc(this._dp[left][k], this._dp[right - (1 << k) + 1][k])
  }

  private _checkBoundsBeginEnd(begin: number, end: number): void {
    if (begin >= 0 && begin <= end && end < this._size) return
    throw new RangeError(`invalid range [${begin}, ${end}]`)
  }
}

if (require.main === module) {
  const st = new SparseTable([9, 12, 3, 7, 15], (a, b) => Math.max(a, b))
  assert.strictEqual(st.query(0, 0), 9)
  assert.strictEqual(st.query(0, 2), 12)
  assert.strictEqual(st.query(0, 4), 15)
}

export { SparseTable }
