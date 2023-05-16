import { buildImportableCSSFiles } from './build-tools/cssToJS.build.mjs';
import { buildCodeSnippets } from './build-tools/codeSnippets.build.mjs';
import { buildSVGDataImages } from './build-tools/svgToDataImage.build.mjs';
import { buildImportableSVGFiles } from './build-tools/svgToJS.build.mjs';
import { buildDistributable } from './build-tools/dist.build.mjs';
import { copyModules } from './build-tools/copyModules.build.mjs';

await buildImportableCSSFiles();
await buildCodeSnippets();
await buildSVGDataImages();
await buildImportableSVGFiles();
await copyModules();
await buildDistributable();
