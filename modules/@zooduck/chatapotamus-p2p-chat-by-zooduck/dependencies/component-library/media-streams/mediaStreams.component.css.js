export default `
:host {
  display: block;
}
main {
  display: flex;
  flex-direction: column;
  gap: var(--gap-size-medium);
  height: 100%;
  overflow: hidden;
  padding: var(--padding-size-medium);
}
.media-streams-heading {
  display: flex;
  font-size: var(--font-size-medium);
  gap: var(--gap-size-medium);
  justify-content: space-between;
  overflow: hidden;
  padding: 0;
}
.media-streams-heading__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.media-streams-heading__media-streams-count:not(:empty)::before {
  content: '(';
}
.media-streams-heading__media-streams-count:not(:empty)::after {
  content: ')';
}
.media-streams {
  height: 100%;
  min-height: 24px;
  overflow: hidden;
}
.media-streams__items {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  row-gap: var(--gap-size-medium);
  width: 100%;
}
.media-stream {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  width: 100%;
}
.media-stream__video {
  background-color: var(--color-gray-800);
  border: var(--media-streams-video-border, none);
  visibility: hidden;
  width: 100%;
}
.media-stream__video--canplay {
  visibility: visible;
}
.media-stream__video::-webkit-media-controls-enclosure {
  display: none !important;
}
.media-stream__sender-id-and-audio-toggle-button {
  align-items: center;
  display: flex;
  gap: var(--gap-size-medium);
  justify-content: space-between;
}
.media-stream__sender-id {
  overflow: hidden;
  text-indent: var(--margin-size-small);
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media screen and (max-width: 767.9px) {
  .media-stream__video {
    aspect-ratio: 6 / 13;
  }
}
@media screen and (min-width: 768px) {
  .media-stream__video {
    aspect-ratio: 4 / 3;
  }
}
@media screen and (orientation: landscape) and (min-aspect-ratio: 16 / 9) and (max-width: 1280px) {
  .media-stream__video {
    aspect-ratio: 13 / 6;
  }
}
`;