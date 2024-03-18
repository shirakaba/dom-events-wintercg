export const kDeserialize = Symbol('messaging_deserialize_symbol');
export const kTransfer = Symbol('messaging_transfer_symbol');
export const kTransferList = Symbol('messaging_transfer_list_symbol');

export const kDisallowCloneAndTransfer = Symbol('kDisallowCloneAndTransfer');
export const kCloneable = Symbol('kCloneable');
export const kTransferable = Symbol('kTransferable');
export const transfer_mode_private_symbol = Symbol('node:transfer_mode');

/**
 * Mark an object as being transferable or customized cloneable in
 * `.postMessage()`.
 * This should only applied to host objects like Web API interfaces, Node.js'
 * built-in objects.
 * Objects marked as cloneable and transferable should implement the method
 * `@@kClone` and `@@kTransfer` respectively. Method `@@kDeserialize` is
 * required to deserialize the data to a new instance.
 *
 * Example implementation of a cloneable interface (assuming its located in
 * `internal/my_interface.js`):
 *
 * ```
 * class MyInterface {
 *   constructor(...args) {
 *     markTransferMode(this, true);
 *     this.args = args;
 *   }
 *   [kDeserialize](data) {
 *     this.args = data.args;
 *   }
 *   [kClone]() {
 *     return {
 *        data: { args: this.args },
 *        deserializeInfo: 'internal/my_interface:MyInterface',
 *     }
 *   }
 * }
 *
 * module.exports = {
 *   MyInterface,
 * };
 * ```
 * @param {object} obj Host objects that can be either cloned or transferred.
 * @param {boolean} [cloneable] if the object can be cloned and `@@kClone` is
 *                              implemented.
 * @param {boolean} [transferable] if the object can be transferred and
 *                                 `@@kTransfer` is implemented.
 */
export function markTransferMode(obj, cloneable = false, transferable = false) {
  if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null)
    return; // This object is a primitive and therefore already untransferable.
  let mode = kDisallowCloneAndTransfer;
  if (cloneable) mode |= kCloneable;
  if (transferable) mode |= kTransferable;
  obj[transfer_mode_private_symbol] = mode;
}
