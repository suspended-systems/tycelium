export type One<T> = T extends [] ? T[0] : T;
export type Many<T> = [T, ...T[]];
export type ReadonlyMany<T> = readonly [T, ...T[]];
export type OneOrMany<T> = T | Many<T>;
export type ReadonlyOneOrMany<T> = T | ReadonlyMany<T>;
export declare const arrayable: <T>(value: T | ReadonlyArray<T> | ReadonlyOneOrMany<T>) => T[];
export declare const unwrapArrayable: <T>(array: readonly T[]) => T | ReadonlyMany<T>;
