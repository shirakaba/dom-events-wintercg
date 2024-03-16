/*
  This file is a reduced and adapted version of the main lib/internal/per_context/primordials.js file defined at

  https://github.com/nodejs/node/blob/master/lib/internal/per_context/primordials.js

  Don't try to replace with the original file and keep it up to date with the upstream file.
*/

export function ArrayPrototypeReduce(self, fn, initialValue) {
  return self.reduce(fn, initialValue);
}
export function ArrayIsArray(self) {
  return Array.isArray(self);
}
export const Boolean = globalThis.Boolean;
export const Error = globalThis.Error;
export function FunctionPrototypeCall(fn, thisArgs, ...args) {
  return fn.call(thisArgs, ...args);
}
export const MathAbs = Math.abs;
export const MathMax = Math.max;
export const MathMin = Math.min;
export const MathPow = Math.pow;
export const MathSign = Math.sign;
export const MathTrunc = Math.trunc;
export const NumberIsInteger = globalThis.Number.isInteger;
export const NumberIsNaN = globalThis.Number.isNaN;
export const NumberMAX_SAFE_INTEGER = globalThis.Number.MAX_SAFE_INTEGER;
export const NumberMIN_SAFE_INTEGER = globalThis.Number.MIN_SAFE_INTEGER;
export function ObjectAssign(target, source) {
  return Object.assign(target, source);
}
export const ObjectFreeze = Object.freeze;
export function ObjectPrototypeHasOwnProperty(self, propertyKey) {
  // To understand why we don't write `return self.hasOwnProperty(propertyKey)`,
  // see: https://eslint.org/docs/latest/rules/no-prototype-builtins

  // eslint-disable-next-line prefer-object-has-own
  return Object.prototype.hasOwnProperty.call(self, propertyKey);
}
export function ObjectDefineProperties(self, props) {
  return Object.defineProperties(self, props);
}
export function ObjectDefineProperty(self, name, prop) {
  return Object.defineProperty(self, name, prop);
}
export function ObjectGetOwnPropertyDescriptor(self, name) {
  return Object.getOwnPropertyDescriptor(self, name);
}
export const ReflectApply = globalThis.Reflect.apply;
export const SafeFinalizationRegistry = globalThis.FinalizationRegistry;
export const SafeMap = globalThis.Map;
export const SafeSet = globalThis.Set;
export const SafeWeakMap = globalThis.WeakMap;
export const SafeWeakRef = globalThis.WeakRef;
export const SafeWeakSet = globalThis.WeakSet;
export const String = globalThis.String;
export const Symbol = globalThis.Symbol;
export const SymbolFor = Symbol.for;
export const SymbolToStringTag = Symbol.toStringTag;
export const TypeError = globalThis.TypeError;
