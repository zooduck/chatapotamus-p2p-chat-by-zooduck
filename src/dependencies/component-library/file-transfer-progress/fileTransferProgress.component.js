import '../x-progress/index.js';
import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { svgIconService } from '../../../assets/svgIconService.util.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './fileTransferProgress.component.css',
  jsFile: './fileTransferProgress.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});

await svgIconService.loadIcons([
  svgIconService.Icon.CHEVRON_RIGHT
]);

class HTMLFileTransferProgressElement extends WebComponent {
  static LOCAL_NAME = 'file-transfer-progress';
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
  }
  static get observedAttributes() {
    return ['bytes-loaded', 'label', 'total-bytes'];
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'bytes-loaded':
        this.ready().then(() => {
          this.shadowRoot.getElementById('file-progress').value = newValue !== null ? newValue : 0;
          if (!this.bytesLoaded || !this.totalBytes) {
            return;
          }
          if (this.bytesLoaded === this.totalBytes) {
            this.#onFileTransferComplete();
          }
        });
        break;
      case 'label':
        this.ready().then(() => {
          this.shadowRoot.getElementById('file-label').textContent = this.label;
        });
        break;
      case 'total-bytes':
        this.ready().then(() => {
          this.shadowRoot.getElementById('file-progress').max = newValue !== null ? newValue : 0;
          this.shadowRoot.getElementById('file-info').classList.remove('file-info--hide');
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
    this.isReady = true;
  }
  /**
   * @type {number}
   */
  get bytesLoaded() {
    return parseInt(this.getAttribute('bytes-loaded'), 10) || 0;
  }
  set bytesLoaded(value) {
    this.setAttribute('bytes-loaded', value);
  }
  /**
   * @type {string}
   */
  get label() {
    return this.getAttribute('label') || '';
  }
  set label(value) {
    this.setAttribute('label', value);
  }
  /**
   * @type {number}
   */
  get totalBytes() {
    return parseInt(this.getAttribute('total-bytes'), 10) || 0;
  }
  set totalBytes(value) {
    this.setAttribute('total-bytes', value);
  }
  /**
   * @method
   * @returns {void}
   */
  clear() {
    this.bytesLoaded = 0;
    this.label = '';
    this.totalBytes = 0;
    this.shadowRoot.getElementById('file-info').classList.remove('file-info--file-transfer-complete');
  }
  /**
   * @method
   * @returns {void}
   */
  fail() {
    this.clear();
    this.label = 'File Transfer Failed';
    setTimeout(this.clear.bind(this), 2000);
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
      <section class="file-info" id="file-info">
        <section class="file-info__arrows-clipping-container" id="file-info-arrows-clipping-container">
          <section class="file-info__arrows">
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
            ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_RIGHT, { class: 'icon' })}
          </section>
        </section>
        <label class="file-info__label" id="file-label">${this.label}</label>
        <x-progress class="file-info__progress" id="file-progress" max="0" value="0"></x-progress>
      </section>
    `;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #onFileTransferComplete() {
    this.shadowRoot.getElementById('file-info').classList.add('file-info--file-transfer-complete');
    setTimeout(this.clear.bind(this), 2000);
  }
}

customElements.define(HTMLFileTransferProgressElement.LOCAL_NAME, HTMLFileTransferProgressElement);
