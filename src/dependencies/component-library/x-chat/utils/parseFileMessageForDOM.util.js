/**
 * @typedef {import('./typedef.js')}
 */

import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';

/**
 * @method
 * @param {FileData} data
 */
const parseFileMessageForDOM = ({ dataURL, fromID, file, mediaElementID, origin, unix, } = {}) => {
  const isoDate = new Date(unix).toISOString();
  const hoursMinutesSeconds = isoDate.match(/T([0-9:]+)/)?.[1];
  const yearMonthDay = isoDate.match(/\d{4}-\d{2}-\d{2}/)[0];

  const { name, size, type } = file;
  const megaBytes = (size / 1024 / 1024).toFixed(2) + ' MB';
  let mediaElement;

  if (/image/.test(type)) {
    mediaElement = new SafeDOMParser().parseFromString`
      <figure>
        <img src="${dataURL}" id="${mediaElementID}" />
        <figcaption class="message-bubble__media-caption">
          <span class="message-bubble__media-caption-filename">${name}</span>
          <span class="message-bubble__media-caption-file-size">${megaBytes}</span>
        </figcaption>
      </figure>
    `;
  } else if (/video/.test(type)) {
    mediaElement = new SafeDOMParser().parseFromString`
      <figure>
        <video controls [muted]=${true} src="${dataURL}" id="${mediaElementID}"></video>
        <figcaption class="message-bubble__media-caption">
          <span class="message-bubble__media-caption-filename">${name}</span>
          <span class="message-bubble__media-caption-file-size">${megaBytes}</span>
        </figcaption>
      </figure>
    `;
  } else if (/audio/.test(type)) {
    mediaElement = new SafeDOMParser().parseFromString`
      <figure>
        <audio controls [muted]=${true} src="${dataURL}" id="${mediaElementID}"></audio>
        <figcaption class="message-bubble__media-caption">
          <span class="message-bubble__media-caption-filename">${name}</span>
          <span class="message-bubble__media-caption-file-size">${megaBytes}</span>
        </figcaption>
      </figure>
    `;
  } else {
    // -------------------------------------------------------------
    // Not adding a mediaElementID to the anchor tag is deliberate.
    // (The id is used to add load and loadeddata event listeners
    // to delay updating the scroll position of the chat until the
    // image / audio / video has loaded).
    // -------------------------------------------------------------
    mediaElement = new SafeDOMParser().parseFromString`
      <section class="message-bubble__hyperlink-section">
        <a class="message-bubble__hyperlink-section-hyperlink" href="${dataURL}" download="${name}">${name}</a>
        <span class="message-bubble__hyperlink-section-file-size">${megaBytes}</span>
      </section>
    `;
  }

  return new SafeDOMParser().parseFromString`
    <section class="message message--${origin}">
      <section class="message-bubble">
        <h2 class="message-bubble__title">${fromID}</h2>
        <p class="message-bubble__hours-minutes-seconds">${yearMonthDay} ${hoursMinutesSeconds}</p>
        ${mediaElement}
      </section>
    </section>
  `;
};

export { parseFileMessageForDOM };
