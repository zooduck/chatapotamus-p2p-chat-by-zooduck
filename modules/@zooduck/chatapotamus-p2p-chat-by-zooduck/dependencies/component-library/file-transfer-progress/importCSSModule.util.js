const importCSSModule = async (relativePath) => {
  const cssModule = await import(relativePath, { with: { type: 'css' } });
  return cssModule.default;
}
export { importCSSModule };