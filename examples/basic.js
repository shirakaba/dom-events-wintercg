import { Event, EventTarget } from '../src/index.js';

const eventTarget = new EventTarget();
const event = new Event('click', {});
eventTarget.addEventListener('click', (event) => {
  console.log(`Fired "${event.type}" event!`, event);
});
eventTarget.dispatchEvent(event, 'abc');
