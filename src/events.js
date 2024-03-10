import { codes } from './errors.js';
// Warning: circular dependency
import { isEventTarget } from './event-target.js';
import { Symbol } from './primordials.js';
import { validateNumber } from './validators.js';

export const kMaxEventTargetListeners = Symbol(
  'events.maxEventTargetListeners',
);
export const kMaxEventTargetListenersWarned = Symbol(
  'events.maxEventTargetListenersWarned',
);
export let defaultMaxListeners = 10;

/**
 * Sets the max listeners.
 * @param {number} n
 * @param {EventTarget[] | EventEmitter[]} [eventTargets]
 * @returns {void}
 */
export function setMaxListeners(n = defaultMaxListeners, ...eventTargets) {
  validateNumber(n, 'setMaxListeners', 0);
  if (eventTargets.length === 0) {
    defaultMaxListeners = n;
  } else {
    for (let i = 0; i < eventTargets.length; i++) {
      const target = eventTargets[i];
      if (isEventTarget(target)) {
        target[kMaxEventTargetListeners] = n;
        target[kMaxEventTargetListenersWarned] = false;
      } else if (typeof target.setMaxListeners === 'function') {
        target.setMaxListeners(n);
      } else {
        throw new codes.ERR_INVALID_ARG_TYPE(
          'eventTargets',
          ['EventEmitter', 'EventTarget'],
          target,
        );
      }
    }
  }
}
