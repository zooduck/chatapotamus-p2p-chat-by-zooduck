export default `
:host {
  --_background-color: var(--x-chat-background-color, var(--color-gray-800));
  --_color: var(--x-chat-color, var(--color-white));
  --_call-to-action-active-brightness: var(--x-chat-call-to-action-active-brightness, 1.2);
  --_call-to-action-color: var(--x-chat-call-to-action-color, var(--color-white));
  --_call-to-action-background-color: var(--x-chat-call-to-action-background-color, var(--color-gray-700));
  --_message-bubble-background-color: var(--x-chat-message-bubble-background-color, var(--color-gray-700));
  --_message-bubble-border-color: var(--x-chat-message-bubble-border-color, transparent);
  --_message-bubble-message-background-color: var(--x-chat-message-bubble-message-background-color, hsl(0, 0%, 25%));
  --_message-bubble-title-color: var(--x-chat-message-bubble-title-color, var(--color-purple-navy-300));
  display: block;
  width: 100%;
}
#root {
  background-color: var(--_background-color);
  color: var(--_color);
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  overflow: hidden;
  position: relative;
  user-select: text;
}
.empty-chat-placeholder {
  padding: var(--padding-size-medium);
}
.empty-chat-placeholder--hidden {
  display: none;
}
.header {
  align-items: center;
  border: solid var(--border-width) var(--_color);
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 45%);
  display: flex;
  gap: var(--gap-size-medium);
  overflow: hidden;
  position: relative;
  z-index: var(--z-index-normal);
}
.header--hidden {
  display: none;
}
.header__remote-handle {
  flex-grow: 1;
  font-size: var(--font-size-large);
  overflow: hidden;
  padding: var(--padding-size-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: var(--z-index-normal);
}
.header__remote-handle:empty {
  display: none;
}
.header__call-to-action {
  --x-button-active-brightness: var(--_call-to-action-active-brightness);
  --x-button-background-color: var(--_call-to-action-background-color);
  --x-button-color: var(--_call-to-action-color);
  flex-shrink: 0;
  font-size: var(--font-size-small);
  height: 100%;
}
.header__call-to-action:empty {
  display: none;
}
.messages {
  height: 100%;
  overflow-x: hidden !important;
  overflow-y: auto;
  padding: var(--padding-size-medium);
  position: relative;
}
.messages:focus {
  outline: dotted 2px var(--color-white);
  outline-offset: -2px;
}
.message {
  align-items: center;
  display: flex;
  margin-top: var(--margin-size-medium);
}
.message--info {
  filter: contrast(0.6);
  font-size: var(--font-size-small);
}
.message--local:not(.message--no-animate) {
  animation: slide-in-from-left var(--animation-speed-fast) var(--animation-speed-fast) both;
}
.message--remote {
  flex-direction: row-reverse;
}
.message--remote:not(.message--no-animate) {
  animation: slide-in-from-right var(--animation-speed-fast) var(--animation-speed-fast) both;
}
.message-bubble {
  background-color: var(--_message-bubble-background-color);
  outline: solid var(--border-width) var(--_message-bubble-border-color);
  display: flex;
  flex-direction: column;
  max-width: 80%;
  padding: var(--padding-size-medium);
}
.message-bubble__title {
  color: var(--_message-bubble-title-color);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-normal);
  max-width: 100%;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.message-bubble__hours-minutes-seconds {
  font-size: var(--font-size-small);
}
.message-bubble__message {
  background-color: var(--_message-bubble-message-background-color);
  margin: 0;
  padding: var(--padding-size-medium);
  white-space: break-spaces;
  word-wrap: break-word;
}
.message-bubble__media-caption {
  display: flex;
  font-size: var(--font-size-small);
  justify-content: space-between;
  margin-top: var(--margin-size-x-small);
}
.message-bubble__media-caption-filename {
  overflow: hidden;
  text-overflow: ellipsis;
}
.message-bubble__media-caption-file-size {
  white-space: nowrap;
}
.message-bubble__hyperlink-section {
  align-items: center;
  background-color: var(--_message-bubble-message-background-color);
  display: flex;
  padding: var(--padding-size-medium);
}
.message-bubble__hyperlink-section-hyperlink {
  color: var(--_color);
}
.message-bubble__hyperlink-section-file-size {
  white-space: nowrap;
}
.message-bubble__message--single-emoji {
  font-size: var(--font-size-xx-large);
}
.message-bubble__message--file-not-found {
  text-decoration: line-through;
}
.message-bubble__emoji {
  font-family: var(--font-family-emoji);
}
.new-messages-button {
  bottom: 0;
  display: none;
  position: absolute;
  right: 0;
  z-index: var(--z-index-normal);
}
.new-messages-button--visible {
  display: block;
}
@keyframes slide-in-from-right {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes slide-in-from-left {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
`;