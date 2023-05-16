import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
class HTMLLinkToElementElement extends WebComponent {
  static LOCAL_NAME = 'link-to-element';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#addEventListeners();
  }
  static get observedAttributes() {
    return ['for'];
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    this.isReady = true;
  }
  get for() {
    return this.getAttribute('for') || '';
  }
  onHyperlinkClick(event) {
    event.preventDefault();
  }
  render() {
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  #addEventListeners() {
    this.shadowRoot.addEventListener('click', this.#onClick.bind(this));
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <a href="#" on:click="onHyperlinkClick()"><slot></slot></a>
    `;
  }
  #onClick() {
    const linkedElement = this.getRootNode().getElementById(this.for) || document.getElementById(this.for);
    if (linkedElement) {
      linkedElement.scrollIntoView();
    }
  }
}
customElements.define(HTMLLinkToElementElement.LOCAL_NAME, HTMLLinkToElementElement);