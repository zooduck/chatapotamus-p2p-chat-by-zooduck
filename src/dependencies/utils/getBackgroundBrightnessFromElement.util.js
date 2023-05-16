/**
 * @function
 * @param {HTMLElement} element
 * @returns {'dark'|'light'|undefined}
 */
const getBackgroundColorBrightnessFromElement = (element) => {
  const TRANSPARENT_RGBA_COLOR_PATTERN = /rgba\(0, ?0, ?0, ?0/;
  const { backgroundColor } = getComputedStyle(element);

  if (TRANSPARENT_RGBA_COLOR_PATTERN.test(backgroundColor)) {
    if (element.parentNode.nodeType === document.ELEMENT_NODE) {
      return getBackgroundColorBrightnessFromElement(element.parentNode);
    } else if (element.parentNode.nodeType === document.DOCUMENT_FRAGMENT_NODE) {
      return getBackgroundColorBrightnessFromElement(element.parentNode.host);
    }
    // -----------------------------------------------------------------------------
    // Return undefined if no computed background-color can be found on any parent.
    // -----------------------------------------------------------------------------
    return;
  }

  const rgbValues = backgroundColor.replace(/rgba?\(|\)/g, '').split(',').slice(0, 3);
  const combinedRGBValues = rgbValues.reduce((previousValue, currentValue) => {
    return parseFloat(previousValue) + parseFloat(currentValue);
  });

  return combinedRGBValues > (255 * 3 / 2) ? 'light' : 'dark';
};

export { getBackgroundColorBrightnessFromElement };
