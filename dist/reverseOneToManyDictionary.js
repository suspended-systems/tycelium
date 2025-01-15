"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseOneToManyDictionary = void 0;
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
const reverseOneToManyDictionary = (oneToManyDictionary) => Object.fromEntries(Object.entries(oneToManyDictionary).flatMap(([key, values]) => values.map((value) => [value, key])));
exports.reverseOneToManyDictionary = reverseOneToManyDictionary;
