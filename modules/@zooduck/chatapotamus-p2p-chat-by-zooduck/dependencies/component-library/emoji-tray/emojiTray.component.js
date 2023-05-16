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
  static get EventDict() {
    return {
      EMOJI_SELECT: this.#createEventTypeWithNamespace('emojiselect')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.LOCAL_NAME.replace(/-/g, '') + eventType;
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.isReady = true;
  }
  get value() {
    return this.#value;
  }
  set value(value) {
    this.#value = value;
  }
  onEmojiListItemClick(event) {
    this.#updateValue(event);
    this.sendCustomEvent(this.constructor.EventDict.EMOJI_SELECT, { detail: this.value });
  }
  render() {
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
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
      return emojiControl;
    }
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