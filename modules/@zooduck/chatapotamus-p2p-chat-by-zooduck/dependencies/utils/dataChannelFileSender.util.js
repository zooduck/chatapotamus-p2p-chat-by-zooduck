import { sendCustomEventMixin } from '../../modules/@zooduck/send-custom-event-mixin/dist/index.module.js';
import { wait } from './wait.util.js';
class DataChannelFileSender extends sendCustomEventMixin() {
  constructor() {
    super();
  }
  static get EventDict() {
    return {
      FILE_CHUNK_SEND: this.#createEventTypeWithNamespace('filechunksend')
    };
  }
  get EventDict() {
    return this.constructor.EventDict;
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.name.toLowerCase() + eventType;
  }
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
    const fileChunks = [];
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
        await wait.forMilliseconds(100);
        count = 0;
      }
    }
    channel.send(new ArrayBuffer(0));
  }
}
const dataChannelFileSender = new DataChannelFileSender();
export { dataChannelFileSender };