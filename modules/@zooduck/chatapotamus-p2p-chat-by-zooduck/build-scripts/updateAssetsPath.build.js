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