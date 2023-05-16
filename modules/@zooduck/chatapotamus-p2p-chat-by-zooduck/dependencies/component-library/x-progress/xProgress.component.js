import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './xProgress.component.css',
  jsFile: './xProgress.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});
class HTMLXProgressElement extends WebComponent {
  static LOCAL_NAME = 'x-progress';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
  }
  static get observedAttributes() {
    return ['max', 'value'];
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'max':
      case 'value':
        this.ready().then(() => {
          this.#updateProgressBar();
        });
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    this.isReady = true;
  }
  get max() {
    return parseInt(this.getAttribute('max'), 10) || 1;
  }
  set max(value) {
    this.setAttribute('max', value);
  }
  get value() {
    return parseInt(this.getAttribute('value'), 10) || 0;
  }
  set value(value) {
    this.setAttribute('value', value);
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  #createContent() {
    return new SafeDOMParser().parseFromString`
      <section id="root">
        <div class="progress-bar" id="progress-bar"></div>
      </section>
    `;
  }
  #updateProgressBar() {
    this.shadowRoot.getElementById('progress-bar').style.width = ((this.value / this.max) * 100) + '%';
  }
}
customElements.define(HTMLXProgressElement.LOCAL_NAME, HTMLXProgressElement);