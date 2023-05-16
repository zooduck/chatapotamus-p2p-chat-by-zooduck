import * as fs from 'node:fs/promises';

const filesToBuild = [
  {
    cssFile: 'src/styles/global.css',
    jsFile: 'src/styles/global.css.js'
  },
  {
    cssFile: 'src/styles/variables.css',
    jsFile: 'src/styles/variables.css.js'
  },
  {
    cssFile: 'src/components/chatapotamus-p2p-chat-by-zooduck/chatapotamusP2PChatByZooduck.component.css',
    jsFile: 'src/components/chatapotamus-p2p-chat-by-zooduck/chatapotamusP2PChatByZooduck.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/emoji-tray/emojiTray.component.css',
    jsFile: 'src/dependencies/component-library/emoji-tray/emojiTray.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/file-transfer-progress/fileTransferProgress.component.css',
    jsFile: 'src/dependencies/component-library/file-transfer-progress/fileTransferProgress.component.css.js',
  },
  {
    cssFile: 'src/dependencies/component-library/form-controls/input-text/inputText.component.css',
    jsFile: 'src/dependencies/component-library/form-controls/input-text/inputText.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/form-controls/x-button/xButton.component.css',
    jsFile: 'src/dependencies/component-library/form-controls/x-button/xButton.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/slide-in/slideIn.component.css',
    jsFile: 'src/dependencies/component-library/slide-in/slideIn.component.css.js',
  },
  {
    cssFile: 'src/dependencies/component-library/media-streams/mediaStreams.component.css',
    jsFile: 'src/dependencies/component-library/media-streams/mediaStreams.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/x-chat/xChat.component.css',
    jsFile: 'src/dependencies/component-library/x-chat/xChat.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/x-details/xDetails.component.css',
    jsFile: 'src/dependencies/component-library/x-details/xDetails.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/x-loading/xLoading.component.css',
    jsFile: 'src/dependencies/component-library/x-loading/xLoading.component.css.js'
  },
  {
    cssFile: 'src/dependencies/component-library/x-progress/xProgress.component.css',
    jsFile: 'src/dependencies/component-library/x-progress/xProgress.component.css.js'
  },
  {
    cssFile: 'src/dependencies/utils/alert-service/components/alert-service-alert/alertServiceAlert.component.css',
    jsFile: 'src/dependencies/utils/alert-service/components/alert-service-alert/alertServiceAlert.component.css.js'
  },
  {
    cssFile: 'src/dependencies/utils/alert-service/components/alert-service-confirm/alertServiceConfirm.component.css',
    jsFile: 'src/dependencies/utils/alert-service/components/alert-service-confirm/alertServiceConfirm.component.css.js'
  },
  {
    cssFile: 'src/dependencies/utils/splash-screen-service/components/splash-screen-service-splash-screen/splashScreenServiceSplashScreen.component.css',
    jsFile: 'src/dependencies/utils/splash-screen-service/components/splash-screen-service-splash-screen/splashScreenServiceSplashScreen.component.css.js'
  },
  {
    cssFile: 'src/dependencies/utils/use-custom-scrollbars/components/x-scroller/xScroller.component.css',
    jsFile: 'src/dependencies/utils/use-custom-scrollbars/components/x-scroller/xScroller.component.css.js'
  }
];

const buildImportableCSSFiles = async () => {
  for (const { cssFile, jsFile } of filesToBuild) {
    const cssFileContents = await fs.readFile(cssFile, { encoding: 'utf8' });
    await fs.writeFile(
      jsFile,
      'export default `\n' + cssFileContents + '`;\n'
    );
  }
};

export { buildImportableCSSFiles };
