import { sendCustomEventMixin } from '../../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import './components/splash-screen-service-splash-screen/splashScreenServiceSplashScreen.component.js';
const { EventDict: SplashScreenElementEventDict } = customElements.get('splash-screen-service-splash-screen');
class SplashScreenService extends sendCustomEventMixin() {
  #activeContainedSplashScreens = new Map();
  #splashScreenElement;
  #documentBodyOverflowStyle;
  static get EventDict() {
    return {
      CANCEL: this.#createEventTypeWithNamespace('cancel')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }
  get EventDict() {
    return this.constructor.EventDict;
  }
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
  removeSplashScreen() {
    document.body.style.setProperty('overflow', this.#documentBodyOverflowStyle);
    if (!this.#splashScreenElement) {
      return;
    }
    this.#splashScreenElement.remove();
    this.#splashScreenElement = null;
  }
  removeSplashScreenFromElement(relativelyPositionedElement) {
    if (!this.#activeContainedSplashScreens.has(relativelyPositionedElement)) {
      return;
    }
    this.#activeContainedSplashScreens.get(relativelyPositionedElement).remove();
    this.#activeContainedSplashScreens.delete(relativelyPositionedElement);
  }
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