class WebComponent extends HTMLElement {
  #hasRendered = false;
  #isReady = false;
  #isReadyPromise;
  #isReadyResolvers = new Set();
  constructor() {
    super();
    this.#initIsReadyPromise();
    this.#fixIDLAttributesSetBeforeCustomElementIsDefined();
  }
  get hasRendered() {
    return this.#hasRendered;
  }
  set hasRendered(value) {
    this.#hasRendered = value;
  }
  get isReady() {
    return this.#isReady;
  }
  set isReady(value) {
    this.#isReady = value;
    if (this.isReady) {
      this.#isReadyResolvers.forEach((isReadyResolver) => {
        isReadyResolver.resolve();
      });
      this.sendCustomEvent('ready');
    } else {
      this.#initIsReadyPromise();
    }
  }
  ready() {
    return this.#isReadyPromise;
  }
  sendCustomEvent(type, {
    bubbles = true,
    cancelable = false,
    composed = false,
    detail = null
  } = {}) {
    const event = new CustomEvent(type, {
      bubbles: bubbles,
      cancelable: cancelable,
      composed: composed,
      detail: detail
    });
    let defaultPrevented = !this.dispatchEvent(event);
    const onEventListener = this['on' + type];
    if (onEventListener && typeof onEventListener === 'function') {
      onEventListener(event);
      ({ defaultPrevented } = event);
    }
    return !defaultPrevented;
  }
  #fixIDLAttributesSetBeforeCustomElementIsDefined() {
    Object.keys(this).forEach((property) => {
      const propertyValue = this[property];
      delete this[property];
      this[property] = propertyValue;
    });
  }
  #initIsReadyPromise() {
    this.#isReadyPromise = new Promise((resolve) => {
      this.#isReadyResolvers.add({ resolve: resolve });
    });
  }
}
export { WebComponent };