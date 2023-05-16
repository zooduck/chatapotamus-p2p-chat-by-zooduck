import './components/x-scroller/xScroller.component.js';

class UseCustomScrollbars {
  #documentMutationObserver;
  #elementsWithCustomScrollbars = new Set();
  constructor() {
    this.#documentMutationObserver = new MutationObserver(this.#onDocumentChildListChange.bind(this));
  }
  /**
   * @method
   * @param {Document|DocumentFragment} doc
   * @returns {void}
   */
  withDocument(doc) {
    this.#addCustomScrollbarsToElements(doc);
    this.#documentMutationObserver.observe(doc, { childList: true });
  }
  /**
   * @private
   * @method
   * @param {Document|DocumentFragment} doc
   * @returns {void}
   */
  #addCustomScrollbarsToElements(doc) {
    const parentNodesToObserveForChildListMutations = new Set();
    requestAnimationFrame(() => {
      customElements.whenDefined('x-scroller').then(() => {
        doc.querySelectorAll('[use-custom-scrollbars]').forEach((scrollableElement) => {
          if (this.#doesElementHaveCustomScrollbars(scrollableElement)) {
            return;
          }
          if (scrollableElement.parentNode !== doc) {
            parentNodesToObserveForChildListMutations.add(scrollableElement.parentNode);
          }
          const xScrollerElement = document.createElement('x-scroller');
          scrollableElement.replaceWith(xScrollerElement);
          xScrollerElement.append(scrollableElement);
          this.#elementsWithCustomScrollbars.add(scrollableElement);
        });
        parentNodesToObserveForChildListMutations.forEach((parentNode) => {
          this.#documentMutationObserver.observe(parentNode, { childList: true });
        });
      });
    });
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  #doesElementHaveCustomScrollbars(element) {
    return this.#elementsWithCustomScrollbars.has(element);
  }
  /**
   * @private
   * @type {MutationCallback}
   */
  #onDocumentChildListChange(mutations) {
    mutations.forEach((mutationRecord) => {
      const { target: doc } = mutationRecord;
      this.#addCustomScrollbarsToElements(doc);
    });
  }
}

const useCustomScrollbars = new UseCustomScrollbars();

export { useCustomScrollbars };
