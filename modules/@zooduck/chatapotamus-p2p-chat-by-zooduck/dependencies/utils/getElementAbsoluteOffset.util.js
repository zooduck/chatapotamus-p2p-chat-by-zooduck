const getElementAbsoluteOffset = (element) => {
  const elementPositionStyle = getComputedStyle(element).getPropertyValue('position');
  if (elementPositionStyle === 'fixed') {
    return {
      left: element.offsetLeft,
      top: element.offsetTop
    };
  }
  let { offsetTop, offsetLeft, offsetParent } = element;
  while (offsetParent) {
    offsetTop += offsetParent.offsetTop;
    offsetLeft += offsetParent.offsetLeft;
    ({ offsetParent } = offsetParent);
  }
  let { parentNode } = element;
  while (parentNode && parentNode.nodeType !== HTMLElement.DOCUMENT_NODE) {
    if (parentNode.nodeType === HTMLElement.DOCUMENT_FRAGMENT_NODE) {
      parentNode = parentNode.host;
      continue;
    }
    offsetTop -= parentNode.scrollTop;
    offsetLeft -= parentNode.scrollLeft;
    ({ parentNode } = parentNode);
  }
  return {
    left: offsetLeft,
    top: offsetTop
  };
};
export { getElementAbsoluteOffset };