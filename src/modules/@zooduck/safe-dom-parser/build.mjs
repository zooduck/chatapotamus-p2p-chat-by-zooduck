import * as fs from 'node:fs/promises';
import { buildTools } from '@zooduck/build-tools';

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist');
await fs.copyFile('src/SafeDOMParser.module.js', 'dist/index.module.js');
await buildTools.removeCommentsFromFile('dist/index.module.js');
