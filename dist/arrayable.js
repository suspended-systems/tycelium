"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapArrayable = exports.arrayable = void 0;
// WARNING: CAREFUL USING THIS WITH TUPLE VALUES, todo
// naming convention used with this should be plural, so that you can do things like
// oneOrMany(things).map(thing => ...)
const arrayable = (value) => [value].flat();
exports.arrayable = arrayable;
const unwrapArrayable = (array) => (array.length === 1 ? array[0] : array);
exports.unwrapArrayable = unwrapArrayable;
