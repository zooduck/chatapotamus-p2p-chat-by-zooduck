/**
 * @function
 * @param {string} path
 * @returns {Promise<string|null>}
 */
const fetchSVG = async (path) => {
  const response = await fetch(path);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      resolve(fileReader.result);
    }
    fileReader.readAsDataURL(blob);
  });
};

export { fetchSVG };
