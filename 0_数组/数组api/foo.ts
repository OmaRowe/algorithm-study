function maximizeGreatness(nums: number[]): number {
  const pool = useSortedList('UINT32', { arrayLike: nums })
  let res = 0
  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i]
    const upper = pool.bisectRight(cur)
    if (upper < pool.length) {
      pool.pop(upper)
      res++
    } else {
      pool.pop(0)
    }
  }
  return res
}
const ARRAYTYPE_RECORD = {
  INT8: Int8Array,
  UIN8: Uint8Array,
  INT16: Int16Array,
  UINT16: Uint16Array,
  INT32: Int32Array,
  UINT32: Uint32Array,
  FLOAT32: Float32Array,
  FLOAT64: Float64Array
}

type DataType = keyof typeof ARRAYTYPE_RECORD

interface Options {
  initialCapacity?: number
  arrayLike?: ArrayLike<number>
}

/**
 * !typedArray 操作介绍, 不要实际使用
 *
 * @param dataType {@link DataType}
 * @param options {@link Options}
 */
function useMutableTypedArray(dataType: DataType, options?: Options) {
  const { initialCapacity = 1 << 4, arrayLike = [] } = options || {}

  const arrayType = ARRAYTYPE_RECORD[dataType]
  let _elementData = new arrayType(initialCapacity)
  _ensureCapacity(arrayLike.length)
  _elementData.set(arrayLike)
  let _length = arrayLike.length

  function at(index: number): number {
    const newIndex = _normalizeIndex(index)
    _rangeCheck(newIndex)
    return _elementData[newIndex]
  }

  function set(index: number, value: number): void {
    const newIndex = _normalizeIndex(index)
    _rangeCheck(newIndex)
    _elementData[newIndex] = value
  }

  function pop(index = -1): number {
    const newIndex = _normalizeIndex(index)
    _rangeCheck(newIndex)
    const popped = _elementData[newIndex]
    _elementData.copyWithin(newIndex, newIndex + 1, _length)
    _length--
    return popped
  }

  function popleft(): number {
    return pop(0)
  }

  function insert(index: number, value: number): void {
    const newIndex = _normalizeIndex(index)
    _rangeCheckForAdd(newIndex)
    _ensureCapacity(_length + 1)
    _elementData.copyWithin(newIndex + 1, newIndex, _length)
    _elementData[newIndex] = value
    _length++
  }

  function append(value: number): void {
    insert(_length, value)
  }

  function appendleft(value: number): void {
    insert(0, value)
  }

  function slice(start: number, end?: number): InstanceType<typeof ARRAYTYPE_RECORD[DataType]> {
    return _elementData.slice(start, end)
  }

  function subarray(start: number, end?: number): InstanceType<typeof ARRAYTYPE_RECORD[DataType]> {
    return _elementData.subarray(start, end)
  }

  return {
    at,
    set,
    pop,
    insert,
    append,
    popleft,
    appendleft,
    slice,
    subarray,
    get length(): number {
      return _length
    },
    toString(): string {
      return _elementData.subarray(0, _length).toString()
    }
  }

  function _normalizeIndex(index: number): number {
    if (index < 0) {
      index += _length
    }

    return index
  }

  function _rangeCheck(index: number): void {
    if (index < 0 || index >= _length) {
      throw new RangeError(`index ${index} is out of range ${[0, _length - 1]}`)
    }
  }

  function _rangeCheckForAdd(addedIndex: number): void {
    if (addedIndex < 0 || addedIndex > _length) {
      throw new RangeError(`added index ${addedIndex} is out of range ${[0, _length]}`)
    }
  }

  function _ensureCapacity(minCapacity: number): void {
    if (minCapacity > _elementData.length) {
      _grow(minCapacity)
    }
  }

  function _grow(minCapacity: number): void {
    let newLength = _elementData.length << 1
    if (newLength < minCapacity) {
      newLength = minCapacity
    }

    const newElementData = new arrayType(newLength)
    newElementData.set(_elementData)
    _elementData = newElementData
  }
}

/**
 * !typedArray 操作介绍, 不要实际使用
 *
 * @param dataType {@link DataType}
 * @param options {@link Options}
 */
function useSortedList(dataType: DataType, options?: Options) {
  const { initialCapacity = 1 << 4, arrayLike = [] } = options || {}

  const arrayType = ARRAYTYPE_RECORD[dataType]
  let _elementData = new arrayType(initialCapacity)
  _ensureCapacity(arrayLike.length)
  let _length = 0
  for (let i = 0; i < arrayLike.length; i++) {
    add(arrayLike[i])
  }

  function at(index: number): number {
    const newIndex = _normalizeIndex(index)
    _rangeCheck(newIndex)
    return _elementData[newIndex]
  }

  function pop(index = -1): number {
    const newIndex = _normalizeIndex(index)
    _rangeCheck(newIndex)
    const popped = _elementData[newIndex]
    _elementData.copyWithin(newIndex, newIndex + 1, _length)
    _length--
    return popped
  }

  function add(value: number): void {
    const pos = bisectLeft(value)
    _ensureCapacity(_length + 1)
    _elementData.copyWithin(pos + 1, pos, _length)
    _elementData[pos] = value
    _length++
  }

  function bisectLeft(value: number): number {
    let left = 0
    let right = _length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midElement = _elementData[mid]
      if (midElement < value) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return left
  }

  function bisectRight(value: number): number {
    let left = 0
    let right = _length - 1
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midElement = _elementData[mid]
      if (midElement <= value) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return left
  }

  function slice(start: number, end?: number): InstanceType<typeof ARRAYTYPE_RECORD[DataType]> {
    return _elementData.slice(start, end)
  }

  function subarray(start: number, end?: number): InstanceType<typeof ARRAYTYPE_RECORD[DataType]> {
    return _elementData.subarray(start, end)
  }

  return {
    at,
    add,
    pop,
    bisectLeft,
    bisectRight,
    slice,
    subarray,
    get length(): number {
      return _length
    },
    toString(): string {
      return _elementData.subarray(0, _length).toString()
    }
  }

  function _normalizeIndex(index: number): number {
    if (index < 0) {
      index += _length
    }

    return index
  }

  function _rangeCheck(index: number): void {
    if (index < 0 || index >= _length) {
      throw new RangeError(`index ${index} is out of range ${[0, _length - 1]}`)
    }
  }

  function _ensureCapacity(minCapacity: number): void {
    if (minCapacity > _elementData.length) {
      _grow(minCapacity)
    }
  }

  function _grow(minCapacity: number): void {
    let newLength = _elementData.length << 1
    if (newLength < minCapacity) {
      newLength = minCapacity
    }

    const newElementData = new arrayType(newLength)
    newElementData.set(_elementData)
    _elementData = newElementData
  }
}
