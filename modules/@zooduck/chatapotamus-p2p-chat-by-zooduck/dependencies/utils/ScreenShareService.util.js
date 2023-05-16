import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';
class ScreenShareService extends sendCustomEventMixin() {
  #senders;
  #display;
  #stream;
  constructor() {
    super();
    this.#senders = new Map();
  }
  static get EventDict() {
    return {
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
  get isScreenBeingShared() {
    return !!this.stream?.active;
  }
  get stream() {
    return this.#stream;
  }
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
    await wait.forMilliseconds(100);
    this.sendCustomEvent(this.constructor.EventDict.SCREEN_SHARE, {
      detail: {
        mediaStreamID: this.stream.id
      }
    });
  }
  stopSharing(connections) {
    this.stream.getTracks().forEach((track) => {
      track.stop();
    });
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
  #showLocalScreen() {
    if (!this.stream?.active || !this.display) {
      return;
    }
    this.display.srcObject = this.stream;
  }
  #hideLocalScreen() {
    if (!this.display) {
      return;
    }
    this.display.srcObject = null;
  }
}
export { ScreenShareService };