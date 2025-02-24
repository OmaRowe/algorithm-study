import { FastSet } from '../../24_高级数据结构/珂朵莉树/FastSet'
import { bisectLeft, bisectRight } from '../../9_排序和搜索/二分/bisect'

function LIS(nums: ArrayLike<number>, isStrict = true): number {
  const n = nums.length
  if (n <= 1) return n

  const lis: number[] = []
  const bisect = isStrict ? bisectLeft : bisectRight
  for (let i = 0; i < n; i++) {
    const pos = bisect(lis, nums[i])
    if (pos === lis.length) {
      lis.push(nums[i])
    } else {
      lis[pos] = nums[i]
    }
  }

  return lis.length
}

/**
 * 求LIS 返回(LIS,LIS的组成下标).
 */
function getLIS(nums: ArrayLike<number>, isStrict = true): [lis: number[], lisIndex: number[]] {
  const n = nums.length

  const lis: number[] = [] // lis[i] 表示长度为 i 的上升子序列的最小末尾值
  const dpIndex = new Uint32Array(n) // 每个元素对应的LIS长度
  const bisect = isStrict ? bisectLeft : bisectRight
  for (let i = 0; i < n; i++) {
    const pos = bisect(lis, nums[i])
    if (pos === lis.length) {
      lis.push(nums[i])
    } else {
      lis[pos] = nums[i]
    }
    dpIndex[i] = pos
  }

  const res: number[] = []
  const resIndex: number[] = []
  let j = lis.length - 1
  for (let i = n - 1; i >= 0; i--) {
    if (dpIndex[i] === j) {
      res.push(nums[i])
      resIndex.push(i)
      j -= 1
    }
  }

  return [res.reverse(), resIndex.reverse()]
}

/**
 * O(nloglogmax)求`严格递增`的LIS,要求所有元素范围在`[0, max]`内.
 * @param nums 数组.
 * @param max 数组的最大值.不超过1e9.
 */
function LIS2Strict(nums: ArrayLike<number>, max: number): number {
  max += 5
  const alive = new FastSet(max)
  let res = 0

  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i]
    const next = alive.next(cur)
    if (next < max) {
      alive.erase(next)
      alive.insert(cur)
    } else {
      alive.insert(cur)
      res++
    }
  }
  return res
}

export { LIS, LIS2Strict, getLIS }

if (require.main === module) {
  // https://leetcode.cn/problems/longest-increasing-subsequence/
  // eslint-disable-next-line no-inner-declarations
  function lengthOfLIS(nums: number[]): number {
    for (let i = 0; i < nums.length; i++) nums[i] += 1e4
    return LIS2Strict(nums, 2e4)
    return LIS(nums)
  }

  const arr = [1, 2, 2, 3, 3, 3, 1]
  console.log(LIS2Strict(arr, 10))
  console.log(LIS2Strict(arr, 10))
  console.log(getLIS(arr))
}
