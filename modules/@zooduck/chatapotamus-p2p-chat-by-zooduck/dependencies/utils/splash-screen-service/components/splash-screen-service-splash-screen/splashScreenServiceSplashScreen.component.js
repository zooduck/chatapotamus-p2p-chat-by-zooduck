import { SafeDOMParser } from '../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { svgIconService } from '../../../../../assets/svgIconService.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/global.css',
  jsFile: '../../../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './splashScreenServiceSplashScreen.component.css',
  jsFile: './splashScreenServiceSplashScreen.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/variables.css',
  jsFile: '../../../../../styles/variables.css.js'
});
await svgIconService.loadIcons([svgIconService.Icon.CANCELLATION_X]);
class HTMLSplashScreenServiceSplashScreenElement extends WebComponent {
  static LOCAL_NAME = 'splash-screen-service-splash-screen';
  #resizeObserver;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
    this.#addObservers();
  }
  static get observedAttributes() {
    return ['cancelable', 'contained', 'message', 'splash-screen-title', 'with-borders'];
  }
  static EventDict() {
    return {
      CANCEL: this.LOCAL_NAME.replace(/-/g, '') + 'cancel'
    };
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'cancelable':
        this.ready().then(() => {
          if (newValue === null) {
            this.shadowRoot.getElementById('cancel-button')?.remove();
          } else {
            this.shadowRoot.getElementById('root').append(this.#createCancelButton());
          }
        });
        break;
      case 'contained':
        this.ready().then(() => {
          this.shadowRoot.getElementById('root').classList.toggle('contained', newValue !== null);
        });
        break;
      case 'message':
        this.ready().then(() => {
          this.shadowRoot.getElementById('message').innerText = newValue;
        });
        break;
      case 'splash-screen-title':
        this.ready().then(() => {
          this.shadowRoot.getElementById('title').innerText = newValue;
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
    this.hasRendered = true;
    this.isReady = true;
  }
  get cancelable() {
    return this.hasAttribute('cancelable');
  }
  set cancelable(value) {
    this.toggleAttribute('cancelable', value);
  }
  get contained() {
    return this.hasAttribute('contained');
  }
  set contained(value) {
    this.toggleAttribute('contained', value);
  }
  get message() {
    return this.getAttribute('message') || '';
  }
  set message(value) {
    this.setAttribute('message', value);
  }
  get splashScreenTitle() {
    return this.getAttribute('splash-screen-title') || '';
  }
  set splashScreenTitle(value) {
    this.setAttribute('splash-screen-title', value);
  }
  get withBorders() {
    return this.hasAttribute('with-borders');
  }
  set withBorders(value) {
    this.toggleAttribute('with-borders', value);
  }
  get #baseFontSizePixels() {
    return parseFloat(getComputedStyle(this).fontSize);
  }
  onCancelButtonClick() {
    this.sendCustomEvent(this.constructor.EventDict.CANCEL, { cancelable: true });
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
  }
  #addObservers() {
    this.#resizeObserver.observe(this);
  }
  #createCancelButton() {
    return new SafeDOMParser(this).parseFromString`
      <x-button class="cancel-button" on:click="onCancelButtonClick()">
        ${svgIconService.getIcon(svgIconService.Icon.CANCELLATION_X, { class: 'icon' })}
      </x-button>
    `;
  }
  #createContent() {
    return new SafeDOMParser().parseFromString`
      <section id="root">
        <section class="top-half">
          <h1 class="top-half__title" id="title">${this.splashScreenTitle}</h1>
          <p class="top-half__message" id="message">${this.message}</p>
        </section>
        <div class="something-happening-animation">
          <div class="something-happening-animation__block"></div>
          <div class="something-happening-animation__block"></div>
          <div class="something-happening-animation__block"></div>
        </div>
      </section>
    `;
  }
  #onResize() {
    const baseFontSizePixelsReducedToFitAvailableWidth = this.offsetWidth * 0.04;
    const baseFontSizePixelsToUse = baseFontSizePixelsReducedToFitAvailableWidth < this.#baseFontSizePixels ? baseFontSizePixelsReducedToFitAvailableWidth : this.#baseFontSizePixels;
    this.shadowRoot.getElementById('root').style.fontSize = baseFontSizePixelsToUse + 'px';
  }
}
customElements.define(HTMLSplashScreenServiceSplashScreenElement.LOCAL_NAME, HTMLSplashScreenServiceSplashScreenElement);