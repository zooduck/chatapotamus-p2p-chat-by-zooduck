/**
 * @function
 * @param {string} assertionType
 * @returns {boolean}
 */
const isImportAssertionSupported = (assertionType) => {
  const SUPPORTED_ASSERTION_TYPES_REGEX = /^(css|json)$/;
  const SUPPORTED_RENDERING_ENGINE_REGEX = /Chrome\/\d{3}/;

  return SUPPORTED_ASSERTION_TYPES_REGEX.test(assertionType) && SUPPORTED_RENDERING_ENGINE_REGEX.test(navigator.userAgent);
};

export { isImportAssertionSupported };
