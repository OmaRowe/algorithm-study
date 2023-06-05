/**
 * @see {@link https://github.com/EndlessCheng/codeforces-go/blob/master/copypasta/bits.go}
 */
class BitSet {
  static from(arrayLike: ArrayLike<number | string>): BitSet {
    const bitSet = new BitSet(arrayLike.length)
    for (let i = 0; i < arrayLike.length; i++) {
      if (Number(arrayLike[i]) === 1) {
        bitSet.add(i)
      }
    }
    return bitSet
  }

  // lowbit.bit_length() - 1
  private static _trailingZeros32(uint32: number): number {
    if (uint32 === 0) return 32
    return 31 - Math.clz32(uint32 & -uint32) // bitLength32(uint32 & -uint32) - 1
  }
  private static _onesCount32(uint32: number): number {
    uint32 -= (uint32 >>> 1) & 0x55555555
    uint32 = (uint32 & 0x33333333) + ((uint32 >>> 2) & 0x33333333)
    return (((uint32 + (uint32 >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
  }
  private static _bitLength32(uint32: number): number {
    return 32 - Math.clz32(uint32)
  }

  private readonly _bits: Uint32Array
  private readonly _n: number

  constructor(n: number) {
    this._bits = new Uint32Array((n >> 5) + 1)
    this._n = n
  }

  add(i: number): void {
    this._bits[i >> 5] |= 1 << (i & 31)
  }

  /**
   * [start, end) 范围内的位置为 1
   */
  addRange(start: number, end: number): void {
    const maskL = ~0 << (start & 31)
    const maskR = ~0 << (end & 31)
    let i = start >> 5
    if (i === end >> 5) {
      this._bits[i] |= maskL ^ maskR
      return
    }
    this._bits[i] |= maskL
    for (i++; i < end >> 5; i++) {
      this._bits[i] = ~0
    }
    this._bits[i] |= ~maskR
  }

  has(i: number): boolean {
    return !!(this._bits[i >> 5] & (1 << (i & 31)))
  }

  discard(i: number): void {
    this._bits[i >> 5] &= ~(1 << (i & 31))
  }

  /**
   * [start, end) 范围内的位置为 0
   */
  discardRange(start: number, end: number): void {
    const maskL = ~0 << (start & 31)
    const maskR = ~0 << (end & 31)
    let i = start >> 5
    if (i === end >> 5) {
      this._bits[i] &= ~maskL | maskR
      return
    }
    this._bits[i] &= ~maskL
    for (i++; i < end >> 5; i++) {
      this._bits[i] = 0
    }
    this._bits[i] &= maskR
  }

  flip(i: number): void {
    this._bits[i >> 5] ^= 1 << (i & 31)
  }

  /**
   * [start, end) 范围内的位取反
   */
  flipRange(start: number, end: number): void {
    const maskL = ~0 << (start & 31)
    const maskR = ~0 << (end & 31)
    let i = start >> 5
    if (i === end >> 5) {
      this._bits[i] ^= maskL ^ maskR
      return
    }
    this._bits[i] ^= maskL
    for (i++; i < end >> 5; i++) {
      this._bits[i] = ~this._bits[i]
    }
    this._bits[i] ^= ~maskR
  }

  clear(): void {
    this._bits.fill(0)
  }

  /**
   * [start, end) 范围内是否全为 1
   */
  allOne(start: number, end: number): boolean {
    let i = start >> 5
    if (i === end >> 5) {
      const mask = (~0 << (start & 31)) ^ (~0 << (end & 31))
      return (this._bits[i] & mask) === mask
    }
    let mask = ~0 << (start & 31)
    if ((this._bits[i] & mask) !== mask) {
      return false
    }
    for (i++; i < end >> 5; i++) {
      if (~this._bits[i]) {
        return false
      }
    }
    mask = ~0 << (end & 31)
    return !~(this._bits[end >> 5] | mask)
  }

  /**
   * [start, end) 范围内是否全为 0
   */
  allZero(start: number, end: number): boolean {
    let i = start >> 5
    if (i === end >> 5) {
      const mask = (~0 << (start & 31)) ^ (~0 << (end & 31))
      return !(this._bits[i] & mask)
    }
    if (this._bits[i] >> (start & 31)) {
      return false
    }
    for (i++; i < end >> 5; i++) {
      if (this._bits[i]) {
        return false
      }
    }
    const mask = ~0 << (end & 31)
    return !(this._bits[end >> 5] & ~mask)
  }

  /**
   * 返回第一个 0 的下标，若不存在则返回-1
   * @param position 从哪个位置开始查找
   */
  indexOfZero(position = 0): number {
    if (position === 0) {
      return this._indexOfZero()
    }

    let i = position >> 5
    if (i < this._bits.length) {
      let v = this._bits[i]
      if (position & 31) {
        v |= ~(~0 << (position & 31))
      }
      if (~v) {
        const res = (i << 5) | BitSet._trailingZeros32(~v)
        return res < this._n ? res : -1
      }
      for (i++; i < this._bits.length; i++) {
        if (~this._bits[i]) {
          const res = (i << 5) | BitSet._trailingZeros32(~this._bits[i])
          return res < this._n ? res : -1
        }
      }
    }

    return -1
  }

  /**
   * 返回第一个 1 的下标，若不存在则返回-1
   * @param position 从哪个位置开始查找
   */
  indexOfOne(position = 0): number {
    if (!position) {
      return this._indexOfOne()
    }

    // eslint-disable-next-line space-in-parens
    for (let i = position >> 5; i < this._bits.length; ) {
      const v = this._bits[i] & (~0 << (position & 31))
      if (v) {
        return (i << 5) | BitSet._trailingZeros32(v)
      }
      for (i++; i < this._bits.length; i++) {
        if (this._bits[i]) {
          return (i << 5) | BitSet._trailingZeros32(this._bits[i])
        }
      }
    }

    return -1
  }

  /**
   * 返回 [start, end) 范围内 1 的个数
   */
  onesCount(start = 0, end = this._n): number {
    if (start < 0) {
      start = 0
    }
    if (end > this._n) {
      end = this._n
    }
    if (!start && end === this._n) {
      return this._onesCount()
    }

    let pos1 = start >> 5
    const pos2 = end >> 5
    if (pos1 === pos2) {
      return BitSet._onesCount32(this._bits[pos1] & (~0 << (start & 31)) & ((1 << (end & 31)) - 1))
    }

    let count = 0
    if ((start & 31) > 0) {
      count += BitSet._onesCount32(this._bits[pos1] & (~0 << (start & 31)))
      pos1++
    }
    for (let i = pos1; i < pos2; i++) {
      count += BitSet._onesCount32(this._bits[i])
    }
    if ((end & 31) > 0) {
      count += BitSet._onesCount32(this._bits[pos2] & ((1 << (end & 31)) - 1))
    }
    return count
  }

  equals(other: BitSet): boolean {
    if (this._bits.length !== other._bits.length) {
      return false
    }
    for (let i = 0; i < this._bits.length; i++) {
      if (this._bits[i] !== other._bits[i]) {
        return false
      }
    }
    return true
  }

  isSubset(other: BitSet): boolean {
    if (this._bits.length > other._bits.length) {
      return false
    }
    for (let i = 0; i < this._bits.length; i++) {
      if ((this._bits[i] & other._bits[i]) >>> 0 !== this._bits[i]) {
        return false
      }
    }
    return true
  }

  isSuperset(other: BitSet): boolean {
    if (this._bits.length < other._bits.length) {
      return false
    }
    for (let i = 0; i < other._bits.length; i++) {
      if ((this._bits[i] & other._bits[i]) >>> 0 !== other._bits[i]) {
        return false
      }
    }
    return true
  }

  ior(other: BitSet): void {
    for (let i = 0; i < this._bits.length; i++) {
      this._bits[i] |= other._bits[i]
    }
  }

  or(other: BitSet): BitSet {
    const res = new BitSet(this._bits.length)
    for (let i = 0; i < this._bits.length; i++) {
      res._bits[i] = this._bits[i] | other._bits[i]
    }
    return res
  }

  iand(other: BitSet): void {
    for (let i = 0; i < this._bits.length; i++) {
      this._bits[i] &= other._bits[i]
    }
  }

  and(other: BitSet): BitSet {
    const res = new BitSet(this._bits.length)
    for (let i = 0; i < this._bits.length; i++) {
      res._bits[i] = this._bits[i] & other._bits[i]
    }
    return res
  }

  copy(): BitSet {
    const res = new BitSet(this._n)
    res._bits.set(this._bits)
    return res
  }

  bitLength(): number {
    return this._lastIndexOfOne() + 1
  }

  toString(): string {
    const sb: string[] = []
    for (let i = 0; i < this._bits.length; i++) {
      // eslint-disable-next-line newline-per-chained-call
      let bits = this._bits[i].toString(2).padStart(32, '0').split('').reverse().join('')
      if (i === this._bits.length - 1) {
        bits = bits.slice(0, this._n & 31)
      }
      sb.push(bits)
    }
    return sb.join('')
  }

  _indexOfZero(): number {
    for (let i = 0; i < this._bits.length; i++) {
      const x = this._bits[i]
      if (~x) {
        return (i << 5) | BitSet._trailingZeros32(~x)
      }
    }
    return -1
  }

  _indexOfOne(): number {
    for (let i = 0; i < this._bits.length; i++) {
      const x = this._bits[i]
      if (x) {
        return (i << 5) | BitSet._trailingZeros32(x)
      }
    }
    return -1
  }

  _lastIndexOfOne(): number {
    for (let i = this._bits.length - 1; i >= 0; i--) {
      const x = this._bits[i]
      if (x) {
        return (i << 5) | (BitSet._bitLength32(x) - 1)
      }
    }
    return -1
  }

  _onesCount(): number {
    let count = 0
    for (let i = 0; i < this._bits.length; i++) {
      count += BitSet._onesCount32(this._bits[i])
    }
    return count
  }
}

// 给你一个整数 n 和一个下标从 0 开始的 二维数组 queries ，其中 queries[i] = [typei, indexi, vali] 。

// 一开始，给你一个下标从 0 开始的 n x n 矩阵，所有元素均为 0 。每一个查询，你需要执行以下操作之一：

// 如果 typei == 0 ，将第 indexi 行的元素全部修改为 vali ，覆盖任何之前的值。
// 如果 typei == 1 ，将第 indexi 列的元素全部修改为 vali ，覆盖任何之前的值。
// 请你执行完所有查询以后，返回矩阵中所有整数的和。

function matrixSumQueries(n: number, queries: number[][]): number {
  const visited = new BitSet(n * n)
  let res = 0

  for (let i = queries.length - 1; ~i; i--) {
    const [type, index, val] = queries[i]
    if (type === 0) {
      for (let j = 0; j < n; j++) {
        const pos = index * n + j
        if (!visited.has(pos)) {
          visited.add(pos)
          res += val
        }
      }
    } else {
      for (let j = 0; j < n; j++) {
        const pos = j * n + index
        if (!visited.has(pos)) {
          visited.add(pos)
          res += val
        }
      }
    }
  }

  return res
}

const n = 1e4
const q = 5e4
const qs = Array(q)
  .fill(0)
  .map(() => [
    Math.random() < 0.5 ? 0 : 1,
    Math.floor(Math.random() * n),
    Math.floor(Math.random() * 1e5)
  ])

console.time('matrixSumQueries')
matrixSumQueries(n, qs)
console.timeEnd('matrixSumQueries')