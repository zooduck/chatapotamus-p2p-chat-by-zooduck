import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';
class UserMediaService extends sendCustomEventMixin() {
  #audioStream;
  #senders = new Map();
  #videoStream;
  constructor() {
    super();
  }
  static get EventDict() {
    return {
      MEDIA_STREAM_TRACK_ENABLE: this.#createEventTypeWithNamespace('mediastreamtrackenable'),
      MEDIA_STREAM_TRACK_DISABLE: this.#createEventTypeWithNamespace('mediastreamtrackdisable'),
      MEDIA_STREAM_TRACKS_DISABLE: this.#createEventTypeWithNamespace('mediastreamtracksdisable')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }
  get audioStream() {
    return this.#audioStream;
  }
  get enabledTracks() {
    return [
      this.#audioTrack,
      this.#videoTrack
    ].filter((track) => {
      return track && track.enabled;
    });
  }
  get videoStream() {
    return this.#videoStream;
  }
  get #audioTrack() {
    return this.audioStream?.getTracks()[0];
  }
  get #streams() {
    return [
      this.audioStream,
      this.videoStream
    ].filter((stream) => {
      return stream;
    })
  }
  get #videoTrack() {
    return this.#videoStream?.getTracks()[0];
  }
  async connectCamera() {
    if (!this.#videoStream) {
      this.#videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    this.#enableTrack(this.videoStream.getTracks()[0]);
  }
  async connectMicrophone() {
    if (!this.audioStream) {
      this.#audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    this.#enableTrack(this.audioStream.getTracks()[0]);
  }
  disableCamera() {
    this.#disableTrack(this.#videoTrack, this.videoStream);
  }
  disableMicrophone() {
    this.#disableTrack(this.#audioTrack, this.audioStream);
  }
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
  publishCamera(connections) {
    if (!this.videoStream?.active) {
      return;
    }
    this.#publishTrack(this.#videoTrack, this.videoStream, connections);
  }
  publishMicrophone(connections) {
    if (!this.audioStream?.active) {
      return;
    }
    this.#publishTrack(this.#audioTrack, this.audioStream, connections);
  }
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
  #enableTrack(track) {
    track.enabled = true;
  }
  async #publishTrack(track, stream, connections) {
    connections.forEach((connection) => {
      this.#addTrackToConnection(track, stream, connection);
    });
    await wait.forMilliseconds(250);
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