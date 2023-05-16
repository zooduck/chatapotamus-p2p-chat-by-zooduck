import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';

class HTMLLinkToElementElement extends WebComponent {
  static LOCAL_NAME = 'link-to-element';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#addEventListeners();
  }
  /**
   * @static
   * @readonly
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['for'];
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
   * @readonly
   * @type {string}
   */
  get for() {
    return this.getAttribute('for') || '';
  }
  /**
   * @type {EventListener}
   */
  onHyperlinkClick(event) {
    event.preventDefault();
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
    this.shadowRoot.addEventListener('click', this.#onClick.bind(this));
  }
  /**
   * @private
   * @method
   * @returns {HTMLElement}
   */
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <a href="#" on:click="onHyperlinkClick()"><slot></slot></a>
    `;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #onClick() {
    const linkedElement = this.getRootNode().getElementById(this.for) || document.getElementById(this.for);
    if (linkedElement) {
      linkedElement.scrollIntoView();
    }
  }
}

customElements.define(HTMLLinkToElementElement.LOCAL_NAME, HTMLLinkToElementElement);
