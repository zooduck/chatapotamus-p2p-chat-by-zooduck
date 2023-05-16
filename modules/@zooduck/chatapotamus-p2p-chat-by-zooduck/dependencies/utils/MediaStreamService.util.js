import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { ScreenShareService } from './ScreenShareService.util.js';
import { UserMediaService } from './UserMediaService.util.js';
class MediaStreamService extends sendCustomEventMixin() {
  #display;
  #screenShareService;
  #userMediaService;
  constructor() {
    super();
    this.#screenShareService = new ScreenShareService();
    this.#userMediaService = new UserMediaService();
    this.#addEventListeners();
  }
  static get EventDict() {
    return {
      CAMERA_TRACK_DISABLE: this.#createEventTypeWithNamespace('cameratrackdisable'),
      CAMERA_TRACK_ENABLE: this.#createEventTypeWithNamespace('cameratrackenable'),
      MICROPHONE_TRACK_DISABLE: this.#createEventTypeWithNamespace('microphonetrackdisable'),
      MICROPHONE_TRACK_ENABLE: this.#createEventTypeWithNamespace('microphonetrackenable'),
      USER_MEDIA_TRACKS_DISABLE: this.#createEventTypeWithNamespace('usermediatracksdisable'),
      SCREEN_SHARE: this.#createEventTypeWithNamespace('screenshare'),
      SCREEN_SHARE_END: this.#createEventTypeWithNamespace('screenshareend')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }
  get display() {
    return this.#display instanceof HTMLVideoElement ? this.#display : null;
  }
  set display(value) {
    this.#display = value;
  }
  get enabledTracks() {
    return this.#userMediaService.enabledTracks;
  }
  get isScreenBeingShared() {
    return this.#screenShareService.isScreenBeingShared;
  }
  get #streams() {
    return {
      camera: this.#userMediaService.videoStream,
      microphone: this.#userMediaService.audioStream,
      screen: this.#screenShareService.stream
    };
  }
  connectCamera() {
    return this.#userMediaService.connectCamera();
  }
  connectMicrophone() {
    return this.#userMediaService.connectMicrophone();
  }
  disableCamera() {
    this.#userMediaService.disableCamera();
  }
  disableMicrophone() {
    this.#userMediaService.disableMicrophone();
  }
  disconnectCamera(connections) {
    this.#userMediaService.disconnectCamera(connections);
  }
  disconnectMicrophone(connections) {
    this.#userMediaService.disconnectMicrophone(connections);
  }
  publishCamera(connections) {
    return this.#userMediaService.publishCamera(connections);
  }
  publishMicrophone(connections) {
    return this.#userMediaService.publishMicrophone(connections);
  }
  publishScreen(connections) {
    return this.#screenShareService.publishScreen(connections);
  }
  async startSharingScreen() {
    await this.#screenShareService.startSharing();
    this.#setDisplaySource(this.#streams.screen);
  }
  stopSharingScreen(connections) {
    this.#screenShareService.stopSharing(connections);
  }
  #addEventListeners() {
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACK_ENABLE, this.#onMediaStreamTrackEnable.bind(this));
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACK_DISABLE, this.#onMediaStreamTrackDisable.bind(this));
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACKS_DISABLE, this.#onMediaStreamTracksDisable.bind(this));
    this.#screenShareService.addEventListener(ScreenShareService.EventDict.SCREEN_SHARE, this.#onScreenShare.bind(this));
    this.#screenShareService.addEventListener(ScreenShareService.EventDict.SCREEN_SHARE_END, this.#onScreenShareEnd.bind(this));
  }
  #onMediaStreamTrackDisable(event) {
    const { track } = event.detail;
    switch (track.kind) {
      case 'audio':
        this.sendCustomEvent(this.constructor.EventDict.MICROPHONE_TRACK_DISABLE, { detail: event.detail });
        break;
      case 'video':
        this.sendCustomEvent(this.constructor.EventDict.CAMERA_TRACK_DISABLE, { detail: event.detail });
        if (!this.#streams.screen?.active) {
          this.#hideDisplay();
        }
        break;
      default:
        break;
    }
  }
  #onMediaStreamTrackEnable(event) {
    const { stream, track } = event.detail;
    const shouldUpdateDisplaySource = track.kind === 'video' && !this.#streams.screen?.active;
    switch (track.kind) {
      case 'audio':
        this.sendCustomEvent(this.constructor.EventDict.MICROPHONE_TRACK_ENABLE, { detail: event.detail });
        break;
      case 'video':
        this.sendCustomEvent(this.constructor.EventDict.CAMERA_TRACK_ENABLE, { detail: event.detail });
        break;
      default:
        break;
    }
    if (!shouldUpdateDisplaySource) {
      return;
    }
    this.#setDisplaySource(stream);
  }
  #onMediaStreamTracksDisable(event) {
    this.sendCustomEvent(this.constructor.EventDict.USER_MEDIA_TRACKS_DISABLE, { detail: event.detail });
    if (!this.#streams.screen?.active) {
      this.#hideDisplay();
    }
  }
  #onScreenShare(event) {
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE, { detail: event.detail });
  }
  #onScreenShareEnd(event) {
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE_END, { detail: event.detail });
    if (this.enabledTracks.find(({ kind }) => {
      return kind === 'video';
    })) {
      this.#setDisplaySource(this.#streams.camera);
    } else {
      this.#hideDisplay();
    }
  }
  #setDisplaySource(mediaStream) {
    if (!this.display) {
      return;
    }
    this.display.srcObject = mediaStream;
  }
  #hideDisplay() {
    if (!this.display) {
      return;
    }
    this.display.srcObject = null;
  }
}
export { MediaStreamService };