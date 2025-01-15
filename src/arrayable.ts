// todo: use union spread on this so it works with unions
export type One<T> = T extends [] ? T[0] : T;

export type Many<T> = [T, ...T[]];
export type ReadonlyMany<T> = readonly [T, ...T[]];

export type OneOrMany<T> = T | Many<T>;
export type ReadonlyOneOrMany<T> = T | ReadonlyMany<T>;

// WARNING: CAREFUL USING THIS WITH TUPLE VALUES, todo
// naming convention used with this should be plural, so that you can do things like
// oneOrMany(things).map(thing => ...)
export const arrayable = <T>(value: T | ReadonlyArray<T> | ReadonlyOneOrMany<T>) => [value].flat() as T[];
export const unwrapArrayable = <T>(array: readonly T[]) => (array.length === 1 ? array[0] : (array as ReadonlyMany<T>));
