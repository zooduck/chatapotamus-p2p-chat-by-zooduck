/**
 * WARNING! Not to be used with elements!
 *
 * Not intended to be used directly.
 * Decorates the superclass with eventing capability including event handler properties.
 *
 * By default, events are dispatched on the superclass only, but can also be dispatched
 * on the window using the "dispatchEventOnWindow" option.
 *
 * @example
 * // Add an event listener using an event handler property:
 * class Eventful extends sendCustomEventMixin(OptionalBaseClass) {
 *   constructor() {
 *     super()
 *   }
 * }
 * const eventful = new Eventful()
 * eventful.onmycustomevent = (event) => console.log(event.type)
 * eventful.sendCustomEvent('mycustomevent')
 * // Logs "mycustomevent"
 *
 * @example
 * // Add an event listener using addEventListener():
 * eventful.addEventListener('mycustomevent', (event) => { console.log(event.type) })
 * eventful.sendCustomEvent('mycustomevent')
 * // Logs "mycustomevent"
 *
 * @example
 * // Dispatch the event on the window
 * window.addEventListener('mycustomevent', (event) => { console.log(event.type) })
 * eventful.sendCustomEvent('mycustomevent', { dispatchEventOnWindow: true })
 * // Logs "mycustomevent"
 *
 * @mixin
 * @param {ClassDecorator} [Base]
 */
function sendCustomEventMixin(Base) {
  class SendCustomEvent {
    #eventTarget;
    constructor() {
      this.#eventTarget = new EventTarget();
    }
    /**
     * @method
     * @param {string} type
     * @param {EventListener} listener
     * @returns {void}
     */
    addEventListener(type, listener) {
      return this.#eventTarget.addEventListener(type, listener);
    }
    /**
     * @method
     * @param {string} type
     * @param {{bubbles: boolean, cancelable: boolean, composed: boolean, detail: *, dispatchEventOnWindow: boolean}} options
     * @returns {boolean} isNotCancelled
     */
    sendCustomEvent(type, {
      bubbles = false,
      cancelable = false,
      composed = false,
      detail = null,
      dispatchEventOnWindow = false
    } = {}) {
      const event = new CustomEvent(type, {
        bubbles: bubbles,
        cancelable: cancelable,
        composed: composed,
        detail: detail
      });

      let defaultPrevented = dispatchEventOnWindow
        ? !this.#dispatchEvent(event) || !window.dispatchEvent(event)
        : !this.#dispatchEvent(event);

      const onEventListener = this['on' + type];

      if (onEventListener && typeof onEventListener === 'function') {
        onEventListener(event);

        ({ defaultPrevented } = event);
      }

      return !defaultPrevented;
    }
    /**
     * @private
     * @method
     * @param {CustomEvent} event
     * @returns {boolean} isNotCancelled
     */
    #dispatchEvent(event) {
      return this.#eventTarget.dispatchEvent(event);
    }
  }

  if (Base) {
    Object.setPrototypeOf(SendCustomEvent.prototype, Base.prototype); // Equivalent to "class SendCustomEvent extends Base"
  }

  return SendCustomEvent;
}


export { sendCustomEventMixin };
