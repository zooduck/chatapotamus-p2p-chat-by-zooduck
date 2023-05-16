/**
 * @function
 * @param {HTMLElement} element
 * @param {[property:string, value:string, priority:string][]} styles
 * @returns {void}
 */
const setStylePropertiesOnElement = (element, styles = []) => {
  styles.forEach(([property, value, priority]) => {
    element.style.setProperty(property, value, priority);
  });
};

export { setStylePropertiesOnElement };
