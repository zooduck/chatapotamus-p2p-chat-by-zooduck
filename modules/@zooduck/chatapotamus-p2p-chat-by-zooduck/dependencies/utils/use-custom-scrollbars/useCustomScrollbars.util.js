import './components/x-scroller/xScroller.component.js';
class UseCustomScrollbars {
  #documentMutationObserver;
  #elementsWithCustomScrollbars = new Set();
  constructor() {
    this.#documentMutationObserver = new MutationObserver(this.#onDocumentChildListChange.bind(this));
  }
  withDocument(doc) {
    this.#addCustomScrollbarsToElements(doc);
    this.#documentMutationObserver.observe(doc, { childList: true });
  }
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
  #doesElementHaveCustomScrollbars(element) {
    return this.#elementsWithCustomScrollbars.has(element);
  }
  #onDocumentChildListChange(mutations) {
    mutations.forEach((mutationRecord) => {
      const { target: doc } = mutationRecord;
      this.#addCustomScrollbarsToElements(doc);
    });
  }
}
const useCustomScrollbars = new UseCustomScrollbars();
export { useCustomScrollbars };