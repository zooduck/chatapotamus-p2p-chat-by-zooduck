import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';

/**
 * @mixes SendCustomEvent
 */
class ScreenShareService extends sendCustomEventMixin() {
  #senders;
  #display;
  #stream;
  constructor() {
    super();
    this.#senders = new Map();
  }
  /**
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
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
   * @type {HTMLVideoElement}
   */
  get display() {
    return this.#display instanceof HTMLVideoElement ? this.#display : null;
  }
  set display(value) {
    this.#display = value;
  }
  /**
   * @type {boolean}
   */
  get isScreenBeingShared() {
    return !!this.stream?.active;
  }
  /**
   * @readonly
   * @type {MediaStream}
   */
  get stream() {
    return this.#stream;
  }
  /**
   * @method
   * @returns {Promise<void>}
   */
  async startSharing() {
    if (this.stream?.active) {
      throw(new Error('You are already sharing your screen.'));
    }
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'window'
      },
      audio: true
    });
    this.#stream = mediaStream;
    // ------------------------------------------------
    // The "ended" event fires on tracks when the
    // screen share is stopped using the navigator UI
    // ------------------------------------------------
    this.stream.getTracks().forEach((track, _index, mediaStreamTracks) => {
      track.onended = () => {
        const allTracksEnded = mediaStreamTracks.every(({ readyState }) => {
          return readyState === 'ended';
        });
        if (!allTracksEnded) {
          return;
        }
        this.#hideLocalScreen();
        this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE_END, {
          detail: {
            mediaStreamID: this.stream.id
          }
        });
      }
    });
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {Promise<void>}
   */
  async publishScreen(connections) {
    if (!this.stream?.active) {
      return;
    }
    connections.forEach((connection) => {
      this.stream.getTracks().forEach((track) => {
        if (!this.#senders.has(connection)) {
          this.#senders.set(connection, new Set());
        }
        const sender = connection.addTrack(track, this.stream);
        this.#senders.get(connection).add(sender);
      });
    });
    this.#showLocalScreen();
    await wait.forMilliseconds(100); // Give "track" event time to fire on the remote connection (before dispatching the screenshare event)
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE, {
      detail: {
        mediaStreamID: this.stream.id
      }
    });
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  stopSharing(connections) {
    this.stream.getTracks().forEach((track) => {
      // -----------------------------------------------------
      // This sets the track's readyState property to "ended"
      // but will NOT fire it's "ended" event.
      // -----------------------------------------------------
      track.stop();
    });
    // ------------------------------------------------------
    // Since the tracks are all stopped by this point
    // this is not strictly necessary (it won't affect
    // anything in the UI) but should free up some memory?
    //
    // It will also result in a "removetrack" event firing
    // on the remote MediaStream (although we are not using
    // that event for anything).
    // ------------------------------------------------------
    connections.forEach((connection) => {
      if (!this.#senders.has(connection)) {
        return;
      }
      this.#senders.get(connection).forEach((sender) => {
        connection.removeTrack(sender);
      });
    });
    this.#hideLocalScreen();
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE_END, {
      detail: {
        mediaStreamID: this.stream.id
      }
    });
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #showLocalScreen() {
    if (!this.stream?.active || !this.display) {
      return;
    }
    this.display.srcObject = this.stream;
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #hideLocalScreen() {
    if (!this.display) {
      return;
    }
    this.display.srcObject = null;
  }
}

export { ScreenShareService };