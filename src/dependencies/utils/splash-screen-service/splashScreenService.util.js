import { sendCustomEventMixin } from '../../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import './components/splash-screen-service-splash-screen/splashScreenServiceSplashScreen.component.js';

const { EventDict: SplashScreenElementEventDict } = customElements.get('splash-screen-service-splash-screen');

/**
 * @mixes SendCustomEvent
 */
class SplashScreenService extends sendCustomEventMixin() {
  #activeContainedSplashScreens = new Map();
  #splashScreenElement;
  #documentBodyOverflowStyle;
  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
      CANCEL: this.#createEventTypeWithNamespace('cancel')
    };
  }
  /**
   * @private
   * @static
   * @method
   * @returns {string}
   */
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }
  /**
   * @readonly
   * @type {Object.<string, string>}
   */
  get EventDict() {
    return this.constructor.EventDict;
  }
  /**
   * @method
   * @param {HTMLElement} relativelyPositionedElement
   * @param {{cancelable: boolean, message: string, title: string, withBorders: boolean}} options
   * @returns {void}
   */
  addSplashScreenToElement(relativelyPositionedElement, { message = '', title = '', cancelable = false, withBorders = false }) {
    const splashScreenElement = document.createElement('splash-screen-service-splash-screen');

    splashScreenElement.cancelable = cancelable;
    splashScreenElement.contained = true;
    splashScreenElement.splashScreenTitle = title;
    splashScreenElement.message = message;
    splashScreenElement.withBorders = withBorders;

    if (cancelable) {
      splashScreenElement.addEventListener(SplashScreenElementEventDict.CANCEL, this.#onSplashScreenElementCancel.bind(this));
    }

    if (this.#activeContainedSplashScreens.has(relativelyPositionedElement)) {
      this.#activeContainedSplashScreens.get(relativelyPositionedElement).remove();
    }

    this.#activeContainedSplashScreens.set(relativelyPositionedElement, splashScreenElement);

    relativelyPositionedElement.insertAdjacentElement('beforeend', splashScreenElement);
  }
  /**
   * @method
   * @returns {void}
   */
  removeSplashScreen() {
    document.body.style.setProperty('overflow', this.#documentBodyOverflowStyle);
    if (!this.#splashScreenElement) {
      return;
    }
    this.#splashScreenElement.remove();
    this.#splashScreenElement = null;
  }
  /**
   * @method
   * @param {HTMLElement} relativelyPositionedElement
   * @returns {void}
   */
  removeSplashScreenFromElement(relativelyPositionedElement) {
    if (!this.#activeContainedSplashScreens.has(relativelyPositionedElement)) {
      return;
    }
    this.#activeContainedSplashScreens.get(relativelyPositionedElement).remove();
    this.#activeContainedSplashScreens.delete(relativelyPositionedElement);
  }
  /**
   * @method
   * @param {{cancelable: boolean, message: string, title: string}} options
   * @returns {void}
   */
  showSplashScreen({ message = '', title = '', cancelable = false, withBorders = false } = {}) {
    if (this.#splashScreenElement) {
      return;
    }
    this.#splashScreenElement = document.createElement('splash-screen-service-splash-screen');
    if (cancelable) {
      this.#splashScreenElement.addEventListener(SplashScreenElementEventDict.CANCEL, this.#onSplashScreenElementCancel.bind(this));
    }
    this.#splashScreenElement.cancelable = cancelable;
    this.#splashScreenElement.splashScreenTitle = title;
    this.#splashScreenElement.message = message;
    this.#splashScreenElement.withBorders = withBorders;
    document.body.append(this.#splashScreenElement);
    this.#documentBodyOverflowStyle = document.body.style.getPropertyValue('overflow');
    document.body.style.setProperty('overflow', 'hidden');
  }
  /**
   * @private
   * @type {EventListener}
   */
  #onSplashScreenElementCancel(event) {
    const { target: splashScreenElement } = event;
    const isCancelled = !this.sendCustomEvent(this.constructor.EventDict.CANCEL, { cancelable: true });
    if (isCancelled) {
      return;
    }
    if (this.#activeContainedSplashScreens.has(splashScreenElement)) {
      this.removeSplashScreenFromElement(splashScreenElement);
    } else {
      this.removeSplashScreen();
    }
  }
}

const splashScreenService = new SplashScreenService();

export { splashScreenService };
