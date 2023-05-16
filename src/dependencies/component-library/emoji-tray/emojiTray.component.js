/**
 * @typedef {import('./typedef.js')}
 */

import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { emojiAliasDictionary } from '../../utils/emojify/index.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { useCustomScrollbars } from '../../utils/use-custom-scrollbars/index.js';

const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});

const styleSheet = await loadCSSStyleSheet({
  cssFile: './emojiTray.component.css',
  jsFile: './emojiTray.component.css.js'
});

const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});

class HTMLEmojiTrayElement extends WebComponent {
  static LOCAL_NAME = 'emoji-tray';
  #value;
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.ready().then(() => {
      Object.entries(emojiAliasDictionary).forEach(([alias, { htmlEntity, unicodeSymbol }]) => {
        const emojiControl = this.#createEmojiControl(alias, htmlEntity, unicodeSymbol);
        this.shadowRoot.getElementById('emoji-list').append(emojiControl);
      });
    });
  }
  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
      EMOJI_SELECT: this.#createEventTypeWithNamespace('emojiselect')
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
   * @returns {void}
   */
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }

    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.isReady = true;
  }
  /**
   * @type {EmojiTrayValue}
   */
  get value() {
    return this.#value;
  }
  set value(value) {
    this.#value = value;
  }
  /**
   * @type {EventListener}
   */
  onEmojiListItemClick(event) {
    this.#updateValue(event);
    this.sendCustomEvent(this.constructor.EventDict.EMOJI_SELECT, { detail: this.value });
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
   * @returns {HTMLElement}
   */
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <section class="emoji-tray">
        <ul
          class="emoji-list"
          id="emoji-list"
          use-custom-scrollbars>
        </ul>
      </section>
    `;
  }
    /**
   * @private
   * @method
   * @param {string} alias
   * @param {string} htmlEntity
   * @param {string} unicodeSymbol
   * @returns {HTMLLIElement}
   */
    #createEmojiControl(alias, htmlEntity, unicodeSymbol) {
      const emojiControl = new SafeDOMParser(this).parseFromString`
        <li title="${alias}">
          <button
            class="emoji-list__item-button"
            data-emoji-alias="${alias}"
            data-unicode-symbol="${unicodeSymbol}"
            on:click="onEmojiListItemClick()">${htmlEntity}</button>
        </li>
      `;
      // ------------------------------------------------------------------------------------------
      // SafeDOMParser / DOMParser / innerHTML Edge Case Note:
      // ------------------------------------------------------------------------------------------
      // If we wanted to set a htmlEntity dataset attribute here with a value of the html entity
      // (i.e. "&#x1F600;") we would need to do that after creating the element with SafeDOMParser
      // since SafeDOMParser automatically parses all html entities in the template literal.
      //
      // This is because DOMParser (used internally by SafeDOMParser) processes all html
      // entities be they element content or content attribute values (when ideally it would
      // only process html entities for element content and NOT content attribute values).
      //
      // For reference, innerHTML behaves in exactly the same way.
      //
      // I am avoiding this issue altogether by using the data-unicode-symbol attribute in the
      // #updateValue() method to reconstruct the html entity for the value.
      // ------------------------------------------------------------------------------------------

      return emojiControl;
    }
  /**
   * @private
   * @method
   * @param {KeyboardEvent}
   * @returns {void}
   */
  #updateValue(event) {
    const { textContent } = event.target;
    const { emojiAlias, unicodeSymbol } = event.target.dataset;
    const newValue = {
      alias: emojiAlias,
      character: textContent,
      htmlEntity: `&#x${unicodeSymbol};`,
      unicode: unicodeSymbol
    };
    this.value = newValue;
  }
}

customElements.define(HTMLEmojiTrayElement.LOCAL_NAME, HTMLEmojiTrayElement);
