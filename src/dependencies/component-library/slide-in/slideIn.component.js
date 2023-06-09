import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './slideIn.component.css',
  jsFile: './slideIn.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});

class HTMLSlideInElement extends WebComponent {
  static LOCAL_NAME = 'slide-in';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#addEventListeners();
  }
  /**
   * @static
   * @readonly
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['open'];
  }
  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
      CLOSE: this.#createEventTypeWithNamespace('close'),
      OPEN: this.#createEventTypeWithNamespace('open')
    };
  }
  /**
   * @private
   * @static
   * @method
   * @returns {string}
   */
  static #createEventTypeWithNamespace(eventType) {
    return this.LOCAL_NAME.replace(/-/g, '') + eventType;
  }
  /**
   * @method
   * @param {string} attributeName
   * @param {string|null} oldValue
   * @param {string|null} newValue
   * @returns {void}
   */
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }

    switch (attributeName) {
      case 'open':
        this.ready().then(() => {
          requestAnimationFrame(() => {
            this.shadowRoot.getElementById('slotted-content-container').classList.toggle('slotted-content-container--open', newValue !== null);
            if (newValue === null) {
              this.shadowRoot.getElementById('clipping-container').classList.remove('clipping-container--with-box-shadow');
              this.sendCustomEvent(this.constructor.EventDict.CLOSE);
            } else {
              this.sendCustomEvent(this.constructor.EventDict.OPEN);
            }
            this.#updateTabIndex();
          });
        });
        break;
      default:
        break;
    }
  }
  /**
   * @method
   * @returns {void}
   */
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    this.#updateTabIndex();
    this.isReady = true;
  }
  /**
   * @type {boolean}
   */
  get open() {
    return this.hasAttribute('open');
  }
  set open(value) {
    this.toggleAttribute('open', value);
  }
  /**
   * @type {EventListener}
   */
  onTransitionEnd() {
    this.shadowRoot.getElementById('clipping-container').classList.toggle('clipping-container--with-box-shadow', this.open);
  }
  /**
   * @method
   * @returns {void}
   */
  render() {
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #addEventListeners() {
    this.shadowRoot.addEventListener('transitionend', this.onTransitionEnd.bind(this));
  }
  /**
   * @private
   * @method
   * @returns {HTMLElement}
   */
  #createContent() {
    return new SafeDOMParser().parseFromString`
      <main class="clipping-container" id="clipping-container">
        <section class="slotted-content-container" id="slotted-content-container"><slot></slot></section>
      </main>
    `;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #updateTabIndex() {
    this.tabIndex = this.open ? 0 : -1;
  }
}

customElements.define(HTMLSlideInElement.LOCAL_NAME, HTMLSlideInElement);
