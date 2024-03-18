import {
  ObjectFreeze,
  SymbolFor,
  NumberIsNaN,
  Promise,
} from './primordials.js';

export const customInspectSymbol = SymbolFor('nodejs.util.inspect.custom');
export const kEnumerableProperty = { __proto__: null };
kEnumerableProperty.enumerable = true;
ObjectFreeze(kEnumerableProperty);

export const kEmptyObject = ObjectFreeze({ __proto__: null });

export function createDeferredPromise() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export function format(format, ...args) {
  // Simplified version of https://nodejs.org/api/util.html#utilformatformat-args
  return format.replace(/%([sdifj])/g, function (...[_unused, type]) {
    const replacement = args.shift();

    if (type === 'f') {
      return replacement.toFixed(6);
    } else if (type === 'j') {
      return JSON.stringify(replacement);
    } else if (type === 's' && typeof replacement === 'object') {
      const ctor =
        replacement.constructor !== Object ? replacement.constructor.name : '';
      return `${ctor} {}`.trim();
    }

    return replacement.toString();
  });
}

export function inspect(value) {
  // Vastly simplified version of:
  // https://nodejs.org/api/util.html#utilinspectobject-options
  // https://github.com/nodejs/node/blob/main/lib/internal/util/inspect.js
  switch (typeof value) {
    case 'string':
      if (value.includes("'")) {
        if (!value.includes('"')) {
          return `"${value}"`;
        } else if (!value.includes('`') && !value.includes('${')) {
          return `\`${value}\``;
        }
      }

      return `'${value}'`;
    case 'number':
      if (NumberIsNaN(value)) {
        return 'NaN';
      } else if (Object.is(value, -0)) {
        return String(value);
      }

      return value;
    case 'bigint':
      return `${String(value)}n`;
    case 'boolean':
    case 'undefined':
      return String(value);
    case 'function':
      return '[function Function]';
    case 'object': {
      const keys = Object.keys(value);
      if (!keys.length) {
        return '{}';
      }

      let acc = '{\n';
      for (const [i, key] of keys.entries()) {
        if (i > 12) {
          acc += `  ... (${keys.length - i} keys omitted)\n`;
          break;
        }

        const subvalue = value[key];
        // Avoid recursion by making subobjects opaque
        const subvalueStringified =
          typeof subvalue === 'object' ? '[object Object]' : inspect(subvalue);

        acc += `  '${key.replace(/'/g, "\\'")}': ${subvalueStringified},\n`;
      }

      return `${acc}}`;
    }
  }

  return '[Unable to stringify]';
}
