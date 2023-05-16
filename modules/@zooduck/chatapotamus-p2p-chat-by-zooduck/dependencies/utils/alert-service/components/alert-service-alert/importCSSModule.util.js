const importCSSModule = async (relativePath) => {
  const cssModule = await import(relativePath, { assert: { type: 'css' } });
  return cssModule.default;
}
export { importCSSModule };