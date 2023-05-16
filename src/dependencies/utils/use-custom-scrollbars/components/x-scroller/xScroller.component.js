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
    // ------------------------------------------------------------------------------
    // The second parameter for Debounce (maxIterations) is the most important here.
    // ------------------------------------------------------------------------------
    // Essentially it means that the mousemove event listener will execute it's
    // logic each time 5 mousemove events are fired in sequence, or 10 milliseconds
    // have passed (whichever happens first).
    // ------------------------------------------------------------------------------
    this.#mouseMoveDebounce = new Debounce(10, 5);
    this.ready().then(this.#onReady.bind(this));
    this.#addObservers();
    this.#addEventListeners();
  }
  /**
   * @static
   * @readonly
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['theme'];
  }
  /**
   * @method
   * @returns {void}
   */
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }

    this.#addSlottedElementStyles();
    this.render();
  }
  /**
   * @readonly
   * @type {HTMLElement}
   */
  get slottedElement() {
    return this.shadowRoot.querySelector('slot').assignedElements()[0];
  }
  /**
   * @type {'dark'|'light'}
   */
  get theme() {
    return this.getAttribute('theme') || '';
  }
  set theme(value) {
    this.setAttribute('theme', value);
  }
  /**
   * @type {EventListener}
   */
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
  /**
   * @type {EventListener}
   */
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
  /**
   * @method
   * @returns {void}
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(...this.#createContent());
    this.hasRendered = true;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #addEventListeners() {
    this.shadowRoot.addEventListener('slotchange', this.#onSlotChange.bind(this));
    this.ready().then(() => {
      window.addEventListener('resize', this.#onWindowResize.bind(this));
    });
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
  #addSlottedElementStyles() {
    const rootNode = this.getRootNode();

    if (this.constructor.rootNodesWithSlottedElementStyles.has(rootNode)) {
      return;
    }

    // ======================================================================================
    // Firefox supports "scrollbar-width: none" (which is W3C standard) whereas Chromium
    // browsers support a pseudo-element style "::-webkit-scrollbar { display: none }".
    // --------------------------------------------------------------------------------------
    // According to https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar
    // it would appear that ALL major browsers other than Firefox support
    // the non-standard ::-webkit-scrollbar pseudo-element and its associated
    // "display: none" CSS declaration).
    // --------------------------------------------------------------------------------------
    // There is currently an open ticket (since 2018) to add support for "scrollbar-width"
    // to Chromium: https://bugs.chromium.org/p/chromium/issues/detail?id=891944
    // ======================================================================================

    this.constructor.slottedElementStyles.replaceSync(`
      .x-scroller-slotted {
        box-sizing: border-box !important;
        height: 100%;
        width: 100%;
        scrollbar-width: none !important; /* FIREFOX ONLY @ 29-01-2023 */
      }
      textarea.x-scroller-slotted {
        margin-top: 0; /* FIREFOX BUG */
        resize: none !important;
      }
      .x-scroller-slotted::-webkit-scrollbar {
        display: none !important; /* ALL WEBKIT BROWSERS @ 29-01-2023 */
      }
    `);

    rootNode.adoptedStyleSheets.push(this.constructor.slottedElementStyles);

    this.constructor.rootNodesWithSlottedElementStyles.add(rootNode);
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #checkSlottedElementDisplay() {
    // ------------------------------------------------------------------------------
    // If the slotted element has a display style of none, we need to give the host
    // a width and height of zero so we don't take up any space in the DOM.
    // ------------------------------------------------------------------------------
    // Note: We cannot just set the host's display style to none, since that will
    // prevent further resize events from being observed on the slotted element.
    // ------------------------------------------------------------------------------
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
  /**
   * @private
   * @method
   * @returns {HTMLElement}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
  #onReady() {
    this.style.setProperty('visibility', 'visible');
  }
  /**
   * @private
   * @type {EventListener}
   */
  async #onSlotChange(event) {
    this.isReady = false;
    this.#customScrollbarsToManage = new Map([
      ['x', true],
      ['y', true]
    ]);

    const slottedElement = event.target.assignedElements()[0];

    // CSS styles (NOT Computed styles)
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

    // =====================================================================================
    // The slotted element should always define its overflow styles but if they are missing
    // then we *MUST* add them!
    // -------------------------------------------------------------------------------------
    // (They could be missing if, for example, the developer makes the not entirely
    // unreasonable assumption that the x-scroller element will take care of the overflow
    // styles on the slotted element).
    // -------------------------------------------------------------------------------------
    // Note that we only replace property values of "visible" (the default) since property
    // values of "auto", "scroll" and "hidden" indicate applied (i.e. not missing) styles.
    // =====================================================================================
    if (/visible/.test(slottedElementOverflowStyle)) {
      slottedElement.style.overflow = slottedElementOverflowStyle.replace(/visible/g, 'auto');
    }

    // ----------------------------------------------------------------
    // Match the grid-area style of the slotted element on the host.
    // Match the flex-grow style of the slotted element on the host.
    // Match the flex-shrink style of the slotted element on the host.
    // ----------------------------------------------------------------
    this.style.setProperty('grid-area', slottedElementGridAreaStyle);
    this.style.setProperty('flex-grow', slottedElementFlexGrowStyle);
    this.style.setProperty('flex-shrink', slottedElementFlexShrinkStyle);

    slottedElement.classList.add('x-scroller-slotted');

    const INLINE_DISPLAY_STYLE_REGEX = /(?:inline-)(block$|flex$|grid$)/; // Matches inline-block, inline-flex, inline-grid
    const inlineDisplayStyleMatch = slottedElementDisplayStyle.match(INLINE_DISPLAY_STYLE_REGEX);

    if (inlineDisplayStyleMatch) {
      // ----------------------------------------------------------------
      // The slotted element must have a display of block, flex or grid.
      // ----------------------------------------------------------------
      slottedElement.style.setProperty('display', inlineDisplayStyleMatch[1]);
      // ---------------------------------------------------------------------
      // Match the original display style of the slotted element on the host.
      // ---------------------------------------------------------------------
      this.style.setProperty('display', slottedElementDisplayStyle);
    }

    slottedElement.style.setProperty('padding-right', (slottedElementPaddingRightPixels + customScrollbarWidthPixels) + 'px');
    slottedElement.style.setProperty('padding-bottom', (slottedElementPaddingBottomPixels + customScrollbarWidthPixels) + 'px');

    slottedElement.addEventListener('scroll', this.#updateScrollbarControlSurfacePositions.bind(this));
    slottedElement.addEventListener('mouseenter', this.#setScrollbarsTheme.bind(this));

    // ===================================================================================
    // User interactions might result in changes to an element's viewable content
    // which in turn could result in scrollbars being added or removed.
    // -----------------------------------------------------------------------------------
    // A resize observer cannot be used in this instance, since the element's dimensions
    // are not changed. But we need to know when this happens so that we can update
    // the scrollbar control surface dimensions (since they may need updating).
    // ===================================================================================
    slottedElement.addEventListener('click', this.#onUserInteraction.bind(this));
    slottedElement.addEventListener('input', this.#onUserInteraction.bind(this)); // For textareas
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
  /**
   * @private
   * @type {EventListener}
   */
  #onUserInteraction(event) {
    const { type, key } = event;
    if (type === 'keyup' && !/Enter|Space/.test(key.code)) {
      return;
    }
    requestAnimationFrame(() => {
      this.#initializeCustomScrollbars();
    });
  }
  /**
   * @private
   * @type {EventListener}
   */
  #onWindowResize() {
    requestAnimationFrame(() => {
      const {
        flexGrow: slottedElementFlexGrowStyle,
        flexShrink: slottedElementFlexShrinkStyle,
        gridArea: slottedElementGridAreaStyle
      } = getComputedStyle(this.slottedElement);
      // ----------------------------------------------------------------
      // Match the grid-area style of the slotted element on the host.
      // Match the flex-grow style of the slotted element on the host.
      // Match the flex-shrink style of the slotted element on the host.
      // ----------------------------------------------------------------
      this.style.setProperty('grid-area', slottedElementGridAreaStyle);
      this.style.setProperty('flex-grow', slottedElementFlexGrowStyle);
      this.style.setProperty('flex-shrink', slottedElementFlexShrinkStyle);
    });
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #initializeCustomScrollbars() {
    this.#initializeScrollbarX();
    this.#initializeScrollbarY();
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
  #matchSlottedElementDimensionStylesOnHost() {
    const {
      height: slottedElementHeightStyle,
      width: slottedElementWidthStyle
    } = this.#slottedElementOriginalCSSDimensionStyles;

    const { marginTop: slottedElementMarginTopStyle } = getComputedStyle(this.slottedElement);

    slottedElementHeightStyle && this.style.setProperty('height', `calc(${slottedElementHeightStyle} + ${slottedElementMarginTopStyle})`);
    slottedElementWidthStyle && this.style.setProperty('width', slottedElementWidthStyle);
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #setScrollbarsTheme() {
    const slottedElementBackgroundColorBrightness = getBackgroundColorBrightnessFromElement(this.slottedElement);
    // ---------------------------------------------------
    // Automatically set the theme based on the computed
    // background-color of the scrollable element.
    // ---------------------------------------------------
    if (slottedElementBackgroundColorBrightness) {
      this.theme = slottedElementBackgroundColorBrightness;
    }
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
  #updateScrollbarControlSurfacePositions() {
    this.#updateScrollbarXControlSurfacePosition();
    this.#updateScrollbarYControlSurfacePosition();
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
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
  /**
   * @private
   * @method
   * @returns {void}
   */
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
