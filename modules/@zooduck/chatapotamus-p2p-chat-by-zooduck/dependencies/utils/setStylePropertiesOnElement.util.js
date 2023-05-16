const setStylePropertiesOnElement = (element, styles = []) => {
  styles.forEach(([property, value, priority]) => {
    element.style.setProperty(property, value, priority);
  });
};
export { setStylePropertiesOnElement };