import * as fs from 'node:fs/promises';
import * as crypto from 'crypto';
import path from 'node:path';

const createSourceFilesIntegrity = async () => {
  let combinedFileContents = '';

  const updateCombinedFileContentsString = async (file) => {
    const fileContents = await fs.readFile(file, { encoding: 'utf-8' });
    combinedFileContents += fileContents;
  };

  const readFiles = async (directory) => {
    const sourceFiles = await fs.readdir(directory, { withFileTypes: true });
    for (const file of sourceFiles) {
      const filePath = path.join(directory, file.name);
      if (file.isDirectory()) {
        await readFiles(filePath);
        continue;
      }
      await updateCombinedFileContentsString(filePath);
    }
  };

  const pkg = await fs.readFile('./package.json', { encoding: 'utf-8' });
  const pkgData = JSON.parse(pkg);

  delete pkgData.integrity;

  combinedFileContents += JSON.stringify(pkgData);

  await readFiles('src');
  await readFiles('distributable-only-files-and-folders');

  return crypto.createHash('sha256').update(combinedFileContents).digest('hex');
};

export { createSourceFilesIntegrity };
