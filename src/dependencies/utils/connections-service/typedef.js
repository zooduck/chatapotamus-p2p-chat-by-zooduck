/**
 * @typedef {Object} ConnectionData
 * @property {RTCDataChannel} channel
 * @property {RTCPeerConnection} connection
 * @property {MediaStream[]} incomingMediaStreams
 * @property {'local'|'remote'} type
 */

/**
 * @typedef {Object} ArrayBufferMessageFileData
 * @property {{name: string, size: number, type: string}} file
 * @property {ArrayBuffer[]} fileChunks
 * @property {string} fromID
 * @property {string} toID
 * @property {number} unix
 */
