import '../../../../component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/global.css',
  jsFile: '../../../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './alertServiceConfirm.component.css',
  jsFile: './alertServiceConfirm.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/variables.css',
  jsFile: '../../../../../styles/variables.css.js'
});
class HTMLAlertServiceConfirmElement extends WebComponent {
  static LOCAL_NAME = 'alert-service-confirm';
  #DEFAULT_ACTION_TYPE;
  #DEFAULT_AFFIRMATIVE_PROMPT = 'OK';
  #DEFAULT_MESSAGE = 'Confirm';
  #DEFAULT_NEGATIVE_PROMPT = 'Cancel';
  #focussedPromptButton;
  #keyDownEventListener;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#DEFAULT_ACTION_TYPE = customElements.get('x-button').Action.PRIMARY;
  }
  static get observedAttributes() {
    return [
      'affirmative-prompt',
      'alert-title',
      'contained',
      'messages',
      'negative-prompt'
    ];
  }
  static get EventDict() {
    return {
      OK: this.#createEventTypeWithNamespace('ok'),
      CANCEL: this.#createEventTypeWithNamespace('cancel')
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
      case 'messages':
        this.ready().then(() => {
          this.shadowRoot.getElementById('messages').innerHTML = '';
          if (!newValue) {
            const messageElement = document.createElement('p');
            messageElement.textContent = this.#DEFAULT_MESSAGE;
            this.shadowRoot.getElementById('messages').append(messageElement);
          } else {
            newValue.split('!P!').map((message) => {
              const messageElement = document.createElement('p');
              messageElement.textContent = message;
              this.shadowRoot.getElementById('messages').append(messageElement);
            });
          }
        });
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    this.#keyDownEventListener = this.onKeyDown.bind(this);
    this.#addEventListeners();
    if (this.hasRendered) {
      return;
    }
    this.render();
    this.shadowRoot.getElementById('affirmative-prompt').focus();
    this.isReady = true;
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this.#keyDownEventListener);
  }
  get actionType() {
    return this.getAttribute('action-type') || this.#DEFAULT_ACTION_TYPE;
  }
  set actionType(value) {
    this.setAttribute('action-type', value);
  }
  get affirmativePrompt() {
    return this.getAttribute('affirmative-prompt') || this.#DEFAULT_AFFIRMATIVE_PROMPT;
  }
  set affirmativePrompt(value) {
    this.setAttribute('affirmative-prompt', value);
  }
  get confirmTitle() {
    return this.getAttribute('confirm-title') || '';
  }
  set confirmTitle(value) {
    this.setAttribute('confirm-title', value);
  }
  get contained() {
    return this.hasAttribute('contained');
  }
  set contained(value) {
    this.toggleAttribute('contained', value);
  }
  get negativePrompt() {
    return this.getAttribute('negative-prompt') || this.#DEFAULT_NEGATIVE_PROMPT;
  }
  set negativePrompt(value) {
    this.setAttribute('negative-prompt', value);
  }
  onAffirmativeButtonClick() {
    this.sendCustomEvent(this.constructor.EventDict.OK);
    this.remove();
  }
  onKeyDown(event) {
    const { code, key, keyCode, shiftKey } = event;
    const isEnterKey = code === 'Enter' || key === 'Enter' || keyCode === 13;
    if (!this.#focussedPromptButton && isEnterKey && !this.contained) {
      this.sendCustomEvent(this.constructor.EventDict.OK);
      this.remove();
      return;
    }
    if (!this.#focussedPromptButton && shiftKey && key === 'Tab') {
      event.preventDefault();
    } else if (this.#focussedPromptButton && this.#focussedPromptButton.id === 'affirmative-prompt' && shiftKey && key === 'Tab') {
      event.preventDefault();
    } else if (this.#focussedPromptButton && this.#focussedPromptButton.id === 'negative-prompt' && !shiftKey && key === 'Tab') {
      event.preventDefault();
    }
  }
  onNegativeButtonClick() {
    this.sendCustomEvent(this.constructor.EventDict.CANCEL);
    this.remove();
  }
  onPromptButtonBlur() {
    this.#focussedPromptButton = null;
  }
  onPromptButtonFocus(event) {
    this.#focussedPromptButton = event.target;
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  #addEventListeners() {
    document.addEventListener('keydown', this.#keyDownEventListener);
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <main id="root">
        <h1 class="title" id="title">${this.confirmTitle}</h1>
        <section class="messages" id="messages">${this.#DEFAULT_MESSAGE}</section>
        <section class="control-prompts">
          <x-button
            action="${this.actionType}"
            class="control-prompts__button"
            id="affirmative-prompt"
            on:blur="onPromptButtonBlur()"
            on:click="onAffirmativeButtonClick()"
            on:focus="onPromptButtonFocus()">${this.affirmativePrompt}</x-button>
          <x-button
            action="secondary"
            class="control-prompts__button"
            id="negative-prompt"
            on:blur="onPromptButtonBlur()"
            on:click="onNegativeButtonClick()"
            on:focus="onPromptButtonFocus()">${this.negativePrompt}</x-button>
        </section>
      </main>
    `;
  }
}
customElements.define(HTMLAlertServiceConfirmElement.LOCAL_NAME, HTMLAlertServiceConfirmElement);