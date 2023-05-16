/**
 * @function
 * @param {HTMLSelectElement} selectElement
 * @param {string} valueToRemove
 * @returns {void}
 */
const removeOptionFromSelect = (selectElement, valueToRemove) => {
  const optionToRemove = Array.from(selectElement.options).find((option) => {
    return option.value === valueToRemove;
  });

  if (!optionToRemove) {
    return;
  }

  optionToRemove.remove();
  selectElement.selectedIndex = 0;
};

export { removeOptionFromSelect };
