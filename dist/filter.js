"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthy = exports.isNullish = void 0;
const isNullish = (value) => value != null;
exports.isNullish = isNullish;
const isTruthy = (value) => Boolean(value); // aka `!!value`
exports.isTruthy = isTruthy;
