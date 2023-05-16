/**
 * @typedef {Object} MessageData
 * @property {string} fromID
 * @property {string} message
 * @property {'fileNotFound'|'info'|'message'} messageType
 * @property {'local'|'remote'} origin
 * @property {string} toID
 * @property {'text'} type
 * @property {number} unix
 */

/**
 * @typedef {Object} FileData
 * @property {URL} dataURL
 * @property {string} fromID
 * @property {{name: string, size: number, type: string}} file
 * @property {string} origin
 * @property {string} toID
 * @property {'file'} type
 * @property {number} unix
 */