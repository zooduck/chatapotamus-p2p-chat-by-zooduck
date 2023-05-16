import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { getEmojiNameFromRenderedEmoji, SINGLE_UNICODE_EMOJI_REGEX, UNICODE_EMOJI_REGEX } from '../../../utils/emojify/index.js';
function parseChatMessageForDOM({ message, fromID, origin, messageType, unix }) {
  const isoDate = new Date(unix).toISOString();
  const hoursMinutesSeconds = isoDate.match(/T([0-9:]+)/)?.[1];
  const yearMonthDay = isoDate.match(/\d{4}-\d{2}-\d{2}/)[0];
  if (messageType === 'info') {
    return new SafeDOMParser().parseFromString`
      <p class="message message--info">${hoursMinutesSeconds}: ${message}</p>
    `;
  }
  const isSingleEmoji = SINGLE_UNICODE_EMOJI_REGEX.test(message);
  let messageBubbleMessageClass = isSingleEmoji
    ? 'message-bubble__message message-bubble__message--single-emoji'
    : 'message-bubble__message';
  if (messageType === 'fileNotFound') {
    messageBubbleMessageClass += ' message-bubble__message--file-not-found';
  }
  const messageBubbleMessageElement = new SafeDOMParser().parseFromString`
    <p class="${messageBubbleMessageClass}">${message}</p>
  `;
  messageBubbleMessageElement.innerHTML = messageBubbleMessageElement.innerHTML.replace(UNICODE_EMOJI_REGEX, (renderedEmoji) => {
    return `<span class="message-bubble__emoji" title="${getEmojiNameFromRenderedEmoji(renderedEmoji)}">${renderedEmoji}</span>`;
  });
  return new SafeDOMParser().parseFromString`
    <section class="message message--${origin}">
      <section class="message-bubble">
        <h2 class="message-bubble__title">${fromID}</h2>
        <p class="message-bubble__hours-minutes-seconds">${yearMonthDay} ${hoursMinutesSeconds}</p>
        ${messageBubbleMessageElement}
      </section>
    </section>
  `;
};
export { parseChatMessageForDOM };