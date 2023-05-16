const importCSSModule = async (cssFile) => {
  const cssModule = await import(cssFile, { assert: { type: 'css' } });
  return cssModule.default;
}
export { importCSSModule };