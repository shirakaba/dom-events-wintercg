import { EventTarget } from './event-target.js';

/**
 * A dummy no-op MessagePort implementation.
 */
class MessagePort extends EventTarget {
  onmessage = null;
  onmessageerror = null;
  close() {}
  postMessage() {}
  start() {}
}

/**
 * A dummy no-op MessageChannel implementation.
 */
export class MessageChannel {
  port1 = {
    port: new MessagePort(),
    unref: () => this.port1.port,
  };
  port2 = {
    port: new MessagePort(),
    unref: () => this.port2.port,
  };
}
