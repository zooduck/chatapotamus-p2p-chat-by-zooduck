import '../form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { parseChatMessageForDOM } from './utils/parseChatMessageForDOM.util.js';
import { useCustomScrollbars } from '../../utils/use-custom-scrollbars/index.js';
import { splashScreenService } from '../../utils/splash-screen-service/index.js';
import { parseFileMessageForDOM } from './utils/parseFileMessageForDOM.util.js';
import { WaitTimeCalculator } from '../../utils/WaitTimeCalculator.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './xChat.component.css',
  jsFile: './xChat.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});
class HTMLXChatElement extends WebComponent {
  static LOCAL_NAME = 'x-chat';
  #MINIMUM_MILLISECONDS_TO_SHOW_INITIALISATION_SPLASH_SCREEN = 2000;
  #autoScrollToLastMessage = true;
  #callToActionEventType;
  #messageIntersectionObserver;
  #isInitialised = false;
  #lastScrollLeft = 0;
  #lastScrollTop = 0;
  #lastMessageElement;
  #messageCountAtLastDisconnect = 0;
  #messages = new Set();
  #messagesNotYetViewed = new Map();
  #validCallToActionActionTypes;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#validCallToActionActionTypes = [
      customElements.get('x-button').Action.DANGER,
      customElements.get('x-button').Action.PRIMARY
    ];
    this.#messageIntersectionObserver = new IntersectionObserver(this.#onMessageIntersect.bind(this), {
      threshold: 0.1
    });
    this.#addEventListeners();
  }
  static get observedAttributes() {
    return ['call-to-action', 'empty-chat-placeholder', 'remote-handle'];
  }
  static get EventDict() {
    return {
      ALL_MESSAGES_READ: this.#createEventTypeWithNamespace('allmessagesread'),
      MESSAGE_READ: this.#createEventTypeWithNamespace('messageread'),
      NEW_MESSAGE: this.#createEventTypeWithNamespace('newmessage')
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
      case 'call-to-action':
        this.ready().then(() => {
          const callToActionLabel = newValue.split('|')[0];
          const requestedCallToActionActionType = newValue.split('|')[1];
          const callToActionActionType = this.#validCallToActionActionTypes.includes(requestedCallToActionActionType) ? requestedCallToActionActionType : '';
          this.shadowRoot.getElementById('call-to-action').replaceWith(this.#createCallToAction(callToActionLabel, callToActionActionType));
          this.#callToActionEventType = callToActionLabel.replace(/\s/g, '').toLowerCase();
        });
        break;
      case 'empty-chat-placeholder':
        this.ready().then(() => {
          this.shadowRoot.getElementById('empty-chat-placeholder').textContent = newValue;
        });
        break;
      case 'remote-handle':
        this.ready().then(() => {
          const remoteHandleElement = this.shadowRoot.getElementById('remote-handle');
          remoteHandleElement.textContent = newValue || '';
          remoteHandleElement.title = newValue || '';
          this.shadowRoot.getElementById('header').classList.toggle('header--hidden', newValue === null);
        });
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    this.ready().then(() => {
      if (this.#messages.size > this.#messageCountAtLastDisconnect) {
        this.#scrollToLastMessage();
      } else {
        this.#restoreLastScrollPosition();
      }
    });
    if (this.hasRendered) {
      return;
    }
    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.isReady = true;
  }
  disconnectedCallback() {
    this.#messageCountAtLastDisconnect = this.#messages.size;
  }
  get callToAction() {
    return this.getAttribute('call-to-action') || '';
  }
  set callToAction(value) {
    this.setAttribute('call-to-action', value);
  }
  get emptyChatPlaceholder() {
    return this.getAttribute('empty-chat-placeholder') || '';
  }
  set emptyChatPlaceholder(value) {
    this.setAttribute('empty-chat-placeholder', value);
  }
  get isInitialised() {
    return this.#isInitialised;
  }
  get remoteHandle() {
    return this.getAttribute('remote-handle') || '';
  }
  set remoteHandle(value) {
    this.setAttribute('remote-handle', value);
  }
  get unreadMessages() {
    return this.#messagesNotYetViewed.size;
  }
  async addFile(data, { noAnimate = false, scrollToMessage = true, updateMessagesNotYetViewed = true } = {}) {
    const { dataURL, file, fromID, origin, toID, unix } = data;
    const isDataURLValid = await this.#isDataURLValid(dataURL);
    const shouldAnimate = this.isConnected && !noAnimate;
    let shouldScrollToMessage = scrollToMessage;
    if (!this.#autoScrollToLastMessage && origin === 'remote') {
      shouldScrollToMessage = false;
    }
    if (!isDataURLValid) {
      return this.addMessage({
        fromID: fromID,
        message: file.name,
        messageType: 'fileNotFound',
        origin: origin,
        toID: toID,
        type: 'text',
        unix: unix
      });
    }
    return new Promise((resolve) => {
      const mediaElementID = '_' + crypto.randomUUID();
      const messageElement = parseFileMessageForDOM({ ...data, mediaElementID });
      if (!this.isConnected || noAnimate) {
        messageElement.classList.add('message--no-animate');
      }
      if (origin === 'remote' && updateMessagesNotYetViewed) {
        this.#messagesNotYetViewed.set(messageElement, { file: file, sender: fromID });
      }
      if (origin === 'remote' && updateMessagesNotYetViewed && !shouldAnimate) {
        this.sendCustomEvent(this.constructor.EventDict.NEW_MESSAGE, {
          detail: {
            file: file,
            sender: fromID,
            unreadMessages: this.unreadMessages
          }
        });
      }
      this.#messageIntersectionObserver.observe(messageElement);
      this.#messages.add(data);
      if (!shouldAnimate) {
        messageElement.classList.add('message--no-animate');
      }
      this.ready().then(() => {
        const messagesElement = this.shadowRoot.getElementById('messages');
        messageElement.onanimationend = () => {
          messageElement.classList.add('message--no-animate');
          requestAnimationFrame(() => {
            this.#updateNewMessagesButton();
            if (this.#messagesNotYetViewed.has(messageElement)) {
              this.sendCustomEvent(this.constructor.EventDict.NEW_MESSAGE, {
                detail: {
                  file: file,
                  sender: fromID,
                  unreadMessages: this.unreadMessages
                }
              });
            }
          });
        };
        const mediaElement = messageElement.querySelector(`#${mediaElementID}`);
        if (mediaElement) {
          mediaElement.onerror = () => {
            this.#messageIntersectionObserver.unobserve(messageElement);
            this.#messages.delete(data);
            resolve();
          };
        }
        if (mediaElement && mediaElement instanceof HTMLImageElement) {
          mediaElement.onload = () => {
            this.#lastMessageElement = messageElement;
            messagesElement.append(messageElement);
            requestAnimationFrame(() => {
              shouldScrollToMessage && this.#scrollToLastMessage();
            });
            resolve();
          };
        } else if (mediaElement && (mediaElement instanceof HTMLVideoElement || mediaElement instanceof HTMLAudioElement)) {
          mediaElement.onloadeddata = () => {
            this.#lastMessageElement = messageElement;
            messagesElement.append(messageElement);
            requestAnimationFrame(() => {
              shouldScrollToMessage && this.#scrollToLastMessage();
            });
            resolve();
          };
        } else {
          this.#lastMessageElement = messageElement;
          messagesElement.append(messageElement);
          requestAnimationFrame(() => {
            shouldScrollToMessage && this.#scrollToLastMessage();
          });
          resolve();
        }
      });
    });
  }
  addMessage(data, { noAnimate = false, scrollToMessage = true, updateMessagesNotYetViewed = true } = {}) {
    const messageElement = parseChatMessageForDOM(data);
    const { fromID, message, origin } = data;
    const shouldAnimate = this.isConnected && !noAnimate;
    if (origin === 'remote' && updateMessagesNotYetViewed) {
      this.#messagesNotYetViewed.set(messageElement, { message: message, sender: fromID });
    }
    if (origin === 'remote' && updateMessagesNotYetViewed && !shouldAnimate) {
      this.sendCustomEvent(this.constructor.EventDict.NEW_MESSAGE, {
        detail: {
          message: message,
          sender: fromID,
          unreadMessages: this.unreadMessages
        }
      });
    }
    this.#lastMessageElement = messageElement;
    this.#messageIntersectionObserver.observe(messageElement);
    this.#messages.add(data);
    if (!shouldAnimate) {
      messageElement.classList.add('message--no-animate');
    }
    this.ready().then(() => {
      const messagesElement = this.shadowRoot.getElementById('messages');
      this.shadowRoot.getElementById('empty-chat-placeholder').classList.add('empty-chat-placeholder--hidden');
      messageElement.onanimationend = () => {
        messageElement.classList.add('message--no-animate');
        requestAnimationFrame(() => {
          this.#updateNewMessagesButton();
          if (this.#messagesNotYetViewed.has(messageElement)) {
            this.sendCustomEvent(this.constructor.EventDict.NEW_MESSAGE, {
              detail: {
                message: message,
                sender: fromID,
                unreadMessages: this.unreadMessages
              }
            });
          }
        });
      };
      messagesElement.append(messageElement);
      if (!scrollToMessage) {
        return;
      }
      if (!this.#autoScrollToLastMessage && origin === 'remote') {
        return;
      }
      requestAnimationFrame(() => {
        this.#scrollToLastMessage();
      });
    });
  }
  clearMessages() {
    this.shadowRoot.getElementById('messages').innerHTML = '';
    this.#messages.clear();
    this.#messagesNotYetViewed.clear();
    this.#updateNewMessagesButton();
  }
  init(data) {
    if (this.isInitialised) {
      return;
    }
    if (!data || !data.length) {
      this.#isInitialised = true;
      return;
    }
    this.ready().then(async () => {
      const waitTimeCalculator = new WaitTimeCalculator(this.#MINIMUM_MILLISECONDS_TO_SHOW_INITIALISATION_SPLASH_SCREEN);
      waitTimeCalculator.markStart();
      this.clearMessages();
      splashScreenService.addSplashScreenToElement(this.shadowRoot.getElementById('root'), {
        message: `Excavating message artifacts...`,
        title: `Initialising chat\nwith ${this.remoteHandle}`
      });
      for (let i = 0; i < data.length; i++) {
        const isLastMessageInArray = i === (data.length - 1);
        const messageData = data[i];
        switch (messageData.type) {
          case 'file':
            await this.addFile(messageData, { noAnimate: true, scrollToLastMessage: isLastMessageInArray, updateMessagesNotYetViewed: false });
            break;
          case 'text':
            this.addMessage(messageData, { noAnimate: true, scrollToMessage: isLastMessageInArray, updateMessagesNotYetViewed: false });
            break;
          default:
            break;
        }
      }
      this.#isInitialised = true;
      this.#messagesNotYetViewed.clear();
      this.sendCustomEvent(this.constructor.EventDict.ALL_MESSAGES_READ, {
        detail: {
          sender: this.remoteHandle
        }
      });
      setTimeout(() => {
        this.#scrollToLastMessage();
      }, 50);
      waitTimeCalculator.markEnd();
      setTimeout(() => {
        splashScreenService.removeSplashScreenFromElement(this.shadowRoot.getElementById('root'));
      }, waitTimeCalculator.remainingWaitTime);
    });
  }
  onCallToActionButtonClick() {
    this.sendCustomEvent(this.#callToActionEventType, {
      bubbles: false,
      detail: {
        remoteHandle: this.remoteHandle
      }
    })
  }
  onMessagesScroll(event) {
    const { clientHeight, scrollHeight, scrollLeft, scrollTop } = event.target;
    if (scrollTop < this.#lastScrollTop) {
      this.#autoScrollToLastMessage = false;
    } else if ((Math.round(scrollTop + clientHeight)) === scrollHeight) {
      this.#autoScrollToLastMessage = true;
    }
    this.#lastScrollLeft = scrollLeft;
    this.#lastScrollTop = scrollTop;
  }
  onNewMessagesButtonClick() {
    if (!this.#messagesNotYetViewed.size) {
      return;
    }
    const oldestMessageElementNotYetViewed = Array.from(this.#messagesNotYetViewed.keys())[0];
    const messageMarginTop = parseFloat(getComputedStyle(oldestMessageElementNotYetViewed).getPropertyValue('margin-top'));
    this.shadowRoot.getElementById('messages').scrollTo(0, oldestMessageElementNotYetViewed.offsetTop - messageMarginTop);
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  #addEventListeners() {
    this.ready().then(() => {
      this.shadowRoot.getElementById('messages').addEventListener('scroll', this.onMessagesScroll.bind(this));
    });
  }
  #createCallToAction(label = '', actionType = '') {
    if (!label) {
      return new SafeDOMParser().parseFromString`<span id="call-to-action"></span>`;
    }
    const callToActionButton = new SafeDOMParser(this).parseFromString`
      <x-button
        class="header__call-to-action"
        id="call-to-action"
        on:click="onCallToActionButtonClick()">${label}</x-button>
    `;
    if (actionType) {
      callToActionButton.action = actionType;
    }
    return callToActionButton;
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <section id="root">
        <header class="header header--hidden" id="header">
          <h2 class="header__remote-handle" id="remote-handle"></h2>
          ${this.#createCallToAction()}
        </header>
        <h2 class="empty-chat-placeholder" id="empty-chat-placeholder"></h2>
        <section class="messages messages--no-animate" id="messages" use-custom-scrollbars></section>
        <x-button
          action="primary"
          class="new-messages-button"
          id="new-messages-button"
          on:click="onNewMessagesButtonClick()">
          <span>New Messages (<span id="new-messages-count"></span>)</span>
        </x-button>
      </section>
    `;
  }
  #isDataURLValid(dataURL) {
    return new Promise(async (resolve) => {
      try {
        await fetch(dataURL);
      } catch (error) {
        resolve(false);
      }
      resolve(true);
    });
  }
  #onMessageIntersect(entries) {
    entries.forEach((entry) => {
      const { isIntersecting, target: messageElement } = entry;
      if (!isIntersecting) {
        return;
      }
      if (this.#messagesNotYetViewed.has(messageElement)) {
        const data = this.#messagesNotYetViewed.get(messageElement);
        this.#messagesNotYetViewed.delete(messageElement);
        this.#updateAutoScrollFlag(messageElement);
        this.#updateNewMessagesButton();
        this.sendCustomEvent(this.constructor.EventDict.MESSAGE_READ, {
          detail: {
            ...data,
            unreadMessages: this.unreadMessages
          }
        });
      }
    });
  }
  #restoreLastScrollPosition() {
    this.shadowRoot.getElementById('messages').scrollTo(this.#lastScrollLeft, this.#lastScrollTop);
  }
  #scrollToLastMessage() {
    const messagesElement = this.shadowRoot.getElementById('messages');
    messagesElement.scrollTo(0, messagesElement.scrollHeight);
  }
  #updateAutoScrollFlag(viewedMessageElement) {
    if (viewedMessageElement === this.#lastMessageElement) {
      this.#autoScrollToLastMessage = true;
    }
  }
  #updateNewMessagesButton() {
    this.shadowRoot.getElementById('new-messages-count').textContent = this.#messagesNotYetViewed.size;
    this.shadowRoot.getElementById('new-messages-button').classList.toggle('new-messages-button--visible', this.#messagesNotYetViewed.size);
  }
}
customElements.define(HTMLXChatElement.LOCAL_NAME, HTMLXChatElement);