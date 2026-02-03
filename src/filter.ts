type Falsy = false | 0 | 0n | typeof NaN | "" | null | undefined;

export const isNotNullish = <T>(value: T): value is Exclude<T, null | undefined> => value != null;

export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => Boolean(value); // aka `!!value`
