// !每次从未处理的数组中随机取一个元素，然后把该元素放到数组的尾部，即数组的尾部放的就是已经处理过的元素
// O(n)

/**
 *@description 用 Fisher-Yates 方法随机打乱数组。
 */
function shuffle<T>(arr: T[]): void {
  let n = arr.length
  while (n) {
    const rand = (Math.random() * n) | 0
    const tmp = arr[n - 1]
    arr[n - 1] = arr[rand]
    arr[rand] = tmp
    n--
  }
}

if (require.main === module) {
  const foo = [1, 2, 3, 4, 5, 6]
  shuffle(foo)
  console.log(foo)
}

export { shuffle }
