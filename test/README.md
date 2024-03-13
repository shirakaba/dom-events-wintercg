# Tests

These tests are ported from the [Node.js Core Tests](https://github.com/nodejs/node/tree/main/test).

The original test rig is quite complex to reproduce and is based on CommonJS, so to keep complexity down, we've manually converted them from CommonJS to ESM.

## Testing philosophy

Although the tests are taken from Node.js Core, we're aiming to test the behaviour of EventTarget itself rather than its interaction with the Node.js runtime (because this is a runtime-agnostic library). So some tests may be skipped due to being out-of-scope.
