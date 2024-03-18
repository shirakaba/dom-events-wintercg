# DOM Events implementation for WinterCG

[![npm status](https://img.shields.io/npm/v/dom-events-wintercg.svg)](https://npm.im/dom-events-wintercg)

A polyfill for [DOM Events](https://dom.spec.whatwg.org/#introduction-to-dom-events) and related APIs:

- [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException)
- [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

Implementation extracted from the Node.js codebase [as of 10th March 2024](https://github.com/nodejs/node/blob/575ced813988af00478aa1e6759487888c607238/lib/internal/event_target.js) (version `21.7.1`, I believe). Some simplified internals extracted from [readable-stream](https://github.com/nodejs/readable-stream/tree/main).

To clarify, this project is not affiliated with [WinterCG](https://wintercg.org) (i.e. is not an official work). It merely implements part of the WinterCG [Common Minimum API](https://github.com/wintercg/proposal-common-minimum-api) proposal.

## Installation

Install this npm package as follows, depending on which package manager you're using.

- **npm:**

  ```sh
  npm install --save dom-events-wintercg
  ```

- **Yarn:**

  ```sh
  yarn add dom-events-wintercg
  ```

- **pnpm:**

  ```sh
  pnpm add dom-events-wintercg
  ```

- **Bun:**

  ```sh
  bun add dom-events-wintercg
  ```

- **Deno:** No need to install. Just add the [npm: specifier](https://docs.deno.com/runtime/manual/node/npm_specifiers) when importing.

## Usage

### As a polyfill

Run this polyfill in your app's entrypoint file so that it fills in the APIs as early as possible in the app lifecycle.

```js
import { polyfill } from 'dom-events-wintercg';

polyfill(globalThis);

// All implemented APIs will now be available in global scope

const eventTarget = new EventTarget();
const event = new Event('click', {});
eventTarget.addEventListener('click', (event) => {
  console.log(`Fired "${event.type}" event!`, event);
});
eventTarget.dispatchEvent(event, 'abc');
```

And for TypeScript typings, add the `DOM` lib in `tsconfig.json`:

```js
{
  "compilerOptions": {
    "lib": ["DOM"],
    // ...
  }
}
```

### As a module

Here, we import from the npm package each time we want to use an API, rather than polyfilling globally.

```js
import { Event, EventTarget } from 'dom-events-wintercg';

const eventTarget = new EventTarget();
const event = new Event('click', {});
eventTarget.addEventListener('click', (event) => {
  console.log(`Fired "${event.type}" event!`, event);
});
eventTarget.dispatchEvent(event, 'abc');
```

Some limited TypeScript typings will be inferred from the library's JavaScript source code, but if you'd rather use the `lib.dom.d.ts` typings built into TypeScript (which I would recommend), then:

1. Add the `DOM` lib in `tsconfig.json`:

   ```js
   {
     "compilerOptions": {
       "lib": ["DOM"],
       // ...
     }
   }
   ```

2. Do this little dance:

   ```ts
   import {
     Event as EventImpl,
     EventTarget as EventTargetImpl,
   } from 'dom-events-wintercg';

   // Redeclare the implementation using the types from lib.dom.d.ts
   const Event = EventImpl as unknown as Event;
   const EventTarget = EventTargetImpl as unknown as EventTarget;

   const eventTarget = new EventTarget();
   const event = new Event('click', {});
   eventTarget.addEventListener('click', (event) => {
     console.log(`Fired "${event.type}" event!`, event);
   });
   eventTarget.dispatchEvent(event, 'abc');
   ```

### Via a bundler

This is my best-effort attempt to document usage with a bundler. These instructions are **untested**, so please open a PR if you find they need tweaking!

In all cases, you can set up TypeScript typings via adding the `DOM` lib to your `tsconfig.json`:

```js
{
  "compilerOptions": {
    "lib": ["DOM"],
    // ...
  }
}
```

Below, I'll describe for each bundler how to integrate this package into your bundle.

#### Webpack 5

This configuration ensures that all the implemented APIs are available from global scope:

```js
const webpackConfig = {
  plugins: [
    new webpack.ProvidePlugin({
      AbortController: ['dom-events-wintercg', 'AbortController'],
      AbortSignal: ['dom-events-wintercg', 'AbortSignal'],
      CustomEvent: ['dom-events-wintercg', 'CustomEvent'],
      DOMException: ['dom-events-wintercg', 'DOMException'],
      Event: ['dom-events-wintercg', 'Event'],
      EventTarget: ['dom-events-wintercg', 'EventTarget'],
    }),
  ],
};
```

Additionally, you can polyfill _some of_ the Node.js [events](https://nodejs.org/api/events.html) module (e.g. to use a Node.js library in a browser app) as follows. ⚠️ Be warned that while this package implements `CustomEvent`, `Event`, and `EventTarget`, it does not implement _all_ the APIs in the Node.js `events` module. For example, it does not implement `EventEmitter`.

```diff
  const webpackConfig = {
+   resolve: {
+     fallback: {
+       events: require.resolve('dom-events-wintercg'),
+     },
+   },
    plugins: [
      new webpack.ProvidePlugin({
        AbortController: ['dom-events-wintercg', 'AbortController'],
        AbortSignal: ['dom-events-wintercg', 'AbortSignal'],
        CustomEvent: ['dom-events-wintercg', 'CustomEvent'],
        DOMException: ['dom-events-wintercg', 'DOMException'],
        Event: ['dom-events-wintercg', 'Event'],
        EventTarget: ['dom-events-wintercg', 'EventTarget'],
      }),
    ],
  };
```

## Prerequisities

This polyfill relies on a few language features.

### Required APIs

Your JS engine/runtime must support the following APIs (this is a non-exhaustive list):

- At least [ES6](https://www.w3schools.com/js/js_es6.asp). I'm not sure exactly what this repo makes use of, but technically the linter allows up to ES2022.
- [Private properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
- [FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry)
- [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
- [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
- [WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef)
- Basic [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (`import` and `export`)

### Optional APIs

Some of the features of this polyfill are optional, and will fail gracefully if your JS engine/runtime lacks support for the underlying APIs.

### `AbortSignal.timeout()`

[AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) support requires the following APIs:

- [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout)

If missing, `AbortSignal.timeout()` will throw an Error with code `ERR_METHOD_NOT_IMPLEMENTED` when called.

## Differences from browser EventTarget

Beyond the differences explained in the Node.js [SDK docs](https://nodejs.org/api/events.html#nodejs-eventtarget-vs-dom-eventtarget), see this excellent article from NearForm about how they first [brought EventTarget to Node.js](https://www.nearform.com/insights/node-js-and-the-struggles-of-being-an-eventtarget/), which covers some of the compromises they had to make in the implementation. In particular, there is no concept of bubbling or capturing, and `event.preventDefault()` is a bit useless, as it never has a "default action" to prevent.

## Integrating into runtimes

This library, being runtime-agnostic, does nothing to keep the event loop alive for Worker event listeners. See the [Node.js internals](https://github.com/nodejs/node/blob/ba06c5c509956dc413f91b755c1c93798bb700d4/lib/internal/worker/io.js#L293) for how they implemented that.
