import * as fs from 'node:fs/promises';

const SVG_EXPORTS_DIRECTORY = 'src/assets/svg-js';
const SVG_ICON_EXPORTS_DIRECTORY = 'src/assets/svg-js/icons';

const filesToBuild = [
  {
    svgFile: 'src/assets/svg/icons/audio_off.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/audio_off.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/audio_on.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/audio_on.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/cancellation_x.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/cancellation_x.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/chevron_down.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/chevron_down.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/chevron_right.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/chevron_right.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/chevron_up.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/chevron_up.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/display.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/display.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/display_off.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/display_off.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/microphone_off.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/microphone_off.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/microphone_on.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/microphone_on.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/paperclip.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/paperclip.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/webcam_off.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/webcam_off.svg.js`
  },
  {
    svgFile: 'src/assets/svg/icons/webcam_on.svg',
    jsFile: `${SVG_ICON_EXPORTS_DIRECTORY}/webcam_on.svg.js`
  }
];

await fs.rm(SVG_EXPORTS_DIRECTORY, { recursive: true, force: true });
await fs.mkdir(SVG_ICON_EXPORTS_DIRECTORY, { recursive: true });

const buildImportableSVGFiles = async () => {
  for (const { svgFile, jsFile } of filesToBuild) {
    const svgFileContents = await fs.readFile(svgFile, { encoding: 'utf8' });
    await fs.writeFile(
      jsFile,
      'export default `' + svgFileContents + '`;\n'
    );
  }
};

export { buildImportableSVGFiles };
