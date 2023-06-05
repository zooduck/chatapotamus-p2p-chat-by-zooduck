import * as fs from 'node:fs/promises';
import path from 'node:path';
import { buildTools } from '@zooduck/build-tools';
import { commandLineArgs } from '@zooduck/command-line-args';
import { createSourceFilesIntegrity } from './createSourceFilesIntegrity.util.js';
import { reWriteAssetsPathsInCSSJSFiles } from './rewriteAssetsPathsInCSSJSFiles.util.js';

const packageJSONFileContents = await fs.readFile('./package.json', { encoding: 'utf-8' });
const packageJSONData = JSON.parse(packageJSONFileContents);
const { integrity, name, version } = packageJSONData;

const buildDistributable = async () => {
  const sourceFilesIntegrity = await createSourceFilesIntegrity();

  if (sourceFilesIntegrity === integrity && !commandLineArgs().force) {
    console.log('Distributable build skipped, no changes to source files detected.');
    return;
  }

  const DIST = path.join('modules', name);
  const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await fs.mkdir(path.join(DIST, 'build-scripts'));

  const directoriesToCopy = [
    ['./src/assets', path.join(DIST, 'assets')],
    ['./src/code-snippets', path.join(DIST, 'code-snippets')],
    ['./src/components', path.join(DIST, 'components')],
    ['./src/dependencies', path.join(DIST, 'dependencies')],
    ['./src/modules', path.join(DIST, 'modules')],
    ['./src/styles', path.join(DIST, 'styles')],
    ['./distributable-only-files-and-folders/build-scripts', path.join(DIST, 'build-scripts')]
  ];

  const filesToCopy = [
    ['./distributable-only-files-and-folders/package.json', path.join(DIST, 'package.json')],
    ['./distributable-only-files-and-folders/README.md', path.join(DIST, 'README.md')],
    ['./distributable-only-files-and-folders/screenshot.png', path.join(DIST, 'screenshot.png')]
  ];

  for (const [src, dest] of filesToCopy) {
    await fs.copyFile(src, dest);
  }

  for (const [src, dest] of directoriesToCopy) {
    await fs.cp(src, dest, { preserveTimestamps: true, recursive: true });
  }

  const directoriesToRemoveFromDistributable = [
    path.join(DIST, 'dependencies/utils/emojify/unicode-symbols')
  ];

  for (const directoryPath of directoriesToRemoveFromDistributable) {
    await fs.rm(directoryPath, { recursive: true });
  }

  reWriteAssetsPathsInCSSJSFiles(DIST);

  const removeDocStringsAndCommentsFromDistFiles = async (directory) => {
    const directoriesToIgnore = [
      path.join(DIST, 'code-snippets'),
      path.join(DIST, 'modules')
    ];
    if (directoriesToIgnore.includes(directory)) {
      return;
    }
    const fileTypesToRemoveDocStringsAndCommentsFrom = ['.css', '.js'];
    const files = await fs.readdir(directory, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        removeDocStringsAndCommentsFromDistFiles(path.join(directory, file.name));
        continue;
      }

      let fileExtension;

      try {
        fileExtension = file.name.match(FILE_EXTENSION_REGEX)[0];
      } catch (error) {
        console.warn(error, file.name);
        continue;
      }

      if (!fileTypesToRemoveDocStringsAndCommentsFrom.includes(fileExtension)) {
        continue;
      }

      const filePath = path.join(directory, file.name);

      await buildTools.removeCommentsFromFile(filePath);
    };
  }

  await removeDocStringsAndCommentsFromDistFiles(DIST);

  await fs.writeFile('package.json', JSON.stringify({
    ...packageJSONData,
    integrity: sourceFilesIntegrity
  }, null, 2));

  await fs.writeFile(`${DIST}/index.module.js`, `
// Built on ${new Date().toUTCString()} (v${version})
import './components/chatapotamus-p2p-chat-by-zooduck/index.js';
  `.trim());

  console.log(`Distributable saved to ${DIST}`);
};

export { buildDistributable };
