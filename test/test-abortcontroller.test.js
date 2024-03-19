// https://github.com/nodejs/node/blob/a21b15a14e68cdffdde4365bc7dcb1c720b8051d/test/parallel/test-abortcontroller.js
import * as common from './common.js';
import { inspect } from 'util';
import { ok, notStrictEqual, strictEqual, throws } from 'assert';
import {
  AbortController,
  AbortSignal,
  DOMException,
  Event,
  kWeakHandler,
} from '../src/index.js';
import { setTimeout as sleep } from 'timers/promises';
import test from 'node:test';

test('ac-1', () => {
  // Tests that abort is fired with the correct event type on AbortControllers
  const ac = new AbortController();
  ok(ac.signal);
  ac.signal.onabort = common.mustCall((event) => {
    ok(event);
    strictEqual(event.type, 'abort');
  });
  ac.signal.addEventListener(
    'abort',
    common.mustCall((event) => {
      ok(event);
      strictEqual(event.type, 'abort');
    }),
    { once: true },
  );
  ac.abort();
  ac.abort();
  ok(ac.signal.aborted);
});

test('ac-2', () => {
  // Tests that abort events are trusted
  const ac = new AbortController();
  ac.signal.addEventListener(
    'abort',
    common.mustCall((event) => {
      ok(event.isTrusted);
    }),
  );
  ac.abort();
});

test('ac-3', () => {
  // Tests that abort events have the same `isTrusted` reference
  const first = new AbortController();
  const second = new AbortController();
  let ev1, ev2;
  const ev3 = new Event('abort');
  first.signal.addEventListener(
    'abort',
    common.mustCall((event) => {
      ev1 = event;
    }),
  );
  second.signal.addEventListener(
    'abort',
    common.mustCall((event) => {
      ev2 = event;
    }),
  );
  first.abort();
  second.abort();
  const firstTrusted = Reflect.getOwnPropertyDescriptor(
    Object.getPrototypeOf(ev1),
    'isTrusted',
  ).get;
  const secondTrusted = Reflect.getOwnPropertyDescriptor(
    Object.getPrototypeOf(ev2),
    'isTrusted',
  ).get;
  const untrusted = Reflect.getOwnPropertyDescriptor(
    Object.getPrototypeOf(ev3),
    'isTrusted',
  ).get;
  strictEqual(firstTrusted, secondTrusted);
  strictEqual(untrusted, firstTrusted);
});

test('ac-4', () => {
  // Tests that AbortSignal is impossible to construct manually
  const ac = new AbortController();
  throws(() => new ac.signal.constructor(), {
    code: 'ERR_ILLEGAL_CONSTRUCTOR',
  });
});

test('ac-5', () => {
  // Symbol.toStringTag
  const toString = (o) => Object.prototype.toString.call(o);
  const ac = new AbortController();
  strictEqual(toString(ac), '[object AbortController]');
  strictEqual(toString(ac.signal), '[object AbortSignal]');
});

test('ac-6', () => {
  const signal = AbortSignal.abort();
  ok(signal.aborted);
});

test('ac-7', () => {
  // Test that AbortController properties and methods validate the receiver
  const acSignalGet = Object.getOwnPropertyDescriptor(
    AbortController.prototype,
    'signal',
  ).get;
  const acAbort = AbortController.prototype.abort;

  const goodController = new AbortController();
  ok(acSignalGet.call(goodController));
  acAbort.call(goodController);

  const badAbortControllers = [
    null,
    undefined,
    0,
    NaN,
    true,
    'AbortController',
    { __proto__: AbortController.prototype },
  ];
  for (const badController of badAbortControllers) {
    throws(() => acSignalGet.call(badController), { name: 'TypeError' });
    throws(() => acAbort.call(badController), { name: 'TypeError' });
  }
});

test('ac-8', () => {
  // Test that AbortSignal properties validate the receiver
  const signalAbortedGet = Object.getOwnPropertyDescriptor(
    AbortSignal.prototype,
    'aborted',
  ).get;

  const goodSignal = new AbortController().signal;
  strictEqual(signalAbortedGet.call(goodSignal), false);

  const badAbortSignals = [
    null,
    undefined,
    0,
    NaN,
    true,
    'AbortSignal',
    { __proto__: AbortSignal.prototype },
  ];
  for (const badSignal of badAbortSignals) {
    throws(() => signalAbortedGet.call(badSignal), { name: 'TypeError' });
  }
});

