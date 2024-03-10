/**
 * A stand-in for process.emitWarning() that simply calls console.warn(). These
 * warnings cannot be listened to via process.on("warning"), and do not print
 * the process ID or anything.
 *
 * @param {string | Error} error
 */
export function emitWarning(error) {
  console.warn(error);
}

/**
 * A stand-in for process.nextTick(), based on the more portable
 * queueMicrotask(). Should be sufficient for this library's purposes.
 *
 * @param {VoidFunction} callback
 * @see https://nodejs.org/api/process.html#when-to-use-queuemicrotask-vs-processnexttick
 */
export function nextTick(callback) {
  queueMicrotask(callback);
}
