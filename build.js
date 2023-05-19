import { buildImportableCSSFiles } from './build-tools/cssToJS.build.js';
import { buildCodeSnippets } from './build-tools/codeSnippets.build.js';
import { buildSVGDataImages } from './build-tools/svgToDataImage.build.js';
import { buildImportableSVGFiles } from './build-tools/svgToJS.build.js';
import { buildDistributable } from './build-tools/dist.build.js';
import { copyModules } from './build-tools/copyModules.build.js';

await buildImportableCSSFiles();
await buildCodeSnippets();
await buildSVGDataImages();
await buildImportableSVGFiles();
await copyModules();
await buildDistributable();
