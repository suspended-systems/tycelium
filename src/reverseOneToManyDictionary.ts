/**
 * Reverses a Record<string, string[]> such that every value's array member becomes a key pointing to its respective key in the input.
 * e.g. { animal: ['cat','dog','elephant'] } becomes { cat: 'animal', dog: 'animal', elephant: 'animal' }
 *
 * This allows for maps with many keys with the same value to be defined in reverse for better readability & maintainability.
 *
 * @example
 * // `as const` const asserted object input for narrowest typing
 * const input = {
 *   LABEL_CREATED: ['PU', 'PX', 'OC'],
 *   OUT_FOR_DELIVERY: ['OD'],
 * } as const;
 *
 * const output: {
 *     PU: "LABEL_CREATED";
 *     PX: "LABEL_CREATED";
 *     OC: "LABEL_CREATED";
 *     OD: "OUT_FOR_DELIVERY";
 * } = reverseOneToManyDictionary(input);
 *
 * const value: "LABEL_CREATED" = output['PX'];
 */
export const reverseOneToManyDictionary = <OneToManyDict extends Readonly<Record<string, readonly string[]>>>(
	oneToManyDictionary: OneToManyDict,
): {
	// see @example above ^^^
	[Value in OneToManyDict[keyof OneToManyDict][number]]: {
		readonly [Key in keyof OneToManyDict]-?: Value extends OneToManyDict[Key][number] ? Key : never;
	}[keyof OneToManyDict];
} =>
	// prettier-ignore
	Object.fromEntries(
		Object.entries(oneToManyDictionary).flatMap(([key, values]) =>
			values.map((value) => [value as unknown, key])));
// 										`as unknown` required because Object.fromEntries expects [string, string][]
// 													 but our return type has literal string keys ['actualKeyA' | 'actualKeyB' | ..., string][]
