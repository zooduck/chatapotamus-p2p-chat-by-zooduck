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