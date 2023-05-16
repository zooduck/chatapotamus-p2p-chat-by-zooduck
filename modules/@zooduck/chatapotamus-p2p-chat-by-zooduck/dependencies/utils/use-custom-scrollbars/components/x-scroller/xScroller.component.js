import { SafeDOMParser } from '../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { Debounce } from '../../../debounce.util.js';
import { getBackgroundColorBrightnessFromElement } from '../../../getBackgroundBrightnessFromElement.util.js';
import { getCSSPropertyValue } from '../../../getCSSPropertyValue.util.js';
import { getCSSStylesFromElement } from '../../../getCSSStylesFromElement.util.js';
import { getElementAbsoluteOffset } from '../../../getElementAbsoluteOffset.util.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/global.css',
  jsFile: '../../../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './xScroller.component.css',
  jsFile: './xScroller.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../../../styles/variables.css',
  jsFile: '../../../../../styles/variables.css.js'
});
class HTMLXScrollerElement extends WebComponent {
  static LOCAL_NAME = 'x-scroller';
  static slottedElementStyles = new CSSStyleSheet();
  static rootNodesWithSlottedElementStyles = new Set();
  #MIN_SCROLLBAR_CONTROL_SURFACE_PIXELS = 10;
  #customScrollbarsToManage;
  #horizontalScrollSpace;
  #lastSlottedElement;
  #mouseMoveDebounce;
  #slottedElementMutationObserver;
  #slottedElementOriginalCSSDimensionStyles;
  #slottedElementResizeObserver;
  #verticalScrollSpace;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#mouseMoveDebounce = new Debounce(10, 5);
    this.ready().then(this.#onReady.bind(this));
    this.#addObservers();
    this.#addEventListeners();
  }
  static get observedAttributes() {
    return ['theme'];
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.#addSlottedElementStyles();
    this.render();
  }
  get slottedElement() {
    return this.shadowRoot.querySelector('slot').assignedElements()[0];
  }
  get theme() {
    return this.getAttribute('theme') || '';
  }
  set theme(value) {
    this.setAttribute('theme', value);
  }
  onScrollbarXMouseDown(event) {
    if (!this.#customScrollbarsToManage.get('x')) {
      return;
    }
    this.shadowRoot.getElementById('scrollbars').classList.add('scrollbars--visible');
    const scrollableElement = this.slottedElement;
    const scrollbarXElement = this.shadowRoot.getElementById('scrollbar-x');
    const scrollbarXControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-x-control-surface');
    const horizontalScrollbarOffsetLeft = getElementAbsoluteOffset(scrollbarXElement).left;
    const relativeClientX = event.clientX - (event.clientX - event.offsetX);
    const scrollRatio = scrollableElement.scrollWidth / scrollbarXElement.offsetWidth;
    const scrollToX = (relativeClientX - scrollbarXControlSurfaceElement.offsetWidth / 2) * scrollRatio;
    const onMouseMoveListener = async (event) => {
      const horizontalDistanceTravelled = event.clientX - horizontalScrollbarOffsetLeft - relativeClientX;
      const scrollToX = initialScrollLeft + (horizontalDistanceTravelled * scrollRatio);
      await this.#mouseMoveDebounce.done();
      scrollableElement.scrollTo(scrollToX, scrollableElement.scrollTop);
    };
    let initialScrollLeft;
    requestAnimationFrame(() => {
      scrollableElement.scrollTo(scrollToX, scrollableElement.scrollTop);
      initialScrollLeft = scrollableElement.scrollLeft;
      document.addEventListener('mousemove', onMouseMoveListener);
    });
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMoveListener);
      this.shadowRoot.getElementById('scrollbars').classList.remove('scrollbars--visible');
    });
    document.addEventListener('dragend', () => {
      document.removeEventListener('mousemove', onMouseMoveListener);
    });
  }
  onScrollbarYMouseDown(event) {
    if (!this.#customScrollbarsToManage.get('y')) {
      return;
    }
    this.shadowRoot.getElementById('scrollbars').classList.add('scrollbars--visible');
    const scrollableElement = this.slottedElement;
    const scrollbarYElement = this.shadowRoot.getElementById('scrollbar-y');
    const scrollbarYControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-y-control-surface');
    const verticalScrollbarOffsetTop = getElementAbsoluteOffset(scrollbarYElement).top;
    const relativeClientY = event.clientY - (event.clientY - event.offsetY);
    const scrollRatio = scrollableElement.scrollHeight / scrollbarYElement.offsetHeight;
    const scrollToY = (relativeClientY - scrollbarYControlSurfaceElement.offsetHeight / 2) * scrollRatio;
    const onMouseMoveListener = async (event) => {
      const verticalDistanceTravelled = event.clientY - verticalScrollbarOffsetTop - relativeClientY;
      const scrollToY = initialScrollTop + (verticalDistanceTravelled * scrollRatio);
      await this.#mouseMoveDebounce.done();
      scrollableElement.scrollTo(scrollableElement.scrollLeft, scrollToY);
    };
    let initialScrollTop;
    requestAnimationFrame(() => {
      scrollableElement.scrollTo(scrollableElement.scrollLeft, scrollToY);
      initialScrollTop = scrollableElement.scrollTop;
      document.addEventListener('mousemove', onMouseMoveListener);
    });
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMoveListener);
      this.shadowRoot.getElementById('scrollbars').classList.remove('scrollbars--visible');
    });
    document.addEventListener('dragend', () => {
      document.removeEventListener('mousemove', onMouseMoveListener);
    });
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(...this.#createContent());
    this.hasRendered = true;
  }
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
    this.ready().then(() => {
      window.addEventListener('resize', this.#onWindowResize.bind(this));
    });
  }
  #addObservers() {
    this.#slottedElementMutationObserver = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutationRecord) => {
        switch (mutationRecord.type) {
          case 'attributes':
            this.#matchSlottedElementDimensionStylesOnHost();
            break;
          case 'childList':
            this.#initializeCustomScrollbars();
            this.#updateScrollbarControlSurfacePositions();
            break;
          default:
            break;
        }
      });
    });
    this.#slottedElementResizeObserver = new ResizeObserver(() => {
      if (!this.slottedElement.isConnected) {
        return;
      }
      this.#checkSlottedElementDisplay();
      this.#initializeCustomScrollbars();
      this.#updateScrollbarControlSurfacePositions();
    });
  }
  #addSlottedElementStyles() {
    const rootNode = this.getRootNode();
    if (this.constructor.rootNodesWithSlottedElementStyles.has(rootNode)) {
      return;
    }
    this.constructor.slottedElementStyles.replaceSync(`
      .x-scroller-slotted {
        box-sizing: border-box !important;
        height: 100%;
        width: 100%;
        scrollbar-width: none !important;
      }
      textarea.x-scroller-slotted {
        margin-top: 0;
        resize: none !important;
      }
      .x-scroller-slotted::-webkit-scrollbar {
        display: none !important;
      }
    `);
    rootNode.adoptedStyleSheets.push(this.constructor.slottedElementStyles);
    this.constructor.rootNodesWithSlottedElementStyles.add(rootNode);
  }
  #checkSlottedElementDisplay() {
    const displayStyle = getComputedStyle(this.slottedElement).getPropertyValue('display');
    if (displayStyle === 'none') {
      this.style.removeProperty('height');
      this.style.removeProperty('width');
      this.shadowRoot.getElementById('scrollbars').style.setProperty('height', '0')
      this.shadowRoot.getElementById('scrollbars').style.setProperty('width', '0');
    } else {
      this.#matchSlottedElementDimensionStylesOnHost();
      this.#updateScrollbarsContainerSizeAndPosition();
    }
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <slot></slot>
      <section class="scrollbars" id="scrollbars">
        <div class="scrollbar-x" id="scrollbar-x" on:mousedown="onScrollbarXMouseDown()">
          <div class="scrollbar-x__control-surface" id="scrollbar-x-control-surface"></div>
        </div>
        <div class="scrollbar-y" id="scrollbar-y" on:mousedown="onScrollbarYMouseDown()">
          <div class="scrollbar-y__control-surface" id="scrollbar-y-control-surface"></div>
        </div>
      </section>
    `;
  }
  #onReady() {
    this.style.setProperty('visibility', 'visible');
  }
  async #onSlotChange(event) {
    this.isReady = false;
    this.#customScrollbarsToManage = new Map([
      ['x', true],
      ['y', true]
    ]);
    const slottedElement = event.target.assignedElements()[0];
    const {
      height: slottedElementHeightStyle,
      width: slottedElementWidthStyle
    } = getCSSStylesFromElement(slottedElement);
    this.#slottedElementOriginalCSSDimensionStyles = {
      height: slottedElementHeightStyle,
      width: slottedElementWidthStyle
    };
    this.#matchSlottedElementDimensionStylesOnHost();
    this.#setScrollbarsTheme();
    const customScrollbarWidthPixels = parseFloat(await getCSSPropertyValue(this, '--_scrollbar-width'));
    const {
      display: slottedElementDisplayStyle,
      flexGrow: slottedElementFlexGrowStyle,
      flexShrink: slottedElementFlexShrinkStyle,
      gridArea: slottedElementGridAreaStyle,
      overflow: slottedElementOverflowStyle,
      overflowX: slottedElementOverflowXStyle,
      overflowY: slottedElementOverflowYStyle,
      paddingBottom: slottedElementPaddingBottomStyle,
      paddingRight: slottedElementPaddingRightStyle,
    } = getComputedStyle(slottedElement);
    const slottedElementPaddingBottomPixels = parseFloat(slottedElementPaddingBottomStyle);
    const slottedElementPaddingRightPixels = parseFloat(slottedElementPaddingRightStyle);
    if (slottedElementOverflowXStyle === 'hidden') {
      this.#customScrollbarsToManage.set('x', false);
    }
    if (slottedElementOverflowYStyle === 'hidden') {
      this.#customScrollbarsToManage.set('y', false);
    }
    if (/visible/.test(slottedElementOverflowStyle)) {
      slottedElement.style.overflow = slottedElementOverflowStyle.replace(/visible/g, 'auto');
    }
    this.style.setProperty('grid-area', slottedElementGridAreaStyle);
    this.style.setProperty('flex-grow', slottedElementFlexGrowStyle);
    this.style.setProperty('flex-shrink', slottedElementFlexShrinkStyle);
    slottedElement.classList.add('x-scroller-slotted');
    const INLINE_DISPLAY_STYLE_REGEX = /(?:inline-)(block$|flex$|grid$)/;
    const inlineDisplayStyleMatch = slottedElementDisplayStyle.match(INLINE_DISPLAY_STYLE_REGEX);
    if (inlineDisplayStyleMatch) {
      slottedElement.style.setProperty('display', inlineDisplayStyleMatch[1]);
      this.style.setProperty('display', slottedElementDisplayStyle);
    }
    slottedElement.style.setProperty('padding-right', (slottedElementPaddingRightPixels + customScrollbarWidthPixels) + 'px');
    slottedElement.style.setProperty('padding-bottom', (slottedElementPaddingBottomPixels + customScrollbarWidthPixels) + 'px');
    slottedElement.addEventListener('scroll', this.#updateScrollbarControlSurfacePositions.bind(this));
    slottedElement.addEventListener('mouseenter', this.#setScrollbarsTheme.bind(this));
    slottedElement.addEventListener('click', this.#onUserInteraction.bind(this));
    slottedElement.addEventListener('input', this.#onUserInteraction.bind(this));
    slottedElement.addEventListener('keyup', this.#onUserInteraction.bind(this));
    if (this.#lastSlottedElement) {
      this.#slottedElementMutationObserver.unobserve(this.#lastSlottedElement);
      this.#slottedElementResizeObserver.unobserve(this.#lastSlottedElement);
    }
    this.#slottedElementMutationObserver.observe(slottedElement, { attributes: true, childList: true });
    this.#slottedElementResizeObserver.observe(slottedElement);
    this.#lastSlottedElement = slottedElement;
    this.isReady = true;
  }
  #onUserInteraction(event) {
    const { type, key } = event;
    if (type === 'keyup' && !/Enter|Space/.test(key.code)) {
      return;
    }
    requestAnimationFrame(() => {
      this.#initializeCustomScrollbars();
    });
  }
  #onWindowResize() {
    requestAnimationFrame(() => {
      const {
        flexGrow: slottedElementFlexGrowStyle,
        flexShrink: slottedElementFlexShrinkStyle,
        gridArea: slottedElementGridAreaStyle
      } = getComputedStyle(this.slottedElement);
      this.style.setProperty('grid-area', slottedElementGridAreaStyle);
      this.style.setProperty('flex-grow', slottedElementFlexGrowStyle);
      this.style.setProperty('flex-shrink', slottedElementFlexShrinkStyle);
    });
  }
  #initializeCustomScrollbars() {
    this.#initializeScrollbarX();
    this.#initializeScrollbarY();
  }
  #initializeScrollbarX() {
    if (!this.isConnected) {
      return;
    }
    if (!this.#customScrollbarsToManage.get('x')) {
      return;
    }
    const slottedElement = this.slottedElement;
    const scrollbarXElement = this.shadowRoot.getElementById('scrollbar-x');
    const scrollbarXControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-x-control-surface');
    const viewableContentWidthPercentAsDecimal = slottedElement.clientWidth / slottedElement.scrollWidth;
    const horizontalScrollbarControlSurfaceWidth = scrollbarXElement.offsetWidth * viewableContentWidthPercentAsDecimal;
    if (viewableContentWidthPercentAsDecimal === 1) {
      scrollbarXControlSurfaceElement.style.width = '0';
    } else {
      scrollbarXControlSurfaceElement.style.width = Math.ceil((horizontalScrollbarControlSurfaceWidth < this.#MIN_SCROLLBAR_CONTROL_SURFACE_PIXELS ? this.#MIN_SCROLLBAR_CONTROL_SURFACE_PIXELS : horizontalScrollbarControlSurfaceWidth)) + 'px';
    }
    this.#horizontalScrollSpace = scrollbarXElement.offsetWidth - scrollbarXControlSurfaceElement.offsetWidth;
  }
  #initializeScrollbarY() {
    if (!this.isConnected) {
      return;
    }
    if (!this.#customScrollbarsToManage.get('y')) {
      return;
    }
    const slottedElement = this.slottedElement;
    const scrollbarYElement = this.shadowRoot.getElementById('scrollbar-y');
    const scrollbarYControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-y-control-surface');
    const viewableContentHeightPercentAsDecimal = slottedElement.clientHeight / slottedElement.scrollHeight;
    const verticalScrollbarControlSurfaceHeight = scrollbarYElement.offsetHeight * viewableContentHeightPercentAsDecimal;
    if (viewableContentHeightPercentAsDecimal === 1) {
      scrollbarYControlSurfaceElement.style.height = '0';
    } else {
      scrollbarYControlSurfaceElement.style.height = Math.ceil((verticalScrollbarControlSurfaceHeight < this.#MIN_SCROLLBAR_CONTROL_SURFACE_PIXELS ? this.#MIN_SCROLLBAR_CONTROL_SURFACE_PIXELS : verticalScrollbarControlSurfaceHeight)) + 'px';
    }
    this.#verticalScrollSpace = scrollbarYElement.offsetHeight - scrollbarYControlSurfaceElement.offsetHeight;
  }
  #matchSlottedElementDimensionStylesOnHost() {
    const {
      height: slottedElementHeightStyle,
      width: slottedElementWidthStyle
    } = this.#slottedElementOriginalCSSDimensionStyles;
    const { marginTop: slottedElementMarginTopStyle } = getComputedStyle(this.slottedElement);
    slottedElementHeightStyle && this.style.setProperty('height', `calc(${slottedElementHeightStyle} + ${slottedElementMarginTopStyle})`);
    slottedElementWidthStyle && this.style.setProperty('width', slottedElementWidthStyle);
  }
  #setScrollbarsTheme() {
    const slottedElementBackgroundColorBrightness = getBackgroundColorBrightnessFromElement(this.slottedElement);
    if (slottedElementBackgroundColorBrightness) {
      this.theme = slottedElementBackgroundColorBrightness;
    }
  }
  #updateScrollbarsContainerSizeAndPosition() {
    const scrollbarsElement = this.shadowRoot.getElementById('scrollbars');
    const {
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,
      height,
      marginTop,
      width
    } = getComputedStyle(this.slottedElement);
    const slottedElementWidthLessBorders = parseFloat(width) - parseFloat(borderLeftWidth) - parseFloat(borderRightWidth);
    const slottedElementHeightLessBorders = parseFloat(height) - parseFloat(borderTopWidth) - parseFloat(borderBottomWidth);
    scrollbarsElement.style.left = borderLeftWidth;
    scrollbarsElement.style.top = parseFloat(marginTop) + parseFloat(borderTopWidth) + 'px';
    scrollbarsElement.style.height = slottedElementHeightLessBorders + 'px';
    scrollbarsElement.style.width = slottedElementWidthLessBorders + 'px';
  }
  #updateScrollbarControlSurfacePositions() {
    this.#updateScrollbarXControlSurfacePosition();
    this.#updateScrollbarYControlSurfacePosition();
  }
  #updateScrollbarXControlSurfacePosition() {
    if (!this.#customScrollbarsToManage.get('x')) {
      return;
    }
    const slottedElement = this.slottedElement;
    const scrollbarXControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-x-control-surface');
    const horizontalScrollDistance = slottedElement.scrollWidth - slottedElement.clientWidth;
    if (horizontalScrollDistance === 0) {
      return;
    }
    const pixelsPerPixel = this.#horizontalScrollSpace / horizontalScrollDistance;
    const horizontalScrollbarControlSurfaceElementOffsetLeft = slottedElement.scrollLeft * pixelsPerPixel;
    scrollbarXControlSurfaceElement.style.left = Math.ceil(horizontalScrollbarControlSurfaceElementOffsetLeft) + 'px';
  }
  #updateScrollbarYControlSurfacePosition() {
    if (!this.#customScrollbarsToManage.get('y')) {
      return;
    }
    const slottedElement = this.slottedElement;
    const scrollbarYControlSurfaceElement = this.shadowRoot.getElementById('scrollbar-y-control-surface');
    const verticalScrollDistance = slottedElement.scrollHeight - slottedElement.clientHeight;
    if (verticalScrollDistance === 0) {
      return;
    }
    const pixelsPerPixel = this.#verticalScrollSpace / verticalScrollDistance;
    const verticalScrollbarControlSurfaceElementOffsetTop = slottedElement.scrollTop * pixelsPerPixel;
    scrollbarYControlSurfaceElement.style.top = Math.ceil(verticalScrollbarControlSurfaceElementOffsetTop) + 'px';
  }
}
customElements.define(HTMLXScrollerElement.LOCAL_NAME, HTMLXScrollerElement);