// Skipping because we do much simpler stringification than Node.js.
test.skip('ac-9', () => {
  const ac = new AbortController();
  strictEqual(
    inspect(ac, { depth: 1 }),
    'AbortController { signal: [AbortSignal] }',
  );
  strictEqual(
    inspect(ac, { depth: null }),
    'AbortController { signal: AbortSignal { aborted: false } }',
  );
});

test('ac-10', () => {
  // Test AbortSignal.reason
  const ac = new AbortController();
  ac.abort('reason');
  strictEqual(ac.signal.reason, 'reason');
});

test('ac-11', () => {
  // Test AbortSignal.reason
  const signal = AbortSignal.abort('reason');
  strictEqual(signal.reason, 'reason');
});

test('ac-12', () => {
  // Test AbortSignal timeout
  const signal = AbortSignal.timeout(10);
  ok(!signal.aborted);
  setTimeout(
    common.mustCall(() => {
      ok(signal.aborted);
      strictEqual(signal.reason.name, 'TimeoutError');
      strictEqual(signal.reason.code, 23);
    }),
    20,
  );
});

test('ac-13', () => {
  (async () => {
    // Test AbortSignal timeout doesn't prevent the signal
    // from being garbage collected.
    let ref;
    {
      ref = new globalThis.WeakRef(AbortSignal.timeout(1_200_000));
    }

    await sleep(10);
    globalThis.gc();
    strictEqual(ref.deref(), undefined);
  })().then(common.mustCall());

  (async () => {
    // Test that an AbortSignal with a timeout is not gc'd while
    // there is an active listener on it.
    let ref;
    function handler() {}
    {
      ref = new globalThis.WeakRef(AbortSignal.timeout(1_200_000));
      ref.deref().addEventListener('abort', handler);
    }

    await sleep(10);
    globalThis.gc();
    notStrictEqual(ref.deref(), undefined);
    ok(ref.deref() instanceof AbortSignal);

    ref.deref().removeEventListener('abort', handler);

    await sleep(10);
    globalThis.gc();
    strictEqual(ref.deref(), undefined);
  })().then(common.mustCall());

  (async () => {
    // If the event listener is weak, however, it should not prevent gc
    let ref;
    function handler() {}
    {
      ref = new globalThis.WeakRef(AbortSignal.timeout(1_200_000));
      ref.deref().addEventListener('abort', handler, { [kWeakHandler]: {} });
    }

    await sleep(10);
    globalThis.gc();
    strictEqual(ref.deref(), undefined);
  })().then(common.mustCall());

  // Setting a long timeout (20 minutes here) should not
  // keep the Node.js process open (the timer is unref'd)
  AbortSignal.timeout(1_200_000);
});

test('ac-14', () => {
  // Test AbortSignal.reason default
  const signal = AbortSignal.abort();
  ok(signal.reason instanceof DOMException);
  strictEqual(signal.reason.code, 20);

  const ac = new AbortController();
  ac.abort();
  ok(ac.signal.reason instanceof DOMException);
  strictEqual(ac.signal.reason.code, 20);
});

test('ac-15', () => {
  // Test abortSignal.throwIfAborted()
  throws(() => AbortSignal.abort().throwIfAborted(), {
    code: 20,
    name: 'AbortError',
  });

  // Does not throw because it's not aborted.
  const ac = new AbortController();
  ac.signal.throwIfAborted();
});

test('ac-16', () => {
  const originalDesc = Reflect.getOwnPropertyDescriptor(
    AbortSignal.prototype,
    'aborted',
  );
  const actualReason = new Error();
  Reflect.defineProperty(AbortSignal.prototype, 'aborted', { value: false });
  throws(() => AbortSignal.abort(actualReason).throwIfAborted(), actualReason);
  Reflect.defineProperty(AbortSignal.prototype, 'aborted', originalDesc);
});

test('ac-17', () => {
  const originalDesc = Reflect.getOwnPropertyDescriptor(
    AbortSignal.prototype,
    'reason',
  );
  const actualReason = new Error();
  const fakeExcuse = new Error();
  Reflect.defineProperty(AbortSignal.prototype, 'reason', {
    value: fakeExcuse,
  });
  throws(() => AbortSignal.abort(actualReason).throwIfAborted(), actualReason);
  Reflect.defineProperty(AbortSignal.prototype, 'reason', originalDesc);
});
