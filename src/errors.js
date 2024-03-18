import { format, inspect } from './util.js';

/*
  This file is a reduced and adapted version of the main lib/internal/errors.js file defined at

  https://github.com/nodejs/node/blob/master/lib/internal/errors.js

  Don't try to replace with the original file and keep it up to date (starting from E(...) definitions)
  with the upstream file.
*/

const kIsNodeError = Symbol('kIsNodeError');

// Sorted by a rough estimate on most frequently used entries.
const kTypes = [
  'string',
  'function',
  'number',
  'object',
  // Accept 'Function' and 'Object' as alternative to the lower cased version.
  'Function',
  'Object',
  'boolean',
  'bigint',
  'symbol',
];
const classRegExp = /^([A-Z][a-z0-9]*)+$/;
const nodeInternalPrefix = '__node_internal_';
export const codes = {};

/**
 * Tests if value is truthy. It is equivalent to assert.equal(!!value, true, message).
 *
 * @param {unknown} value The input that is checked for being truthy.
 * @param {string | Error} message
 * @see https://nodejs.org/api/assert.html#assertokvalue-message
 */
export function assert(value, message) {
  if (!value) {
    throw new codes.ERR_INTERNAL_ASSERTION(message);
  }
}

// Only use this for integers! Decimal numbers do not work with this function.
function addNumericalSeparator(val) {
  let res = '';
  let i = val.length;
  const start = val[0] === '-' ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`;
  }
  return `${val.slice(0, i)}${res}`;
}

function getMessage(key, msg, args) {
  if (typeof msg === 'function') {
    assert(
      msg.length <= args.length, // Default options do not count.
      `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`,
    );

    return msg(...args);
  }

  const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;

  assert(
    expectedLength === args.length,
    `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`,
  );

  if (args.length === 0) {
    return msg;
  }

  return format(msg, ...args);
}

function E(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  class NodeError extends Base {
    constructor(...args) {
      super(getMessage(code, message, args));
    }

    toString() {
      return `${this.name} [${code}]: ${this.message}`;
    }
  }

  Object.defineProperties(NodeError.prototype, {
    name: {
      value: Base.name,
      writable: true,
      enumerable: false,
      configurable: true,
    },
    toString: {
      value() {
        return `${this.name} [${code}]: ${this.message}`;
      },
      writable: true,
      enumerable: false,
      configurable: true,
    },
  });
  NodeError.prototype.code = code;
  NodeError.prototype[kIsNodeError] = true;

  codes[code] = NodeError;
}

/**
 * This function removes unnecessary frames from Node.js core errors.
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} fn
 * @returns {T}
 */
export function hideStackFrames(fn) {
  // We rename the functions that will be hidden to cut off the stacktrace
  // at the outermost one
  const hidden = nodeInternalPrefix + fn.name;
  Object.defineProperty(fn, 'name', { value: hidden });
  return fn;
}

E('ERR_ILLEGAL_CONSTRUCTOR', 'Illegal constructor', TypeError);

E(
  'ERR_INVALID_ARG_TYPE',
  (name, expected, actual) => {
    assert(typeof name === 'string', "'name' must be a string");

    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    let msg = 'The ';
    if (name.endsWith(' argument')) {
      // For cases like 'first argument'
      msg += `${name} `;
    } else {
      msg += `"${name}" ${name.includes('.') ? 'property' : 'argument'} `;
    }

    msg += 'must be ';

    const types = [];
    const instances = [];
    const other = [];

    for (const value of expected) {
      assert(
        typeof value === 'string',
        'All expected entries have to be of type string',
      );

      if (kTypes.includes(value)) {
        types.push(value.toLowerCase());
      } else if (classRegExp.test(value)) {
        instances.push(value);
      } else {
        assert(
          value !== 'object',
          'The value "object" should be written as "Object"',
        );
        other.push(value);
      }
    }

    // Special handle `object` in case other instances are allowed to outline
    // the differences between each other.
    if (instances.length > 0) {
      const pos = types.indexOf('object');

      if (pos !== -1) {
        types.splice(types, pos, 1);
        instances.push('Object');
      }
    }

    if (types.length > 0) {
      switch (types.length) {
        case 1:
          msg += `of type ${types[0]}`;
          break;
        case 2:
          msg += `one of type ${types[0]} or ${types[1]}`;
          break;
        default: {
          const last = types.pop();
          msg += `one of type ${types.join(', ')}, or ${last}`;
        }
      }

      if (instances.length > 0 || other.length > 0) {
        msg += ' or ';
      }
    }

    if (instances.length > 0) {
      switch (instances.length) {
        case 1:
          msg += `an instance of ${instances[0]}`;
          break;
        case 2:
          msg += `an instance of ${instances[0]} or ${instances[1]}`;
          break;
        default: {
          const last = instances.pop();
          msg += `an instance of ${instances.join(', ')}, or ${last}`;
        }
      }

      if (other.length > 0) {
        msg += ' or ';
      }
    }

    switch (other.length) {
      case 0:
        break;
      case 1:
        if (other[0].toLowerCase() !== other[0]) {
          msg += 'an ';
        }

        msg += `${other[0]}`;
        break;
      case 2:
        msg += `one of ${other[0]} or ${other[1]}`;
        break;
      default: {
        const last = other.pop();
        msg += `one of ${other.join(', ')}, or ${last}`;
      }
    }

    if (actual == null) {
      msg += `. Received ${actual}`;
    } else if (typeof actual === 'function' && actual.name) {
      msg += `. Received function ${actual.name}`;
    } else if (typeof actual === 'object') {
      if (actual.constructor?.name) {
        msg += `. Received an instance of ${actual.constructor.name}`;
      } else {
        const inspected = inspect(actual, { depth: -1 });
        msg += `. Received ${inspected}`;
      }
    } else {
      let inspected = inspect(actual, { colors: false });
      if (inspected.length > 25) {
        inspected = `${inspected.slice(0, 25)}...`;
      }
      msg += `. Received type ${typeof actual} (${inspected})`;
    }
    return msg;
  },
  TypeError,
);

E(
  'ERR_INVALID_ARG_VALUE',
  (name, value, reason = 'is invalid') => {
    let inspected = inspect(value);
    if (inspected.length > 128) {
      inspected = inspected.slice(0, 128) + '...';
    }
    const type = name.includes('.') ? 'property' : 'argument';
    return `The ${type} '${name}' ${reason}. Received ${inspected}`;
  },
  TypeError,
);

E('ERR_INVALID_THIS', 'Value of "this" must be of type %s', TypeError);

E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);

E(
  'ERR_MISSING_ARGS',
  (...args) => {
    assert(args.length > 0, 'At least one arg needs to be specified');

    let msg = '';
    const len = args.length;
    args = (Array.isArray(args) ? args : [args])
      .map((a) => `"${a}"`)
      .join(' or ');

    switch (len) {
      case 1:
        msg += `The ${args} argument`;
        break;
      case 2:
        msg += `The ${args[0]} and ${args[1]} arguments`;
        break;
      default:
        {
          const last = args.pop();
          msg += `The ${args.join(', ')}, and ${last} arguments`;
        }
        break;
    }

    return `${msg} must be specified`;
  },
  TypeError,
);

E(
  'ERR_OUT_OF_RANGE',
  (str, range, input) => {
    assert(range, 'Missing "range" argument');

    let received;

    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === 'bigint') {
      received = String(input);

      if (input > 2n ** 32n || input < -(2n ** 32n)) {
        received = addNumericalSeparator(received);
      }

      received += 'n';
    } else {
      received = inspect(input);
    }

    return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
  },
  RangeError,
);
