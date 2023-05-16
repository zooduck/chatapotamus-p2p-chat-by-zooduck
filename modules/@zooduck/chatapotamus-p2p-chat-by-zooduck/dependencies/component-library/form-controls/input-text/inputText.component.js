import '../../emoji-tray/index.js';
import '../../form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { emojify, emojiAliasDictionary, getEmojiAsHTMLEntity } from '../../../utils/emojify/index.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { useCustomScrollbars } from '../../../utils/use-custom-scrollbars/index.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../styles/global.css',
  jsFile: '../../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './inputText.component.css',
  jsFile: './inputText.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../styles/variables.css',
  jsFile: '../../../../styles/variables.css.js'
});
class HTMLInputTextElement extends WebComponent {
  static LOCAL_NAME = 'input-text';
  static formAssociated = true;
  #DEFAULT_PLACEHOLDER = 'Type here...';
  #DEFAULT_ROWS_FOR_TEXTAREA = 2;
  #elementInternals;
  #emojiTrayButtonEmoji = ':kissing_face_with_smiling_eyes:';
  #emojiTrayElement;
  #htmlSubmitButtonElement;
  #validationMessages = {};
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.#elementInternals = this.attachInternals();
    this.#elementInternals.setFormValue('');
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#htmlSubmitButtonElement = this.#createHTMLSubmitButton();
    this.#emojiTrayElement = this.#createEmojiTrayElement();
  }
  static get emojiAliasDictionary() {
    return emojiAliasDictionary;
  }
  static get EmojiTrayTheme() {
    return customElements.get('x-button').Theme;
  }
  static get observedAttributes() {
    return [
      'autocomplete',
      'allowed-characters-pattern',
      'disabled',
      'emoji-tray',
      'multiline',
      'pattern',
      'pattern-mismatch-validation-message',
      'placeholder',
      'readonly',
      'required',
      'rows',
      'spellcheck',
      'title',
      'value',
      'value-missing-validation-message'
    ];
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'allowed-characters-pattern':
        this.ready().then(() => {
          this.#setInputContentAsText();
        });
        break;
      case 'emoji-tray':
        if (!this.isReady || !this.multiline) {
          return;
        }
        this.shadowRoot.innerHTML = '';
        if (newValue !== null) {
          this.shadowRoot.append(this.#createMultilineInputWithEmojiTray(this.value));
          this.#emojifyValue();
        } else {
          this.shadowRoot.append(this.#createMultilineInput(this.value));
        }
        break;
      case 'excluded-characters-pattern':
        this.ready().then(() => {
          this.#setInputContentAsText();
        });
        break;
      case 'multiline':
        if (!this.isReady) {
          return;
        }
        this.shadowRoot.innerHTML = '';
        if (newValue === null) {
          this.shadowRoot.append(this.#createInput(this.value));
        } else if (this.emojiTray) {
          this.shadowRoot.append(this.#createMultilineInputWithEmojiTray(this.value));
        } else {
          this.shadowRoot.append(this.#createMultilineInput(this.value));
        }
        break;
      case 'value':
        this.ready().then(() => {
          this.#input.defaultValue = newValue;
          this.#updateInputContent();
        });
        break;
      case 'autocomplete':
      case 'pattern':
      case 'placeholder':
      case 'rows':
      case 'spellcheck':
      case 'title':
        this.ready().then(() => {
          if (newValue === null) {
            this.#input.removeAttribute(attributeName);
          } else {
            this.#input.setAttribute(attributeName, newValue);
          }
        });
        break;
      case 'disabled':
      case 'readonly':
      case 'required':
        this.ready().then(() => {
          this.#input.toggleAttribute(attributeName, newValue !== null);
        });
        break;
      case 'pattern-mismatch-validation-message':
      case 'value-missing-validation-message':
        const camelCaseValidityStateErrorKey = attributeName.split('-').slice(0, 2).map((item, index) => {
          return index === 1 ? item.split('')[0].toUpperCase() + item.slice(1) : item;
        }).join('');
        this.validationMessages[camelCaseValidityStateErrorKey] = newValue;
      default:
        break;
    }
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.isReady = true;
  }
  formResetCallback() {
    this.value = this.defaultValue;
    this.#updateInputContent();
  }
  get emojiAliasDictionary() {
    return this.constructor.emojiAliasDictionary;
  }
  get allowedCharactersPattern() {
    return this.getAttribute('allowed-characters-pattern') || '';
  }
  set allowedCharactersPattern(value) {
    this.setAttribute('allowed-characters-pattern', value);
  }
  get autocomplete() {
    return this.#input?.autocomplete || '';
  }
  set autocomplete(value) {
    this.setAttribute('autocomplete', value);
  }
  get defaultValue() {
    return this.getAttribute('value') || '';
  }
  set defaultValue(value) {
    this.setAttribute('value', value);
  }
  get disabled() {
    return this.hasAttribute('disabled');
  }
  set disabled(value) {
    this.toggleAttribute('disabled', value);
  }
  get emojiTray() {
    return this.hasAttribute('emoji-tray');
  }
  set emojiTray(value) {
    this.toggleAttribute('emoji-tray', value);
  }
  get form() {
    return this.#elementInternals.form;
  }
  get multiline() {
    return this.hasAttribute('multiline');
  }
  set multiline(value) {
    if (value) {
      this.setAttribute('multiline', '');
    } else {
      this.removeAttribute('multiline');
    }
  }
  get placeholder() {
    return this.getAttribute('placeholder') || this.#DEFAULT_PLACEHOLDER;
  }
  set placeholder(value) {
    this.setAttribute('placeholder', value);
  }
  get readOnly() {
    return this.hasAttribute('readonly');
  }
  set readOnly(value) {
    if (value) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
  }
  get rows() {
    return this.getAttribute('rows') || this.#DEFAULT_ROWS_FOR_TEXTAREA;
  }
  set rows(value) {
    this.setAttribute('rows', value);
  }
  get validationMessages() {
    return this.#validationMessages;
  }
  set validationMessages(value) {
    this.#validationMessages = value;
  }
  get value() {
    return this.#input.value;
  }
  set value(value) {
    this.#input.value = value;
    this.#updateInputContent();
  }
  get #input() {
    return this.shadowRoot.getElementById('input');
  }
  onInput(event) {
    const { inputType } = event;
    const oldValue = this.value;
    this.#setInputContentAsText();
    this.#setValidity();
    if (this.emojiTray) {
      this.#emojifyValue({ inputType: inputType });
    }
    if (this.value === oldValue) {
      return;
    }
  }
  onKeyDown(event) {
    if (this.multiline) {
      return;
    }
    const { code, key, keyCode } = event;
    const isEnterKey = code === 'Enter' || key === 'Enter' || keyCode === 13;
    if (this.form && isEnterKey) {
      const visibleFormControlsExcludingButtons = Array.from(this.form.elements).filter((element) => {
        return !/hidden|submit/.test(element.type);
      });
      if (visibleFormControlsExcludingButtons.length === 1) {
        this.form.append(this.#htmlSubmitButtonElement);
        this.#htmlSubmitButtonElement.click();
        this.#htmlSubmitButtonElement.remove();
        return;
      }
      for (const button of this.form.querySelectorAll('button')) {
        if (button.type === 'submit') {
          button.click();
          break;
        }
      }
    }
  }
  onEmojiTrayButtonClick() {
    this.#toggleEmojiTray();
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  onEmojiSelect(event) {
    const { character } = event.detail;
    const oldSelectionStart = this.#input.selectionStart;
    const oldSelectionEnd = this.#input.selectionEnd;
    const startOfValue = this.value.slice(0, oldSelectionStart);
    const endOfValue = this.value.slice(oldSelectionEnd);
    const oldValue = this.#input.value;
    const newValue = startOfValue + character + endOfValue;
    const caretAdjust = newValue.length - oldValue.length;
    this.#input.value = newValue;
    this.#elementInternals.setFormValue(this.value);
    this.#input.selectionStart = oldSelectionEnd + caretAdjust;
    this.#input.selectionEnd = oldSelectionEnd + caretAdjust;
    this.#toggleEmojiTray();
    this.#input.focus();
  }
  #createInput(defaultValue = '') {
    return new SafeDOMParser(this).parseFromString`
      <input
        autocomplete="off"
        class="input"
        id="input"
        type="text"
        on:input="onInput()"
        on:keydown="onKeyDown()"
        placeholder="${this.placeholder}"
        value="${defaultValue}">
    `;
  }
  #createMultilineInput(defaultValue = '') {
    return new SafeDOMParser(this).parseFromString`
      <textarea
        autocomplete="off"
        class="input"
        id="input"
        rows="${this.rows}"
        on:input="onInput()"
        on:keydown="onKeyDown()"
        placeholder="${this.placeholder}"
        use-custom-scrollbars>${defaultValue}</textarea>
    `;
  }
  #createMultilineInputWithEmojiTray(defaultValue = '') {
    return new SafeDOMParser(this).parseFromString`
      <section class="multiline-input-with-emoji-tray" id="multiline-input-with-emoji-tray">
        <x-button
          class="multiline-input-with-emoji-tray-button__button"
          id="emoji-tray-button"
          on:click="onEmojiTrayButtonClick()">${getEmojiAsHTMLEntity(this.#emojiTrayButtonEmoji)}</x-button>
        <textarea
          autocomplete="off"
          class="input"
          id="input"
          rows="${this.rows}"
          on:click="onEmojiInputClick()"
          on:input="onInput()"
          on:keydown="onKeyDown()"
          on:keyup="onEmojiInputKeyUp()"
          placeholder="${this.placeholder}"
          use-custom-scrollbars>${defaultValue}</textarea>
      </section>
    `;
  }
  #createEmojiTrayElement() {
    return new SafeDOMParser(this).parseFromString`
      <emoji-tray
        class="multiline-input-with-emoji-tray__emoji-tray"
        id="emoji-tray"
        on:${customElements.get('emoji-tray').EventDict.EMOJI_SELECT}="onEmojiSelect()">
      </emoji-tray>
    `;
  }
  #createContent() {
    if (this.multiline && this.emojiTray) {
      return this.#createMultilineInputWithEmojiTray();
    }
    if (this.multiline) {
      return this.#createMultilineInput();
    }
    return this.#createInput();
  }
  #createHTMLSubmitButton() {
    return new SafeDOMParser().parseFromString`
      <button type="submit"></button>
    `;
  }
  #emojifyValue({ inputMethod = 'input' } = {}) {
    const oldInputValue = this.#input.value;
    const emojifiedContent = emojify(oldInputValue);
    if (emojifiedContent === oldInputValue) {
      return;
    }
    let pre = document.createElement('pre');
    pre.innerHTML = oldInputValue;
    const oldInputTextValue = pre.innerText;
    pre.innerHTML = emojifiedContent;
    pre.innerHTML = pre.innerText;
    const newInputValue = pre.innerText;
    this.#input.value = newInputValue;
    this.#elementInternals.setFormValue(this.value);
    if (inputMethod === 'insertFromPaste') {
      return;
    }
    let newCaretPosition;
    for (let i = 0; i < newInputValue.length; i++) {
      if (newInputValue[i] !== oldInputTextValue[i]) {
        newCaretPosition = i + 2;
        break;
      }
    }
    if (newCaretPosition) {
      this.#input.selectionStart = newCaretPosition;
      this.#input.selectionEnd = newCaretPosition;
    }
  }
  #getValidationMessage() {
    if (!Object.keys(this.validationMessages).length) {
      return this.#input.validationMessage;
    }
    let firstFailedValidityState;
    for (const validityState in this.#input.validity) {
      if (this.#input.validity[validityState] && validityState !== 'valid') {
        firstFailedValidityState = validityState;
        break;
      }
    }
    return this.validationMessages[firstFailedValidityState] || this.#input.validationMessage;
  }
  #setInputContentAsText() {
    const textContent = this.#input.value;
    const parsedValue = this.#stripExcludedCharacters(this.#input.value);
    this.#elementInternals.setFormValue(this.value);
    if (parsedValue === textContent) {
      return;
    }
    const oldCaretPosition = this.#input.selectionEnd;
    const contentLengthBefore = this.#input.value.length;
    this.#input.value = parsedValue;
    this.#elementInternals.setFormValue(this.value);
    const contentLengthAfter = this.#input.value.length;
    const caretPositionAdjust = contentLengthAfter - contentLengthBefore;
    const newCaretPosition = oldCaretPosition + caretPositionAdjust;
    this.#input.focus();
    this.#input.selectionStart = newCaretPosition;
    this.#input.selectionEnd = newCaretPosition;
  }
  #setValidity() {
    this.#elementInternals.setValidity(this.#input.validity, this.#getValidationMessage(), this.#input);
  }
  #updateInputContent() {
    this.#setInputContentAsText();
    if (this.emojiTray) {
      this.#emojifyValue();
    }
  }
  #stripExcludedCharacters = (string) => {
    if (!this.allowedCharactersPattern) {
      return string;
    }
    const allowedCharacters = string.match(new RegExp(this.allowedCharactersPattern, 'g')) || [];
    return allowedCharacters.join('');
  }
  #toggleEmojiTray() {
    const multilineInputWithEmojiTrayElement = this.shadowRoot.getElementById('multiline-input-with-emoji-tray');
    const isEmojiTrayVisible = this.#emojiTrayElement.classList.contains('multiline-input-with-emoji-tray__emoji-tray--visible');
    multilineInputWithEmojiTrayElement.onkeydown = null;
    this.#input.tabIndex = isEmojiTrayVisible ? 0 : -1;
    if (!isEmojiTrayVisible) {
      multilineInputWithEmojiTrayElement.onkeydown = (event) => {
        const { code, key } = event;
        if (code === 'Tab' || key === 'Tab') {
          event.preventDefault();
        }
      };
      multilineInputWithEmojiTrayElement.append(this.#emojiTrayElement);
      this.#emojiTrayElement.ontransitionend = () => {
        multilineInputWithEmojiTrayElement.onkeydown = null;
      }
    } else {
      this.#emojiTrayElement.remove();
    }
    requestAnimationFrame(() => {
      this.#emojiTrayElement.classList.toggle('multiline-input-with-emoji-tray__emoji-tray--visible');
    });
  }
}
customElements.define(HTMLInputTextElement.LOCAL_NAME, HTMLInputTextElement);