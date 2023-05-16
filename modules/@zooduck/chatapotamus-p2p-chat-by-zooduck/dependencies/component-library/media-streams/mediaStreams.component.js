import '../form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { svgIconService } from '../../../assets/svgIconService.util.js';
import { useCustomScrollbars } from '../../utils/use-custom-scrollbars/index.js';
import mediaStreamAudioOnlyPosterSVGDataImage from '../../../assets/svg-data-image/media_stream_audio_only_poster.svg.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/global.css',
  jsFile: '../../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './mediaStreams.component.css',
  jsFile: './mediaStreams.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../../styles/variables.css',
  jsFile: '../../../styles/variables.css.js'
});
await svgIconService.loadIcons([
  svgIconService.Icon.AUDIO_OFF,
  svgIconService.Icon.AUDIO_ON
]);
class HTMLMediaStreamsElement extends WebComponent {
  static LOCAL_NAME = 'media-streams';
  #DEFAULT_MAX_MEDIA_STREAMS = 10;
  #DEFAULT_MEDIA_STREAMS_TITLE = 'Media Streams';
  #mediaStreamsCount = 0;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
  }
  static get observedAttributes() {
    return [
      'max-media-streams',
      'media-streams-title'
    ];
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'media-streams-title':
        this.ready().then(this.#updateTitle.bind(this));
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.isReady = true;
  }
  get activeStreams() {
    return this.#mediaStreamsCount;
  }
  get maxMediaStreams() {
    return parseInt(this.getAttribute('max-media-streams'), 10) || this.#DEFAULT_MAX_MEDIA_STREAMS;
  }
  set maxMediaStreams(value) {
    this.setAttribute('max-media-streams', value);
  }
  get mediaStreamsTitle() {
    return this.getAttribute('media-streams-title') || this.#DEFAULT_MEDIA_STREAMS_TITLE;
  }
  set mediaStreamsTitle(value) {
    this.setAttribute('media-streams-title', value);
  }
    attachMediaStream(mediaStreamSenderID, mediaStream) {
      if (!this.shadowRoot.getElementById(mediaStreamSenderID)) {
        this.#attachDisplay(mediaStreamSenderID, mediaStream);
        return;
      }
      const mediaStreamVideoElement = this.shadowRoot.getElementById(mediaStreamSenderID).querySelector('.media-stream__video');
      const mediaStreamAudioElement = this.shadowRoot.getElementById(mediaStreamSenderID).querySelector('.media-stream__audio');
      const mediaStreamHasAudio = mediaStream.getTracks().some((track) => {
        return track.kind === 'audio';
      });
      const mediaStreamHasVideo = mediaStream.getTracks().some((track) => {
        return track.kind === 'video';
      });
      if (!mediaStreamHasAudio && !mediaStreamHasVideo) {
        return;
      }
      if (mediaStreamHasVideo && mediaStreamVideoElement.srcObject !== mediaStream) {
        mediaStreamVideoElement.srcObject = mediaStream;
      } else if (!mediaStreamHasAudio && mediaStreamAudioElement.srcObject !== mediaStream) {
        mediaStreamAudioElement.srcObject = mediaStream;
      }
    }
  clearDisplay(mediaStreamSenderID) {
    const mediaStreamElement = this.shadowRoot.getElementById(mediaStreamSenderID);
    if (!mediaStreamElement) {
      return;
    }
    const videoElement = mediaStreamElement.querySelector('.media-stream__video');
    videoElement.srcObject = null;
  }
  onCanPlayVideo(event) {
    const { target: mediaElement } = event;
    const videoElement = mediaElement.parentNode.querySelector('.media-stream__video');
    if (mediaElement instanceof HTMLVideoElement) {
      videoElement.play();
    }
    setTimeout(() => {
      videoElement.classList.add('media-stream__video--canplay');
    }, 250);
  }
  onCanPlayAudio(event) {
    const { target: mediaElement } = event;
    const videoElement = mediaElement.parentNode.querySelector('.media-stream__video');
    videoElement.classList.add('media-stream__video--canplay');
  }
  onVideoClick(event) {
    const { target: videoElement } = event;
    videoElement.requestFullscreen();
  }
  removeDisplay(mediaStreamSenderID) {
    const mediaStreamElement = this.shadowRoot.getElementById(mediaStreamSenderID);
    if (!mediaStreamElement) {
      return;
    }
    mediaStreamElement.remove();
    this.#mediaStreamsCount -= 1;
    this.#updateTitle();
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  setCaption(mediaStreamID, caption) {
    const mediaStreamElement = this.shadowRoot.getElementById(mediaStreamID);
    if (!mediaStreamElement) {
      return;
    }
    const senderIdCaptionElement = mediaStreamElement.querySelector('.media-stream__sender-id');
    senderIdCaptionElement.textContent = caption;
  }
  toggleAudio(event) {
    const { target: toggleAudioButton } = event;
    const { mediaStreamSenderId } = toggleAudioButton.dataset;
    const audioElement = this.shadowRoot.getElementById(mediaStreamSenderId).querySelector('.media-stream__audio');
    audioElement.muted = !audioElement.muted;
  }
  #attachDisplay(mediaStreamSenderID, mediaStream) {
    const mediaStreamHasVideo = mediaStream.getTracks().some((track) => {
      return track.kind === 'video';
    });
    let videoStream = null;
    let audioStream = null;
    if (mediaStreamHasVideo) {
      videoStream = mediaStream;
    } else {
      audioStream = mediaStream;
    }
    const mediaStreamElement = new SafeDOMParser(this).parseFromString`
      <figure class="media-stream" id="${mediaStreamSenderID}">
        <video
          class="media-stream__video"
          [muted]=${true}
          on:canplay="onCanPlayVideo()"
          on:click="onVideoClick()"
          poster="${mediaStreamAudioOnlyPosterSVGDataImage}"
          [srcObject]=${videoStream}>
        </video>
        <audio
          autoplay
          class="media-stream__audio"
          [muted]=${true}
          on:canplay="onCanPlayAudio()"
          [srcObject]=${audioStream}>
        </audio>
        <section class="media-stream__sender-id-and-audio-toggle-button">
          <figcaption class="media-stream__sender-id" title="${mediaStreamSenderID}">${mediaStreamSenderID}</figcaption>
          <x-button
            class="media-stream__audio-toggle-button"
            data-media-stream-sender-id="${mediaStreamSenderID}"
            on:click="toggleAudio()">
            ${svgIconService.getIcon(svgIconService.Icon.AUDIO_OFF, { class: 'icon', slot: 'icon-off' })}
            ${svgIconService.getIcon(svgIconService.Icon.AUDIO_ON, { class: 'icon', slot: 'icon-on' })}
          </x-button>
        </section>
      </figure>
    `;
    if (this.#mediaStreamsCount + 1 > this.maxMediaStreams) {
      return;
    }
    this.shadowRoot.getElementById('media-streams').append(mediaStreamElement);
    this.#mediaStreamsCount += 1;
    this.#updateTitle();
  }
  #createContent() {
    return new SafeDOMParser(this).parseFromString`
      <main>
        <header class="header">
          <h1 class="media-streams-heading">
            <span
              class="media-streams-heading__title"
              id="media-streams-title"
              title="${this.mediaStreamsTitle}">${this.mediaStreamsTitle}</span>
            <span class="media-streams-heading__media-streams-count" id="media-streams-count">0</span>
          </h1>
        </header>
        <section class="media-streams">
          <section class="media-streams__items focus-light" id="media-streams" use-custom-scrollbars></section>
        </section>
      </main>
    `;
  }
  #updateTitle() {
    this.shadowRoot.getElementById('media-streams-title').textContent = this.mediaStreamsTitle;
    this.shadowRoot.getElementById('media-streams-count').textContent = this.#mediaStreamsCount;
  }
}
customElements.define(HTMLMediaStreamsElement.LOCAL_NAME, HTMLMediaStreamsElement);