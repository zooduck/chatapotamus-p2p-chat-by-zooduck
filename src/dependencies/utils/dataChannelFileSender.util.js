import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';

/**
 * @mixes SendCustomEvent
 */
class DataChannelFileSender extends sendCustomEventMixin() {
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
      FILE_CHUNK_SEND: this.#createEventTypeWithNamespace('filechunksend')
    };
  }
  get EventDict() {
    return this.constructor.EventDict;
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
   * @method
   * @param {File} file
   * @param {RTCDataChannel} channel
   * @returns {Promise<void>}
   */
  async send(file, channel) {
    if (!file instanceof File) {
      return Promise.reject(new Error(`${channel} is not a valid File.`));
    }

    if (!channel instanceof RTCDataChannel) {
      return Promise.reject(new Error(`${channel} is not a valid RTCDataChannel.`));
    }

    const blob = new Blob([file]);
    const arrayBuffer = await blob.arrayBuffer();

    const totalBytes = arrayBuffer.byteLength;
    const fileChunks = []; // 16kiB (or less) chunks: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels#understanding_message_size_limits
    let currentByteLength = totalBytes;
    let bytePosition = 0;

    while (currentByteLength > 0) {
      if (currentByteLength / 16000 >= 1) {
        currentByteLength -= 16000;
        fileChunks.push(arrayBuffer.slice(bytePosition, bytePosition + 16000));
        bytePosition += 16000;
      } else {
        fileChunks.push(arrayBuffer.slice(bytePosition));
        currentByteLength = 0;
      }
    }

    let count = 0;
    let bytesSent = 0;

    for (const chunk of fileChunks) {
      try {
        channel.send(chunk);
      } catch (error) {
        console.warn(error);
        await wait.forMilliseconds(250);
        try {
          channel.send(chunk);
        } catch (error) {
          console.warn(error);
          await wait.forMilliseconds(500);
          channel.send(chunk);
        }
      }

      bytesSent += chunk.byteLength;

      this.sendCustomEvent(this.EventDict.FILE_CHUNK_SEND, {
        detail: {
          bytesSent: bytesSent,
          totalBytes: totalBytes
        }
      });

      count += 1;

      if (count === 100) {
        // ---------------------------------------------------------------------------------------------------------
        // To prevent the error: "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel send queue is full"
        // we need to break down the send calls into smaller groups of calls (100 x 16KiB calls at a time).
        // ---------------------------------------------------------------------------------------------------------
        // Note: Since the count here is an arbitrary figure (a compromise between transfer speed and send queue
        // limitations) I have added the try catch blocks higher up to ensure that most file transfers will succeed.
        // ---------------------------------------------------------------------------------------------------------
        await wait.forMilliseconds(100);
        count = 0;
      }
    }

    channel.send(new ArrayBuffer(0)); // Signal EOF
  }
}

const dataChannelFileSender = new DataChannelFileSender();

export { dataChannelFileSender };
