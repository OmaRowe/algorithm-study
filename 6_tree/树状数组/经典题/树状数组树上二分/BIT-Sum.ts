/* eslint-disable no-param-reassign */

/**
 * 单点更新, 区间查询，维护加法群的树状数组.
 */
class BitSumGroup {
  private _data!: number[]
  private _total!: number
  private readonly _n: number

  /**
   * @param nOrArr 长度或者数组.
   */
  constructor(nOrArr: number | number[]) {
    let defaultArray: number[]
    if (typeof nOrArr === 'number') {
      const base = Array(nOrArr)
      for (let i = 0; i < nOrArr; i++) base[i] = 0
      defaultArray = base
    } else {
      defaultArray = nOrArr
    }

    this._n = defaultArray.length
    this.build(defaultArray)
  }

  /**
   * 对arr进行修改，构建树状数组.
   */
  build(arr: number[]) {
    const n = arr.length
    for (let i = 1; i <= n; i++) {
      const j = i + (i & -i)
      if (j <= n) arr[j - 1] += arr[i - 1]
    }
    this._data = arr
    this._total = this.queryPrefix(n)
  }

  queryAll(): number {
    return this._total
  }

  /**
   * [0, right)的和.
   */
  queryPrefix(right: number): number {
    if (right > this._n) right = this._n
    let res = 0
    while (right > 0) {
      res += this._data[right - 1]
      right &= right - 1
    }
    return res
  }

  /**
   * [left, right)的和.
   */
  queryRange(left: number, right: number): number {
    if (left < 0) left = 0
    if (right > this._n) right = this._n
    if (left === 0) return this.queryPrefix(right)
    if (left > right) return 0
    let pos = 0
    let neg = 0
    while (right > left) {
      pos += this._data[right - 1]
      right &= right - 1
    }
    while (left > right) {
      neg += this._data[left - 1]
      left &= left - 1
    }
    return pos - neg
  }

  update(index: number, lazy: number) {
    this._total += lazy
    for (index++; index <= this._n; index += index & -index) {
      this._data[index - 1] += lazy
    }
  }

  /**
   * 返回最大的 right 使得 `check(QueryPrefix(right)) == true`.
   * @param check check(preSum, right): preSum 对应的是 [0, right) 的和.
   *
   * @example
   * ```ts
   * const fw = new BitGroup(10)
   * fw.maxRight(preSum => preSum <= 10)
   */
  maxRight(check: (preSum: number, right: number) => boolean): number {
    let i = 0
    let cur = 0
    let k = 1
    while (k << 1 <= this._n) k <<= 1
    while (k > 0) {
      if (i + k - 1 < this._n) {
        const t = cur + this._data[i + k - 1]
        if (check(t, i + k)) {
          i += k
          cur = t
        }
      }
      k >>= 1
    }
    return i
  }

  toString(): string {
    const res: string[] = []
    for (let i = 0; i < this._n; i++) {
      res.push(`${this.queryRange(i, i + 1)}`)
    }
    return `FenwickTree[${res}]`
  }
}

export { BitSumGroup }

if (require.main === module) {
  const bit = new BitSumGroup(10)
  console.log(bit.toString())
  // https://leetcode.cn/problems/longest-uploaded-prefix/

  class LUPrefix {
    private readonly _bit: BitSumGroup
    constructor(n: number) {
      this._bit = new BitSumGroup(n)
    }

    upload(video: number): void {
      this._bit.update(video, 1)
    }

    longest(): number {
      return this._bit.maxRight((preSum, right) => preSum >= right)
    }
  }
}
