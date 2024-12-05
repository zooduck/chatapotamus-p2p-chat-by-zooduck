const importCSSModule = async (cssFile) => {
  const cssModule = await import(cssFile, { with: { type: 'css' } });

  return cssModule.default;
}

export { importCSSModule };
