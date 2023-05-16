/**
 * @function
 * @param {string} path
 * @returns {Promise<string>}
 */
const fetchText = async (path) => {
  const response = await fetch(path);
  const text = await response.text();

  return text;
}

export { fetchText };
