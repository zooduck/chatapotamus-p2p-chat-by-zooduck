import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { svgIconService } from '../../../assets/svgIconService.util.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './xDetails.component.css',
  jsFile: './xDetails.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});
await svgIconService.loadIcons([
  svgIconService.Icon.CHEVRON_DOWN,
  svgIconService.Icon.CHEVRON_UP
]);
class HTMLXDetailsElement extends WebComponent {
  static LOCAL_NAME = 'x-details';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
  }
  static get observedAttributes() {
    return ['open', 'summary'];
  }
  static get EventDict() {
    return {
      CLOSE: this.#createEventTypeWithNamespace('close'),
      OPEN: this.#createEventTypeWithNamespace('open')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.LOCAL_NAME.replace(/-/g, '') + eventType;
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'open':
        this.ready().then(() => {
          this.shadowRoot.getElementById('details').classList.toggle('details--visible', this.open);
          const eventType = this.open ? this.constructor.EventDict.OPEN : this.constructor.EventDict.CLOSE;
          this.sendCustomEvent(eventType);
        });
        break;
      case 'summary':
        this.ready().then(() => {
          this.shadowRoot.getElementById('summary-text').textContent = newValue;
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
  get disabled() {
    return this.hasAttribute('disabled');
  }
  set disabled(value) {
    this.toggleAttribute('disabled', value);
  }
  get open() {
    return this.hasAttribute('open');
  }
  set open(value) {
    this.toggleAttribute('open', value);
  }
  get summary() {
    return this.getAttribute('summary') || '';
  }
  set summary(value) {
    this.setAttribute('summary', value);
  }
  onSummaryClick() {
    if (this.disabled) {
      return;
    }
    this.toggleAttribute('open');
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <main>
        <header class="summary" on:click="onSummaryClick()">
          <span class="summary__text" id="summary-text">Details</span>
          ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_UP, { class: 'summary__details-state-chevron icon' })}
        </header>
        <section class="details" id="details"><slot></slot> </section>
      </main>
    `;
  }
}
customElements.define(HTMLXDetailsElement.LOCAL_NAME, HTMLXDetailsElement);