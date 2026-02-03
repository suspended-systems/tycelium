"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthy = exports.isNotNullish = void 0;
const isNotNullish = (value) => value != null;
exports.isNotNullish = isNotNullish;
const isTruthy = (value) => Boolean(value); // aka `!!value`
exports.isTruthy = isTruthy;
