/**
 * @function
 * @param {string} path
 * @returns {Promise<*>}
 */
const fetchJSON = async (path) => {
  const response = await fetch(path);
  const json = await response.json();

  return json;
};

export { fetchJSON };
