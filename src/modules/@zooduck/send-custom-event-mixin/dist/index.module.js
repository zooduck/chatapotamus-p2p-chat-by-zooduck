function sendCustomEventMixin(Base) {
  class SendCustomEvent {
    #eventTarget;
    constructor() {
      this.#eventTarget = new EventTarget();
    }
    addEventListener(type, listener) {
      return this.#eventTarget.addEventListener(type, listener);
    }
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
    #dispatchEvent(event) {
      return this.#eventTarget.dispatchEvent(event);
    }
  }
  if (Base) {
    Object.setPrototypeOf(SendCustomEvent.prototype, Base.prototype);
  }
  return SendCustomEvent;
}
export { sendCustomEventMixin };