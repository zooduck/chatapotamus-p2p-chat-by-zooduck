import { isImportAssertionSupported } from '../../utils/isImportAssertionSupported.util.js';

const loadCSSStyleSheet = async (pathData) => {
  const { cssFile, jsFile } = pathData;
  let cssStyleSheet;

  if (isImportAssertionSupported('css')) {
    const { importCSSModule } = await import('./importCSSModule.util.js');
    cssStyleSheet = await importCSSModule(cssFile);
  } else {
    const { default: styles } = await import(jsFile);
    cssStyleSheet = new CSSStyleSheet();
    cssStyleSheet.replace(styles);
  }

  return cssStyleSheet;
};

export { loadCSSStyleSheet };
