/**
 * @typedef {import('./typedef.js')}
 */

import './components/alert-service-alert/alertServiceAlert.component.js';
import './components/alert-service-confirm/alertServiceConfirm.component.js';
import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { setStylePropertiesOnElement } from '../setStylePropertiesOnElement.util.js';

class AlertService {
  #validActionTypes = [
    customElements.get('x-button').Action.DANGER,
    customElements.get('x-button').Action.PRIMARY
  ];
  #queuedAlerts = [];
  /**
   * @method
   * @param {string|string[]} [messages=""]
   * @param {AlertServiceAlertOptions}
   * @returns {Promise<boolean>}
   */
  alert(messages = '', {
    affirmativePrompt = '',
    onElement = null,
    title = ''
  } = {}) {
    return new Promise((resolve) => {
      const parsedMessages = Array.isArray(messages) ? messages.join('!P!') : messages;
      const alertElement = new SafeDOMParser().parseFromString`
        <alert-service-alert
          affirmative-prompt="${affirmativePrompt}"
          alert-title="${title}"
          [contained]=${onElement instanceof HTMLElement}
          messages="${parsedMessages}">
        </alert-service-alert>
      `;
      const preResolve = () => {
        this.#queuedAlerts.shift();
        const nextQueuedAlert = this.#queuedAlerts[0];
        if (nextQueuedAlert) {
          const { promptElement, onElement } = nextQueuedAlert;
          this.#displayPrompt(promptElement, onElement);
        }
      };
      const { EventDict } = customElements.get('alert-service-alert');
      alertElement.addEventListener(EventDict.OK, () => {
        preResolve();
        resolve(true);
      });
      if (!this.#queuedAlerts.length) {
        this.#displayPrompt(alertElement, onElement);
      }
      this.#queuedAlerts.push({ promptElement: alertElement, onElement: onElement });
    });
  }
  /**
   * @method
   * @param {string|string[]} [messages=""]
   * @param {AlertServiceConfirmOptions}
   * @returns {Promise<boolean>}
   */
  confirm(messages = '', {
    actionType = this.#validActionTypes[1],
    affirmativePrompt = '',
    negativePrompt = '',
    onElement = null,
    title = ''
  } = {}) {
    return new Promise((resolve) => {
      const parsedMessages = Array.isArray(messages) ? messages.join('!P!') : messages;
      const confirmElement = new SafeDOMParser().parseFromString`
        <alert-service-confirm
          action-type="${actionType}"
          affirmative-prompt="${affirmativePrompt}"
          confirm-title="${title}"
          [contained]=${onElement instanceof HTMLElement}
          messages="${parsedMessages}"
          negative-prompt="${negativePrompt}">
        </alert-service-confirm>
      `;
      const preResolve = () => {
        this.#queuedAlerts.shift();
        const nextQueuedConfirm = this.#queuedAlerts[0];
        if (nextQueuedConfirm) {
          const { promptElement, onElement } = nextQueuedConfirm;
          this.#displayPrompt(promptElement, onElement);
        }
      };
      const { EventDict } = customElements.get('alert-service-confirm');
      confirmElement.addEventListener(EventDict.OK, () => {
        preResolve();
        resolve(true);
      });
      confirmElement.addEventListener(EventDict.CANCEL, () => {
        preResolve();
        resolve(false);
      });

      if (!this.#queuedAlerts.length) {
        this.#displayPrompt(confirmElement, onElement);
      }

      this.#queuedAlerts.push({ promptElement: confirmElement, onElement: onElement });
    });
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} promptElement
   * @param {HTMLElement|null} onElement
   */
  #displayPrompt(promptElement, onElement) {
    requestAnimationFrame(() => {
      if (onElement instanceof HTMLElement) {
        const { height, width } = getComputedStyle(onElement);
        const { position } = getComputedStyle(onElement.parentNode);
        if (position === 'static') {
          onElement.parentNode.style.position = 'relative';
        }
        const { offsetLeft, offsetTop } = onElement;
        setStylePropertiesOnElement(promptElement, [
          ['height', height],
          ['left', offsetLeft + 'px'],
          ['top', offsetTop + 'px'],
          ['width', width]
        ]);
        onElement.insertAdjacentElement('afterend', promptElement);
      } else {
        document.body.append(promptElement);
      }
    });
  }
}

const alertService = new AlertService();

export { alertService };
