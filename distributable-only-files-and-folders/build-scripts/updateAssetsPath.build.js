import * as fs from 'node:fs/promises';
import path from 'node:path';

const packageJSONFileContents = await fs.readFile('./package.json', { encoding: 'utf-8' });
const packageJSONData = JSON.parse(packageJSONFileContents);
const { currentAssetsPath, newAssetsPath } = packageJSONData;

const normalizeAssetsPath = (assetsPath) => {
  if (!assetsPath) {
    return assetsPath;
  }
  return assetsPath.replace(/\/$/, '');
};

const CURRENT_DISTRIBUTABLE_ASSETS_PATH = normalizeAssetsPath(currentAssetsPath);
const NEW_DISTRIBUTABLE_ASSETS_PATH = normalizeAssetsPath(newAssetsPath);
const DIRECTORIES_TO_IGNORE = ['build-tools', 'code-snippets', 'modules'];
const FILE_NAME_IN_PATH_REGEX = /\\[^\\]+\.mjs$|\/[^/]+\.mjs$/;
const distributableModuleRoot = path.resolve(path.join(process.argv[1].replace(FILE_NAME_IN_PATH_REGEX, ''), '../'));
const filesUpdated = [];

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
const reWriteAssetsPathsInCSSJSFiles = async (directoryPath) => {
  const directory = directoryPath.match(/[^\\/]+$/)[0];
  if (DIRECTORIES_TO_IGNORE.includes(directory)) {
    return;
  }
  const files = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(directoryPath, file.name);
    if (file.isDirectory()) {
      await reWriteAssetsPathsInCSSJSFiles(filePath);
      continue;
    }
    if (file.name.endsWith('.css.js')) {
      const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });
      const CURRENT_DISTRIBUTABLE_ASSETS_PATH_REGEX = new RegExp(`(?:['"(])${CURRENT_DISTRIBUTABLE_ASSETS_PATH}`, 'g');
      // =============================================================
      // The above Regular Expression and the below replacement
      // function are a little more complicated than what you
      // might expect, since we cannot just do a global find and
      // replace on current assets path.
      // =============================================================
      // We have to make sure that the current assets path is matched
      // from the start of the path only (since it may also be
      // included in the new assets path, in which case running
      // the script more than once with the same parameters would
      // produce undesirable results).
      // =============================================================
      // Given a current assets path of "modules/@zooduck/..."
      // -------------------------------------------------------------
      // The above regex would capture:
      // -------------------------------
      // url('modules/@zooduck/...)
      // url("modules/@zooduck/...)
      // url(modules/@zooduck/...)
      // --------------------------------------------------------------------
      // But importantly it would NOT capture the "modules/@zooduck/..." in:
      // --------------------------------------------------------------------
      // url(public/modules/@zooduck/...)
      // url('public/modules/@zooduck/...)
      // url("public/modules/@zooduck/...)
      // -----------------------------------
      const fileContentsWithNewAssetsPaths = fileContents.replace(CURRENT_DISTRIBUTABLE_ASSETS_PATH_REGEX, (match) => {
        const currentPath = match.replace(/['"()]/, '');
        return match.replace(currentPath, NEW_DISTRIBUTABLE_ASSETS_PATH);
      });
      if (fileContentsWithNewAssetsPaths === fileContents) {
        continue;
      }
      await fs.writeFile(filePath, fileContentsWithNewAssetsPaths);
      filesUpdated.push(filePath);
    }
  }
};

await reWriteAssetsPathsInCSSJSFiles(distributableModuleRoot);

if (filesUpdated.length) {
  console.log('\n\rAssets paths updated from "%s" to "%s" for the following .css.js files:\n\r', CURRENT_DISTRIBUTABLE_ASSETS_PATH, NEW_DISTRIBUTABLE_ASSETS_PATH);
  filesUpdated.forEach((filePath) => {
    console.log(`>>> ${filePath}\n\r`);
  });
}
