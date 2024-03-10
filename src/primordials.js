/*
  This file is a reduced and adapted version of the main lib/internal/per_context/primordials.js file defined at

  https://github.com/nodejs/node/blob/master/lib/internal/per_context/primordials.js

  Don't try to replace with the original file and keep it up to date with the upstream file.
*/

export const ArrayFrom = Array.from;
export function ArrayPrototypeReduce(self, fn, initialValue) {
  return self.reduce(fn, initialValue);
}
export function ArrayPrototypeSplice(self, start, deleteCount) {
  return self.splice(start, deleteCount);
}
export function ArrayIsArray(self) {
  return Array.isArray(self);
}
export function ArrayPrototypeIncludes(self, el) {
  return self.includes(el);
}
export function ArrayPrototypeIndexOf(self, el) {
  return self.indexOf(el);
}
export function ArrayPrototypeJoin(self, sep) {
  return self.join(sep);
}
export function ArrayPrototypeMap(self, fn) {
  return self.map(fn);
}
export function ArrayPrototypePop(self, el) {
  return self.pop(el);
}
export function ArrayPrototypePush(self, el) {
  return self.push(el);
}
export function ArrayPrototypeSlice(self, start, end) {
  return self.slice(start, end);
}
export const Boolean = globalThis.Boolean;
export const Error = globalThis.Error;
export function FunctionPrototypeCall(fn, thisArgs, ...args) {
  return fn.call(thisArgs, ...args);
}
export function FunctionPrototypeSymbolHasInstance(self, instance) {
  return Function.prototype[Symbol.hasInstance].call(self, instance);
}
export const MathAbs = Math.abs;
export const MathFloor = globalThis.Math.floor;
export const MathMax = Math.max;
export const MathMin = Math.min;
export const MathPow = Math.pow;
export const MathSign = Math.sign;
export const MathTrunc = Math.trunc;
export const Number = globalThis.Number;
export const NumberIsInteger = globalThis.Number.isInteger;
export const NumberIsNaN = globalThis.Number.isNaN;
export const NumberMAX_SAFE_INTEGER = globalThis.Number.MAX_SAFE_INTEGER;
export const NumberMIN_SAFE_INTEGER = globalThis.Number.MIN_SAFE_INTEGER;
export const NumberParseInt = globalThis.Number.parseInt;
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
export function ObjectKeys(obj) {
  return Object.keys(obj);
}
export function ObjectSetPrototypeOf(target, proto) {
  return Object.setPrototypeOf(target, proto);
}
export const ReflectApply = globalThis.Reflect.apply;
export function RegExpPrototypeExec(self, str) {
  return self.exec(str);
}
export function RegExpPrototypeTest(self, value) {
  return self.test(value);
}
export const SafeFinalizationRegistry = globalThis.FinalizationRegistry;
export const SafeMap = globalThis.Map;
export const SafeSet = globalThis.Set;
export const SafeWeakMap = globalThis.WeakMap;
export const SafeWeakRef = globalThis.WeakRef;
export const SafeWeakSet = globalThis.WeakSet;
export const String = globalThis.String;
export function StringPrototypeEndsWith(self, searchString, endPosition) {
  return self.endsWith(searchString, endPosition);
}
export function StringPrototypeIncludes(self, searchString, position) {
  return self.includes(searchString, position);
}
export function StringPrototypeSlice(self, start, end) {
  return self.slice(start, end);
}
export function StringPrototypeToLowerCase(self) {
  return self.toLowerCase();
}
export function StringPrototypeToUpperCase(self) {
  return self.toUpperCase();
}
export function StringPrototypeTrim(self) {
  return self.trim();
}
export const Symbol = globalThis.Symbol;
export const SymbolFor = Symbol.for;
export const SymbolToStringTag = Symbol.toStringTag;
export function TypedArrayPrototypeSet(self, buf, len) {
  return self.set(buf, len);
}
export const TypeError = globalThis.TypeError;
