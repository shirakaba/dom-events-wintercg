// https://github.com/nodejs/node/blob/main/test/parallel/test-whatwg-events-customevent.js

import test from 'node:test';
import { strictEqual, throws } from 'node:assert/strict';
import { Event, EventTarget } from '../src/index.js';

test('ce-1', () => {
  const type = 'foo';
  const target = new EventTarget();

  target.addEventListener(type, (event) => {
    strictEqual(event.type, type);
  });

  target.dispatchEvent(new Event(type));
});

test('ce-2', () => {
  throws(() => new Event(), {
    code: 'ERR_MISSING_ARGS',
    name: 'TypeError',
    message: 'The "type" argument must be specified',
  });
});

test('ce-3', () => {
  const event = new Event('foo');
  strictEqual(event.type, 'foo');
  strictEqual(event.bubbles, false);
  strictEqual(event.cancelable, false);
  strictEqual(event.detail, undefined);
});
