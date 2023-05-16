/**
 * @typedef {import('./typedef.js')}
 */

import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../styles/global.css',
  jsFile: '../../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './xButton.component.css',
  jsFile: './xButton.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../styles/variables.css',
  jsFile: '../../../../styles/variables.css.js'
});

class HTMLXButtonElement extends WebComponent {
  static LOCAL_NAME = 'x-button';
  static formAssociated = true;

  #DEFAULT_BUTTON_TYPE = 'submit';

  #elementInternals;
  #hasUserInteracted;
  #htmlResetButton;
  #htmlSubmitButton;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.#elementInternals = this.attachInternals();
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#htmlResetButton = this.#createHTMLResetButton();
    this.#htmlSubmitButton = this.#createHTMLSubmitButton();
  }

  /**
   * @static
   * @readonly
   * @type {string[]}
   */
  static get observedAttributes() {
    return [
      'action',
      'disabled',
      'form',
      'text-align-left',
      'toggle-state' // For setting the defaultToggleState only
    ];
  }

  /**
   * @static
   * @readonly
   * @type {Object.<string, XButtonAction>}
   */
  static get Action() {
    return {
      DANGER: 'danger',
      PRIMARY: 'primary',
      SECONDARY: 'secondary',
      WARNING: 'warning'
    };
  }

  /**
   * @readonly
   * @type {Object.<string, XButtonAction>}
   */
  get Action() {
    return this.constructor.Action;
  }

  /**
   * @static
   * @readonly
   * @type {Object.<string, number>}
   */
  static get ToggleState() {
    return {
      OFF: 0,
      ON: 1
    };
  }

  /**
   * @readonly
   * @type {Object.<string, number>}
   */
  get ToggleState() {
    return this.constructor.ToggleState;
  }

  /**
   * @method
   * @param {string} attributeName
   * @param {string|null} oldValue
   * @param {string|null} newValue
   * @returns {void}
   */
  attributeChangedCallback(attributeName, oldValue, newValue) {
    switch (attributeName) {
      case 'disabled':
        this.ready().then(() => {
          this.shadowRoot.getElementById('button').toggleAttribute('disabled', newValue !== null);
        });
        break;
      case 'form':
        if (this.form) {
          this.form.append(this.#htmlSubmitButton);
        }
        break;
      case 'text-align-left':
        this.ready().then(() => {
          this.shadowRoot.getElementById('button').classList.toggle('button--text-align-left', newValue !== null);
        });
        break;
      case 'toggle-state':
        if (this.#hasUserInteracted) {
          return;
        }
        this.ready().then(() => {
          this.toggle(parseInt(newValue, 10));
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

    this.role = 'button'; // Aria
    this.isReady = true;
  }

  /**
   * @method
   * @returns {void}
   */
  formResetCallback() {
    this.toggle(this.defaultToggleState);
  }

  /**
   * @type {string}
   */
  get action() {
    return this.getAttribute('action') || '';
  }

  set action(value) {
    this.setAttribute('action', value);
  }

  /**
   * @type {0|1}
   */
  get defaultToggleState() {
    return Object.values(this.ToggleState).includes(parseInt(this.getAttribute('toggle-state'), 10))
      ? parseInt(this.getAttribute('toggle-state'), 10)
      : this.ToggleState.OFF;
  }

  set defaultToggleState(value) {
    this.setAttribute('toggle-state', value);
  }

  /**
   * @readonly
   * @type {0|1}
   */
  get toggleState() {
    return Array.from(this.shadowRoot.getElementById('button').classList).includes('button--toggle-on') ? this.ToggleState.ON : this.ToggleState.OFF;
  }

  /**
   * @type {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  /**
   * @type {HTMLFormElement|null}
   */
  get form() {
    return this.#elementInternals.form;
  }

  /**
   * @type {'button'|'reset'|'submit'}
   */
  get type() {
    return /^(button|reset|submit)$/.test(this.getAttribute('type'))
      ? this.getAttribute('type')
      : this.#DEFAULT_BUTTON_TYPE;
  }

  set type(value) {
    this.setAttribute('type', value);
  }

  /**
   * @type {string}
   */
  get value() {
    return this.getAttribute('value') || '';
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  /**
   * @private
   * @readonly
   * @type {boolean}
   */
  get #isToggleButton() {
    return this.shadowRoot.getElementById('icon-off-slot').assignedElements().length !== 0
      && this.shadowRoot.getElementById('icon-on-slot').assignedElements().length !== 0;
  }

  /**
   * @method
   * @returns {void}
   */
  click() {
    this.shadowRoot.getElementById('button').click();
  }

  /**
   * @type {EventListener}
   */
  onClick(event) {
    event.stopImmediatePropagation();

    const isCancelled = !this.sendCustomEvent('click', { cancelable: true });

    if (!isCancelled) {
      // ----------------------------------------------------------------------------
      // This is only thing we want to make preventable using event.preventDefault()
      // ----------------------------------------------------------------------------
      this.toggle();
    }

    if (!this.form) {
      return;
    }

    switch (this.type) {
      case 'submit':
        this.form.append(this.#htmlSubmitButton);
        this.#htmlSubmitButton.click();
        this.#htmlSubmitButton.remove();
        break;
      case 'reset':
        this.form.append(this.#htmlResetButton);
        this.#htmlResetButton.click();
        this.#htmlResetButton.remove();
        break;
      default:
        break;
    }
    this.#hasUserInteracted = true;
  }

  /**
   * @type {EventListener}
   */
  onLabelSlotSlotChange(event) {
    const { target: labelSlot } = event;
    const iconSlotsWithContent = Array.from(this.shadowRoot.querySelectorAll('slot[name*=icon]')).filter((slot) => {
      return slot.assignedElements().length;
    });

    const buttonElement = this.shadowRoot.getElementById('button');

    buttonElement.classList.toggle('button--with-label', !!labelSlot.assignedElements()[0]?.innerHTML);
    buttonElement.classList.toggle('button--with-icon', iconSlotsWithContent.length);

    const slottedElementMutationObserver = new MutationObserver((mutations) => {
      buttonElement.classList.toggle('button--with-label', !!mutations[0].target.innerHTML);
    });

    if (!labelSlot.assignedElements()[0]) {
      return;
    }

    slottedElementMutationObserver.observe(labelSlot.assignedElements()[0], { childList: true });
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
   * @method
   * @param {boolean} force
   * @returns {void}
   */
  toggle(force) {
    if (!this.#isToggleButton) {
      return;
    }
    this.shadowRoot.getElementById('button').classList.toggle('button--toggle-on', force);
  }

  /**
   * @private
   * @method
   * @returns {HTMLButtonElement}
   */
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <button class="button" id="button" on:click="onClick()">
        <div class="button__background"></div>
        <div class="button__label" id="label"><slot on:slotchange="onLabelSlotSlotChange()">${this.localName}</slot></div>
        <div class="slot-pointer-events-killer">
          <slot name="icon"></slot>
          <slot name="icon-on" id="icon-on-slot"></slot>
          <slot name="icon-off" id="icon-off-slot"></slot>
        <div>
      </button>
    `;
  }

  /**
   * @private
   * @method
   * @returns {HTMLButtonElement}
   */
  #createHTMLResetButton() {
    return new SafeDOMParser().parseFromString`<button type="reset" style="display: none;"></button>`;
  }

  /**
   * @private
   * @method
   * @returns {HTMLButtonElement}
   */
  #createHTMLSubmitButton() {
    return new SafeDOMParser().parseFromString`<button type="submit" style="display: none;"></button>`;
  }
}

customElements.define(HTMLXButtonElement.LOCAL_NAME, HTMLXButtonElement);
