/**
 * @typedef {[string, Object.<string, string>]} SelectorStyles
 */

/**
 * @function
 * @param {CSSStyleSheet} cssStyleSheet
 * @param {HTMLElement} element
 * @param {{checkHostSelectorsOnly: boolean}}
 * @returns {SelectorStyles}
 */
const getSelectorStyles = (cssStyleSheet, element, { checkHostSelectorsOnly = false } = {}) => {
  const selectorStyles = [];
  const winningStyles = {}; // For styles with !important
  let cssRules;

  try {
     ({ cssRules } = cssStyleSheet);
  } catch (error) {
    // ...
  } finally {
    if (!cssRules) {
      return selectorStyles;
    }
  }

  Array.from(cssStyleSheet.cssRules).forEach((cssStyleRule) => {
    if (!cssStyleRule.selectorText) {
      return;
    }

    if (checkHostSelectorsOnly && cssStyleRule.selectorText !== ':host') {
      return;
    }

    const selectors = cssStyleRule.selectorText.split(',');

    selectors.forEach((selector) => {
      const ELEMENT_SELECTOR_REGEX = /^[A-Za-z]+/;
      const CLASS_SELECTOR_REGEX = /\.[A-Za-z-_]+/g;
      const isGlobalSelector = element.shadowRoot && selector === ':host' || selector === '*';

      if (!isGlobalSelector && selector.match(ELEMENT_SELECTOR_REGEX) && !selector.startsWith(element.localName)) {
        return;
      }

      const classesInSelector = selector.match(CLASS_SELECTOR_REGEX) || [''];
      const allSelectorsFoundInElementClassList = classesInSelector.every((classSelector) => {
        return Array.from(element.classList).includes(classSelector.replace(/^./, ''));
      });

      if (!isGlobalSelector && !allSelectorsFoundInElementClassList) {
        return;
      }

      const STYLE_DECLARATION_REGEX = /[a-zA-z-]+[a-zA-Z]: *[a-zA-Z0-9-!,'%(). ]+[^-](?=;)/g;
      const stylesForSelector = {};
      const cssStyleDeclarations = cssStyleRule.cssText.match(STYLE_DECLARATION_REGEX);
      if (!cssStyleDeclarations) {
        return;
      }
      cssStyleDeclarations.forEach((styleDeclaration) => {
        const [styleProperty, styleValue] = styleDeclaration.split(':');
        if (
          winningStyles[styleProperty]
          && winningStyles[styleProperty].includes('!important')
          && !styleValue.includes('!important')
        ) {
          return;
        }
        winningStyles[styleProperty] = styleValue.trim();
        stylesForSelector[styleProperty] = styleValue.trim();
      });

      selectorStyles.push([selector, stylesForSelector]);
    });
  });

  return selectorStyles;
};
/**
 * Get CSS Styles for an element by reading style declarations
 * from all stylesheets in the element's scope.
 *
 * This is NOT the same as getComputedStyle() which returns
 * a computed width (i.e. XXXpx) for an element with a width
 * style of 100% (or no width style at all).
 *
 * @function
 * @param {HTMLElement} element
 */
const getCSSStylesFromElement = (element) => {
  const rootNode = element.getRootNode();
  const { shadowRoot } = element;
  let finalStyles = {};
  let selectors = [];

  if (shadowRoot) {
    Array.from(shadowRoot.styleSheets).forEach((sheet) => {
      selectors = selectors.concat(getSelectorStyles(sheet, element, { checkHostSelectorsOnly: true }));
    });
    shadowRoot.adoptedStyleSheets.forEach((sheet) => {
      selectors = selectors.concat(getSelectorStyles(sheet, element, { checkHostSelectorsOnly: true }));
    });
  }

  Array.from(rootNode.styleSheets).forEach((sheet) => {
    selectors = selectors.concat(getSelectorStyles(sheet, element));
  });
  rootNode.adoptedStyleSheets.forEach((sheet) => {
    selectors = selectors.concat(getSelectorStyles(sheet, element));
  });

  const selectorsSortedBySpecificity = Array.from(selectors).sort((a, b) => {
    return a[0].length - b[0].length;
  });

  selectorsSortedBySpecificity.forEach(([_selectorText, styles]) => {
    finalStyles = { ...finalStyles, ...styles };
  });

  // ---------------------------------------------------------------------------------
  // Styles set directly on the element take precedence over styles from style sheets
  // (unless the stylesheet style has important priiority and the style set on the
  // element does not).
  // ---------------------------------------------------------------------------------
  Array.from(element.style).forEach((styleProperty) => {
    const elementStyleHasImportantPriority = element.style.getPropertyPriority(styleProperty) === 'important';
    if (finalStyles[styleProperty] && finalStyles[styleProperty].includes('!important') && !elementStyleHasImportantPriority) {
      return;
    }
    finalStyles[styleProperty] = element.style.getPropertyValue(styleProperty);
    if (elementStyleHasImportantPriority) {
      finalStyles[styleProperty] += ' !important';
    }
  });

  return finalStyles;
};

export { getCSSStylesFromElement };
