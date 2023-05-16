import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './xLoading.component.css',
  jsFile: './xLoading.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});

class HTMLXLoadingElement extends WebComponent {
  static LOCAL_NAME = 'x-loading';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
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
    this.isReady = true;
  }
  /**
   * @method
   * @returns {void}
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  /**
   * @private
   * @method
   * @returns {HTMLElement}
   */
  #createContent() {
    return new SafeDOMParser().parseFromString`
      <section id="root">
        <section class="loading-bar-container">
          <div class="loading-bar-container__loading-bar"></div>
        </section>
      </section>
    `;
  }
}

customElements.define(HTMLXLoadingElement.LOCAL_NAME, HTMLXLoadingElement);
