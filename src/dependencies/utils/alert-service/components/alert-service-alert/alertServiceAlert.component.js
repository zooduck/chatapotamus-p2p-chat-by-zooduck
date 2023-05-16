import '../../../../component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/global.css',
  jsFile: '../../../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './alertServiceAlert.component.css',
  jsFile: './alertServiceAlert.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/variables.css',
  jsFile: '../../../../../styles/variables.css.js'
});

class HTMLAlertServiceAlertElement extends WebComponent {
  static LOCAL_NAME = 'alert-service-alert';

  #DEFAULT_AFFIRMATIVE_PROMPT = 'OK';
  #DEFAULT_MESSAGE = 'Alert';

  #keyDownEventListener;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
  }

  /**
   * @static
   * @readonly
   * @type {string[]}
   */
  static get observedAttributes() {
    return [
      'affirmative-prompt',
      'alert-title',
      'contained',
      'messages'
    ];
  }

  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
      OK: this.#createEventTypeWithNamespace('ok')
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

  /**
   * @method
   * @returns {void}
   */
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

  /**
   * @method
   * @returns {void}
   */
  disconnectedCallback() {
    document.removeEventListener('keydown', this.#keyDownEventListener);
  }

  /**
   * @type {string}
   */
  get affirmativePrompt() {
    return this.getAttribute('affirmative-prompt') || this.#DEFAULT_AFFIRMATIVE_PROMPT;
  }

  set affirmativePrompt(value) {
    this.setAttribute('affirmative-prompt', value);
  }

  /**
   * @type {string}
   */
  get alertTitle() {
    return this.getAttribute('alert-title') || '';
  }

  set alertTitle(value) {
    this.setAttribute('alert-title', value);
  }

  /**
   * @type {boolean}
   */
  get contained() {
    return this.hasAttribute('contained');
  }

  set contained(value) {
    this.toggleAttribute('contained', value);
  }

  /**
   * @type {EventListener}
   */
  onAffirmativeButtonClick() {
    this.sendCustomEvent(this.constructor.EventDict.OK);
    this.remove();
  }

  /**
   * @type {EventListener}
   */
  onKeyDown(event) {
    const { code, key, keyCode } = event;
    const isEnterKey = code === 'Enter' || key === 'Enter' || keyCode === 13;
    const isTabKey = code === 'Tab' || key === 'Tab' || keyCode === 9;

    if (isTabKey) {
      // -----------
      // Trap Focus
      // -----------
      event.preventDefault();
    } else if (isEnterKey && !this.contained) {
      // -------------------------------------------------------------
      // If the alert text is selected, focus will have shifted from
      // the affirmative prompt button to the selected text but we
      // still want to close the alert if the Enter key is pressed.
      // -------------------------------------------------------------
      this.sendCustomEvent(this.constructor.EventDict.OK);
      this.remove();
    }
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
   * @returns {void}
   */
  #addEventListeners() {
    document.addEventListener('keydown', this.#keyDownEventListener);
  }

  /**
   * @private
   * @method
   * @returns {HTMLElement}
   */
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <main id="root">
        <h1 class="title" id="title">${this.alertTitle}</h1>
        <section class="messages" id="messages">${this.#DEFAULT_MESSAGE}</section>
        <section class="control-prompts">
          <x-button
            action="primary"
            class="control-prompts__button"
            id="affirmative-prompt"
            on:click="onAffirmativeButtonClick()">${this.affirmativePrompt}</x-button>
        </section>
      </main>
    `;
  }
}

customElements.define(HTMLAlertServiceAlertElement.LOCAL_NAME, HTMLAlertServiceAlertElement);
