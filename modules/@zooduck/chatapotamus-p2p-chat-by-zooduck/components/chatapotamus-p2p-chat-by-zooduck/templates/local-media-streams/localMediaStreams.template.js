import '../../../../dependencies/component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import mediaStreamErrorPosterSVGDataImage from '../../../../assets/svg-data-image/media_stream_error_poster_transparent.svg.js';
import { svgIconService } from '../../../../assets/svgIconService.util.js';
import { ScreenShareFormValue, UserControlText } from '../../magicStrings.js';
await svgIconService.loadIcons([
  svgIconService.Icon.DISPLAY,
  svgIconService.Icon.DISPLAY_OFF,
  svgIconService.Icon.MICROPHONE_OFF,
  svgIconService.Icon.MICROPHONE_ON,
  svgIconService.Icon.WEBCAM_OFF,
  svgIconService.Icon.WEBCAM_ON
]);
function localMediaStreamsTemplate() {
  return new SafeDOMParser(this).parseFromString`
    <section class="local-media-streams">
      <video
        autoplay
        class="local-media-streams__display"
        id="local-media-streams-display"
        muted
        on:click="onLocalMediaStreamsDisplayClick()"
        poster="${mediaStreamErrorPosterSVGDataImage}">
      </video>
      <section class="local-media-streams__controls">
        <section class="local-media-streams__camera-controls">
          <x-button
            action="secondary"
            name="toggle-camera-button"
            title="Toggle Webcam"
            on:click="onToggleCameraButtonClick()">
            <span id="toggle-camera-button-text">${UserControlText.TOGGLE_CAMERA}</span>
            ${svgIconService.getIcon(svgIconService.Icon.WEBCAM_OFF, { class: 'icon', slot: 'icon-off' })}
            ${svgIconService.getIcon(svgIconService.Icon.WEBCAM_ON, { class: 'icon', slot: 'icon-on' })}
          </x-button>
          <x-button
            action="secondary"
            name="toggle-microphone-button"
            title="Toggle Microphone"
            on:click="onToggleMicrophoneButtonClick()">
            <span id="toggle-microphone-button-text">${UserControlText.TOGGLE_MICROPHONE}</span>
            ${svgIconService.getIcon(svgIconService.Icon.MICROPHONE_OFF, { class: 'icon', slot: 'icon-off' })}
            ${svgIconService.getIcon(svgIconService.Icon.MICROPHONE_ON, { class: 'icon', slot: 'icon-on' })}
          </x-button>
        </section>
        <section class="local-media-streams__screen-share-controls">
          <form
            autocomplete="off"
            class="local-media-streams__screen-share-form"
            id="screen-share-form"
            on:submit="onScreenShareFormSubmit()">
            <input
              id="screen-share-action-input"
              name="screen-share-action"
              type="hidden"
              value="${ScreenShareFormValue.SHARE_SCREEN}">
            <x-button
              action="secondary"
              id="screen-share-form-submit-button"
              on:click="onScreenShareFormSubmitButtonClick()"
              type="submit">
              <span id="screen-share-form-submit-button-text">${UserControlText.SHARE_SCREEN}</span>
              ${svgIconService.getIcon(svgIconService.Icon.DISPLAY_OFF, { class: 'icon', slot: 'icon-off' })}
              ${svgIconService.getIcon(svgIconService.Icon.DISPLAY, { class: 'icon', slot: 'icon-on' })}
            </x-button>
          </form>
        </section>
      </section>
    </section>
  `;
}
export { localMediaStreamsTemplate };