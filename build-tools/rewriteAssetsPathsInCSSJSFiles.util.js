import * as fs from 'node:fs/promises';
import path from 'node:path';

const { name: moduleName } = JSON.parse(await fs.readFile('./package.json', { encoding: 'utf-8' }));

// ----------------------------------------------------------------------------------------
// Since the css.js files are set as the content of a CSSStyleSheet object (in other
// words they are Constructable Style Sheets) relative paths cannot be resolved by the
// user agent (since the CSSStyleSheet object resides in memory and has no file path).
// ----------------------------------------------------------------------------------------
// Note: These css.js files only exist because Firefox does not support Import Assertions
// which MDN docs claim is a non-standard feature. If Import Assertions are supported, the
// css.js files are never used (instead the source .css file is imported directly, and
// relative paths work as expected since the user agent knows the location of the file).
// ----------------------------------------------------------------------------------------
const reWriteAssetsPathsInCSSJSFiles = async (directory) => {
  const files = await fs.readdir(directory, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(directory, file.name);
    if (file.isDirectory()) {
      reWriteAssetsPathsInCSSJSFiles(filePath);
      continue;
    }
    if (file.name.endsWith('.css.js')) {
      const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });
      const DISTRIBUTABLE_ASSETS_PATH = `modules/${moduleName}/assets`;
      const ASSETS_RELATIVE_PATH_REGEX = /(?:\.\.\/)*assets/g;
      const fileContentsWithAssetsPathsPointingToDistributable = fileContents.replace(ASSETS_RELATIVE_PATH_REGEX, DISTRIBUTABLE_ASSETS_PATH);
      if (filePath.includes('src')) {
        throw new Error(`Request to write to source file "${filePath}" is denied! Distributable build has been terminated.`);
      }
      await fs.writeFile(filePath, fileContentsWithAssetsPathsPointingToDistributable);
    }
  }
};

export { reWriteAssetsPathsInCSSJSFiles };
