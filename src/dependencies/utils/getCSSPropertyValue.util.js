/**
 * Get a CSS Property value (also known as a CSS Variable) from an element.
 *
 * @function
 * @param {HTMLElement} element
 * @param {string} cssProperty
 */
const getCSSPropertyValue = (element, cssProperty) => {
  let value = getComputedStyle(element).getPropertyValue(cssProperty);
  if (value) {
    return Promise.resolve(value);
  }
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      value = getComputedStyle(element).getPropertyValue(cssProperty);
      if (value) {
        clearInterval(interval);
        resolve(value);
      }
    }, 100);
  });
};

export { getCSSPropertyValue };
