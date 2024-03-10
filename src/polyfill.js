import { Event, CustomEvent, EventTarget } from './event-target.js';

/**
 * A polyfill to set the following APIs on the global object:
 * - CustomEvent
 * - Event
 * - EventTarget
 *
 * If any one of those APIs are missing from the given global object, will
 * overwrite all of them with the implementations used in this library.
 *
 * It is safest to overwrite all of them rather than just the missing ones, as
 * some of them depend specifically upon each other (e.g. as they access private
 * APIs).
 *
 * @param {typeof globalThis} [globalObject=globalThis] The global object to
 * apply the polyfill to, e.g. `global` or `window`. Defaults to `globalThis`.
 */
export function polyfill(globalObject = globalThis) {
  if (
    'CustomEvent' in globalObject &&
    'Event' in globalObject &&
    'EventTarget' in globalObject
  ) {
    return;
  }

  const descriptor = {
    writable: true,
    enumerable: false,
    configurable: true,
  };

  Object.defineProperties(globalObject, {
    CustomEvent: {
      ...descriptor,
      value: CustomEvent,
    },
    Event: {
      ...descriptor,
      value: Event,
    },
    EventTarget: {
      ...descriptor,
      value: EventTarget,
    },
  });
}
