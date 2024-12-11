export const DataIndex = <E, T extends Iterable<E>, K>(
  targetObject: T,
  converter: (element: E) => K
) => {
  const result = new Map<K, E>();
  for (const element of targetObject) {
    const key = converter(element);
    if (result.has(key)) {
      console.warn(`key ${key} が重複しています。`);
      continue;
    }
    result.set(key, element);
  }
  return (key: K) => {
    const value = result.get(key);
    if (value === undefined) throw new Error(`key ${key} が存在しません。`);
    return value;
  };
};
export const DataIndexArray = <E, T extends Iterable<E>, K>(
  targetObject: T,
  converter: (element: E) => K
) => {
  const result = new Map<K, E[]>();
  for (const element of targetObject) {
    const key = converter(element);
    if (result.has(key)) {
      result.get(key)!.push(element);
    } else {
      result.set(key, [element]);
    }
  }
  return (key: K) => {
    const value = result.get(key);
    if (value === undefined) throw new Error(`key ${key} が存在しません。`);
    return value;
  };
};
export const DataIndex2 = <E, T extends Iterable<E>, K, V>(
  targetObject: T,
  converter: (element: E) => K,
  valueConverter: (element: E) => V
) => {
  const result = new Map<K, V>();
  for (const element of targetObject) {
    const key = converter(element);
    if (result.has(key)) {
      console.warn(`key ${key} が重複しています。`);
      continue;
    }
    result.set(key, valueConverter(element));
  }
  return (key: K) => {
    const value = result.get(key);
    if (value === undefined) throw new Error(`key ${key} が存在しません。`);
    return value;
  };
};
