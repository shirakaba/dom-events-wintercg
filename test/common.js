// https://github.com/nodejs/node/blob/main/test/common/index.js

import process from 'node:process';
import assert from 'assert/strict';
import { inspect } from 'util';

const noop = () => {};

const mustCallChecks = [];

function runCallChecks(exitCode) {
  if (exitCode !== 0) return;

  const failed = mustCallChecks.filter(function (context) {
    if ('minimum' in context) {
      context.messageSegment = `at least ${context.minimum}`;
      return context.actual < context.minimum;
    }
    context.messageSegment = `exactly ${context.exact}`;
    return context.actual !== context.exact;
  });

  failed.forEach(function (context) {
    console.log(
      'Mismatched %s function calls. Expected %s, actual %d.',
      context.name,
      context.messageSegment,
      context.actual,
    );
    console.log(context.stack.split('\n').slice(2).join('\n'));
  });

  if (failed.length) process.exit(1);
}

export function mustCall(fn, exact) {
  return _mustCallInner(fn, exact, 'exact');
}

function _mustCallInner(fn, criteria = 1, field) {
  if (process._exiting)
    throw new Error('Cannot use common.mustCall*() in process exit handler');
  if (typeof fn === 'number') {
    criteria = fn;
    fn = noop;
  } else if (fn === undefined) {
    fn = noop;
  }

  if (typeof criteria !== 'number')
    throw new TypeError(`Invalid ${field} value: ${criteria}`);

  const context = {
    [field]: criteria,
    actual: 0,
    stack: inspect(new Error()),
    name: fn.name || '<anonymous>',
  };

  // Add the exit listener only once to avoid listener leak warnings
  if (mustCallChecks.length === 0) process.on('exit', runCallChecks);

  mustCallChecks.push(context);

  // eslint-disable-next-line func-style
  const _return = function () {
    context.actual++;
    return fn.apply(this, arguments);
  };

  // Function instances have own properties that may be relevant.
  // Let's replicate those properties to the returned function.
  // Refs: https://tc39.es/ecma262/#sec-function-instances
  Object.defineProperties(_return, {
    name: {
      value: fn.name,
      writable: false,
      enumerable: false,
      configurable: true,
    },
    length: {
      value: fn.length,
      writable: false,
      enumerable: false,
      configurable: true,
    },
  });
  return _return;
}

function getCallSite(top) {
  const originalStackFormatter = Error.prepareStackTrace;
  Error.prepareStackTrace = (err, stack) =>
    `${stack[0].getFileName()}:${stack[0].getLineNumber()}`;
  const err = new Error();
  Error.captureStackTrace(err, top);
  // With the V8 Error API, the stack is not formatted until it is accessed
  err.stack; // eslint-disable-line no-unused-expressions
  Error.prepareStackTrace = originalStackFormatter;
  return err.stack;
}

export function mustNotCall(msg) {
  const callSite = getCallSite(mustNotCall);
  return function mustNotCall(...args) {
    const argsInfo =
      args.length > 0
        ? `\ncalled with arguments: ${args.map((arg) => inspect(arg)).join(', ')}`
        : '';
    assert.fail(
      `${msg || 'function should not have been called'} at ${callSite}` +
        argsInfo,
    );
  };
}

// A helper function to simplify checking for ERR_INVALID_ARG_TYPE output.
export function invalidArgTypeHelper(input) {
  if (input == null) {
    return ` Received ${input}`;
  }
  if (typeof input === 'function') {
    return ` Received function ${input.name}`;
  }
  if (typeof input === 'object') {
    if (input.constructor?.name) {
      return ` Received an instance of ${input.constructor.name}`;
    }
    return ` Received ${inspect(input, { depth: -1 })}`;
  }

  let inspected = inspect(input, { colors: false });
  if (inspected.length > 28) {
    inspected = `${inspected.slice(inspected, 0, 25)}...`;
  }

  return ` Received type ${typeof input} (${inspected})`;
}
