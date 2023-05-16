import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';

/**
 * @mixes SendCustomEvent
 */
class UserMediaService extends sendCustomEventMixin() {
  #audioStream;
  #senders = new Map();
  #videoStream;
  constructor() {
    super();
  }
  /**
   * @static
   * @readonly
   * @type {Object.<string, string>}
   */
  static get EventDict() {
    return {
      MEDIA_STREAM_TRACK_ENABLE: this.#createEventTypeWithNamespace('mediastreamtrackenable'),
      MEDIA_STREAM_TRACK_DISABLE: this.#createEventTypeWithNamespace('mediastreamtrackdisable'),
      MEDIA_STREAM_TRACKS_DISABLE: this.#createEventTypeWithNamespace('mediastreamtracksdisable')
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
   * @reaodnly
   * @type {MediaStream}
   */
  get audioStream() {
    return this.#audioStream;
  }
  /**
   * @readonly
   * @type {MediaStreamTrack[]}
   */
  get enabledTracks() {
    return [
      this.#audioTrack,
      this.#videoTrack
    ].filter((track) => {
      return track && track.enabled;
    });
  }
  /**
   * @readonly
   * @type {MediaStream}
   */
  get videoStream() {
    return this.#videoStream;
  }
  /**
   * @private
   * @readonly
   * @type {MediaStreamTrack}
   */
  get #audioTrack() {
    return this.audioStream?.getTracks()[0];
  }
  /**
   * @private
   * @readonly
   * @type {MediaStream[]}
   */
  get #streams() {
    return [
      this.audioStream,
      this.videoStream
    ].filter((stream) => {
      return stream;
    })
  }
  /**
   * @private
   * @readonly
   * @type {MediaStreamTrack}
   */
  get #videoTrack() {
    return this.#videoStream?.getTracks()[0];
  }
  /**
   * @method
   * @returns {Promise<void>}
   */
  async connectCamera() {
    if (!this.#videoStream) {
      this.#videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    this.#enableTrack(this.videoStream.getTracks()[0]);
  }
  /**
   * @method
   * @returns {Promise<void>}
   */
  async connectMicrophone() {
    if (!this.audioStream) {
      this.#audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    this.#enableTrack(this.audioStream.getTracks()[0]);
  }
  /**
   * @method
   * @returns {void}
   */
  disableCamera() {
    this.#disableTrack(this.#videoTrack, this.videoStream);
  }
  /**
   * @method
   * @returns {void}
   */
  disableMicrophone() {
    this.#disableTrack(this.#audioTrack, this.audioStream);
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  disconnectCamera(connections) {
    connections.forEach((connection) => {
      if (!this.#senders.has(connection)) {
        return;
      }
      this.#senders.get(connection).forEach((sender) => {
        const { kind: trackType } = sender.track;
        if (trackType !== 'video') {
          return;
        }
        connection.removeTrack(sender);
      });
    });
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  disconnectMicrophone(connections) {
    connections.forEach((connection) => {
      if (!this.#senders.has(connection)) {
        return;
      }
      this.#senders.get(connection).forEach((sender) => {
        const { kind: trackType } = sender.track;
        if (trackType !== 'audio') {
          return;
        }
        connection.removeTrack(sender);
      });
    });
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  publishCamera(connections) {
    if (!this.videoStream?.active) {
      return;
    }

    this.#publishTrack(this.#videoTrack, this.videoStream, connections);
  }
  /**
   * @method
   * @param {RTCPeerConnection[]} connections
   * @returns {void}
   */
  publishMicrophone(connections) {
    if (!this.audioStream?.active) {
      return;
    }

    this.#publishTrack(this.#audioTrack, this.audioStream, connections);
  }
  /**
   * @private
   * @method
   * @param {MediaStreamTrack} track
   * @param {MediaStream} stream
   * @param {RTCPeerConnection} connection
   * @returns {void}
   */
  #addTrackToConnection(track, stream, connection) {
    if (!this.#senders.has(connection)) {
      this.#senders.set(connection, new Set());
    }
    const isTrackAlreadyAddedToConnection = connection.getSenders().some((sender) => {
      return sender.track?.id === track.id;
    });
    if (isTrackAlreadyAddedToConnection) {
      return;
    }
    const sender = connection.addTrack(track, stream);
    this.#senders.get(connection).add(sender);
  }
  /**
   * @private
   * @method
   * @param {MediaStreamTrack} track
   * @param {MediaStream} stream
   * @returns {void}
   */
  #disableTrack(track, stream) {
    track.enabled = false;
    if (!this.enabledTracks.length) {
      this.sendCustomEvent(this.constructor.EventDict.MEDIA_STREAM_TRACKS_DISABLE, {
        detail: {
          mediaStreams: this.#streams
        }
      });
    }
    this.sendCustomEvent(this.constructor.EventDict.MEDIA_STREAM_TRACK_DISABLE, {
      detail: {
        stream: stream,
        track: track
      }
    });
  }
  /**
   * @private
   * @method
   * @param {MediaStreamTrack} track
   * @returns {void}
   */
  #enableTrack(track) {
    track.enabled = true;
  }
  /**
   * @private
   * @method
   * @param {MediaStreamTrack} track
   * @param {MediaStream} stream
   * @param {RTCPeerConnection[]} connections
   * @returns {Promise<void>}
   */
  async #publishTrack(track, stream, connections) {
    connections.forEach((connection) => {
      this.#addTrackToConnection(track, stream, connection);
    });

    // ==================================================================
    // We need the "track" event to fire on the remote connection before
    // we dispatch the mediastreamtrackenable event (and send that
    // information to the remote connection via data channel message).
    // ------------------------------------------------------------------
    // The "track" event fires on the remote connection when we call
    // addTrack() on this connection (see #addTrackToConnection) but
    // it takes a few milliseconds since it is sent via the network.
    // ==================================================================
    await wait.forMilliseconds(250); // 10 seems to be enough, 5 is too low (so 250 should be safe)

    if (track.enabled) {
      this.sendCustomEvent(this.constructor.EventDict.MEDIA_STREAM_TRACK_ENABLE, {
        detail: {
          stream: stream,
          track: track
        }
      });
    }
  }
}

export { UserMediaService };
