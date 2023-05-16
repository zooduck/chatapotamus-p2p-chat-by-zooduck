import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { ScreenShareService } from './ScreenShareService.util.js';
import { UserMediaService } from './UserMediaService.util.js';

/**
 * @mixes SendCustomEvent
 */
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

  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
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

  /**
   * @private
   * @static
   * @method
   * @returns {string}
   */
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }

  /**
   * @type {HTMLVideoElement|null}
   */
  get display() {
    return this.#display instanceof HTMLVideoElement ? this.#display : null;
  }

  set display(value) {
    this.#display = value;
  }

  /**
   * @readonly
   * @type {MediaStreamTrack[]}
   */
  get enabledTracks() {
    return this.#userMediaService.enabledTracks;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isScreenBeingShared() {
    return this.#screenShareService.isScreenBeingShared;
  }

  /**
   * @private
   * @readonly
   * @type {{camera: MediaStream, microphone: MediaStream, screen: MediaStream}}
   */
  get #streams() {
    return {
      camera: this.#userMediaService.videoStream,
      microphone: this.#userMediaService.audioStream,
      screen: this.#screenShareService.stream
    };
  }

  // -----------------------
  // PUBLIC (CAMERA)
  // -----------------------

  /**
   * @method
   * @returns {Promise<void>}
   */
  connectCamera() {
    return this.#userMediaService.connectCamera();

  }

  /**
   * @method
   * @returns {Promise<void>}
   */
  connectMicrophone() {
    return this.#userMediaService.connectMicrophone();
  }

  /**
   * @method
   * @returns {void}
   */
  disableCamera() {
    this.#userMediaService.disableCamera();
  }

  /**
   * @method
   * @returns {void}
   */
  disableMicrophone() {
    this.#userMediaService.disableMicrophone();
  }

  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  disconnectCamera(connections) {
    this.#userMediaService.disconnectCamera(connections);
  }

  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  disconnectMicrophone(connections) {
    this.#userMediaService.disconnectMicrophone(connections);
  }

  /**
   * @method
   * @param {RTCPeerConnection[]}
   * @returns {Promise<void>}
   */
  publishCamera(connections) {
    return this.#userMediaService.publishCamera(connections);
  }

  /**
   * @method
   * @param {RTCPeerConnection[]}
   * @returns {Promise<void>}
   */
  publishMicrophone(connections) {
    return this.#userMediaService.publishMicrophone(connections);
  }

  // -----------------------
  // PUBLIC (SCREEN)
  // -----------------------

  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {Promise<void>}
   */
  publishScreen(connections) {
    return this.#screenShareService.publishScreen(connections);
  }

  /**
   * @method
   * @returns {Promise<void>}
   */
  async startSharingScreen() {
    await this.#screenShareService.startSharing();
    this.#setDisplaySource(this.#streams.screen);
  }

  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  stopSharingScreen(connections) {
    this.#screenShareService.stopSharing(connections);
  }

  // -----------------------
  // PRIVATE
  // -----------------------

  /**
   * @private
   * @method
   * @returns {void}
   */
  #addEventListeners() {
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACK_ENABLE, this.#onMediaStreamTrackEnable.bind(this));
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACK_DISABLE, this.#onMediaStreamTrackDisable.bind(this));
    this.#userMediaService.addEventListener(UserMediaService.EventDict.MEDIA_STREAM_TRACKS_DISABLE, this.#onMediaStreamTracksDisable.bind(this));
    this.#screenShareService.addEventListener(ScreenShareService.EventDict.SCREEN_SHARE, this.#onScreenShare.bind(this));
    this.#screenShareService.addEventListener(ScreenShareService.EventDict.SCREEN_SHARE_END, this.#onScreenShareEnd.bind(this));
  }

  /**
   * @private
   * @type {EventListener}
   */
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

  /**
   * @private
   * @type {EventListener}
   */
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

  /**
   * @private
   * @type {EventListener}
   */
  #onMediaStreamTracksDisable(event) {
    this.sendCustomEvent(this.constructor.EventDict.USER_MEDIA_TRACKS_DISABLE, { detail: event.detail });
    if (!this.#streams.screen?.active) {
      this.#hideDisplay();
    }
  }

  /**
   * @type {EventListener}
   */
  #onScreenShare(event) {
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE, { detail: event.detail });
  }

  /**
   * @type {EventListener}
   */
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

  /**
   * @private
   * @method
   * @param {MediaStream} mediaStream
   */
  #setDisplaySource(mediaStream) {
    if (!this.display) {
      return;
    }
    this.display.srcObject = mediaStream;
  }

  /**
   * @private
   * @method
   * @returns {void}
   */
  #hideDisplay() {
    if (!this.display) {
      return;
    }
    this.display.srcObject = null;
  }
}

export { MediaStreamService };
