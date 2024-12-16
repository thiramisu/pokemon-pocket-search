/**
 * Setにitemが含まれているなら取り除き、含まれていないなら追加します。
 */
export function toggleSetItem<T>(set: Set<T>, item: T) {
  if (set.has(item)) {
    set.delete(item);
  } else {
    set.add(item);
  }
}

/**
 * Map に key が含まれているなら配列に追加し、含まれていないなら配列を作成します。
 */
export function pushOrCreateKey<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const existingValues = map.get(key);

  if (existingValues === undefined) {
    map.set(key, [value]);
  } else {
    existingValues.push(value);
  }
}

/**
 * 正（0含む）の余りを求めます。
 */
export function positiveRemainder(dividend: number, divisor: number) {
  const remainder = dividend % divisor;
  return remainder < 0 ? remainder + divisor : remainder;
}

/**
 * 到達しない文であることを型チェック・実行時の両方で確認します。
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
