type NullableObject<T> = {
  [K in keyof T]: T[K] extends null ? never : T[K];
};

export function filterNullValues<T>(obj: T): NullableObject<T> {
  const result: Partial<NullableObject<T>> = {};

  for (const key in obj) {
    if (obj[key] !== null) {
      result[key] = obj[key] as any;
    }
  }

  return result as NullableObject<T>;
}

export function cleanNestedChildNullValues<T>(obj: T): T | null {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Check if the object is an array
  if (Array.isArray(obj)) {
    const cleanedArray = obj.map((item) => cleanNestedChildNullValues(item));
    // If all items in the array are null, return null
    return cleanedArray.every((item) => item === null)
      ? null
      : (cleanedArray as T);
  }

  const cleanedObject: Partial<T> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const cleanedValue = cleanNestedChildNullValues(
        (obj as Record<string, any>)[key],
      );
      // Only assign if not null
      (cleanedObject as Record<string, any>)[key] = cleanedValue;
    }
  }

  // If all values in the object are null, return null
  return Object.values(cleanedObject).every((value) => value === null)
    ? null
    : (cleanedObject as T);
}
