/**
 * Not intended to be used directly. Mixes functionality
 * useful for ALL custom elements.
 *
 * Automatically fixes an issue with Custom Elements that occurs when
 * an IDL Attribute (DOM Property) is set before the element is defined
 * in the custom registry.
 *
 * @example
 * // Using the ready() Promise to safely reference elements that might not exist yet:
 * class PageElement extends WebComponent {
 *   constructor() {
 *     super()
 *   }
 *   static get observedAttributes() {
 *     return ['page-title']
 *   }
 *   // This can fire before the connectedCallback() lifecycle callback!
 *   attributeChangedCallback(attributeName, oldValue, newValue) {
 *     this.ready().then(() => {
 *       this.shadowRoot.getElementById(attributeName).textContent = newValue
 *     })
 *   }
 *   connectedCallback() {
 *     this.render()
 *     this.isReady = true
 *   }
 *   render() {
 *     this.shadowRoot.innerHTML = `
 *       <header id="page-title"></header>
 *       <main></main>
 *       <footer></footer>
 *     `
 *   }
 * }
 *
 * @example
 * // Using the hasRendered property to prevent re-rendering in the connectedCallback() lifecycle callback:
 * class PageELement extends WebComponent {
 *   // ...
 *   connectedCallback() {
 *      if (this.hasRendered) {
 *        return
 *      }
 *      this.render()
 *   }
 *   render() {
 *     // ...
 *     this.hasRendered = true
 *   }
 * }
 *
 * @mixin
 * @mixes HTMLElement
 */
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
  /**
   * @type {boolean}
   */
  get hasRendered() {
    return this.#hasRendered;
  }
  set hasRendered(value) {
    this.#hasRendered = value;
  }
  /**
   * @type {boolean}
   */
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
  /**
   * @method
   * @returns {Promise<void>}
   */
  ready() {
    return this.#isReadyPromise;
  }
  /**
   * Should be used in place of dispatchEvent().
   *
   * @example
   * // Add an event listener using an event handler property:
   * class MyCustomElement extends WebComponent {
   *   constructor() {
   *     super()
   *   }
   * }
   * customElements.define('my-custom-element', MyCustomElement)
   * const myCustomElement = document.createElement('my-custom-element')
   * myCustomElement.onmycustomevent = (event) => console.log(event.type)
   * myCustomElement.sendCustomEvent('mycustomevent')
   * // logs "mycustomevent"
   *
   * @example
   * // Add an event listener using addEventListener():
   * myCustomElement.addEventListener('mycustomevent', (event) => { console.log(event.type) })
   * myCustomElement.sendCustomEvent('mycustomevent')
   * // logs "mycustomevent"
   *
   * @method
   * @param {string} type
   * @param {{bubbles: boolean, cancelable: boolean, composed: boolean, detail: *}}
   * @returns {boolean} isNotCancelled
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
  #fixIDLAttributesSetBeforeCustomElementIsDefined() {
    Object.keys(this).forEach((property) => {
      const propertyValue = this[property];
      delete this[property];
      this[property] = propertyValue;
    });
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #initIsReadyPromise() {
    this.#isReadyPromise = new Promise((resolve) => {
      this.#isReadyResolvers.add({ resolve: resolve });
    });
  }
}

export { WebComponent };
