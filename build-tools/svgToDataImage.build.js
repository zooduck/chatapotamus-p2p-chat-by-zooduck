import * as fs from 'node:fs/promises';

const SVG_DATA_IMAGE_EXPORTS_DIRECTORY = 'src/assets/svg-data-image';

const filesToBuild = [
  {
    svgFile: 'src/assets/svg/misc/media_stream_audio_only_poster.svg',
    jsFile: `${SVG_DATA_IMAGE_EXPORTS_DIRECTORY}/media_stream_audio_only_poster.svg.js`
  },
  {
    svgFile: 'src/assets/svg/misc/media_stream_empty_poster.svg',
    jsFile: `${SVG_DATA_IMAGE_EXPORTS_DIRECTORY}/media_stream_empty_poster.svg.js`
  },
  {
    svgFile: 'src/assets/svg/misc/media_stream_error_poster.svg',
    jsFile: `${SVG_DATA_IMAGE_EXPORTS_DIRECTORY}/media_stream_error_poster.svg.js`
  },
  {
    svgFile: 'src/assets/svg/misc/media_stream_error_poster_transparent.svg',
    jsFile: `${SVG_DATA_IMAGE_EXPORTS_DIRECTORY}/media_stream_error_poster_transparent.svg.js`
  },
  {
    svgFile: 'src/assets/svg/misc/transparent_pixel.svg',
    jsFile: `${SVG_DATA_IMAGE_EXPORTS_DIRECTORY}/transparent_pixel.svg.js`
  }
];

await fs.rm(SVG_DATA_IMAGE_EXPORTS_DIRECTORY, { recursive: true, force: true });
await fs.mkdir(SVG_DATA_IMAGE_EXPORTS_DIRECTORY, { recursive: true });

const buildSVGDataImages = async () => {
  for (const { svgFile, jsFile } of filesToBuild) {
    const svgFileContents = await fs.readFile(svgFile, { encoding: 'utf8' });
    await fs.writeFile(
      jsFile,
      `export default 'data:image/svg+xml,' + encodeURIComponent(\`\n${svgFileContents}\`);`
    );
  }
};

export { buildSVGDataImages };
