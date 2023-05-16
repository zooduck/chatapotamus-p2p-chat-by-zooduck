/**
 * @function
 * @param {string} assertionType
 * @returns {boolean}
 */
const isImportAssertionSupported = (assertionType) => {
  let isSupported;
  try {
    new Function(`import('', { assert: { type: '${assertionType}' } })`);
    isSupported = true;
  } catch {
    isSupported = false;
  }

  return isSupported;
};

export { isImportAssertionSupported };
