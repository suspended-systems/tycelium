type Falsy = false | 0 | 0n | typeof NaN | "" | null | undefined;
export declare const isNullish: <T>(value: T) => value is Exclude<T, null | undefined>;
export declare const isTruthy: <T>(value: T) => value is Exclude<T, Falsy>;
export {};
