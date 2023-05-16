export default `
:host {
  --_background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-primary, var(--color-purple-navy-500));
  --_border-color: var(--_color);
  --_breakpoint-mobile: 767px;
  --_color: var(--color-white);
  --_info-bar-background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-secondary, var(--color-purple-navy-600));
  --_input-background-color: var(--color-gray-800);
  --_input-color: var(--_color);
  --_input-outline-color: transparent;
  --_input-placeholder-color: rgba(255, 255, 255, 0.5);
  --_local-media-stream-display-width-desktop: 180px;
  --_min-height: 550px;
  --_slide-in-height-clearance: 120px;
  --emoji-tray-background-color: var(--color-gray-800);
  --file-transfer-progress-color: var(--_color);
  --media-streams-video-border: var(--_extended-borders-border, none);
  --x-button-active-brightness: 1.2;
  --x-button-background-color: var(--_background-color);
  --x-button-color: var(--_color);
  --x-chat-call-to-action-background-color: var(--_background-color);
  --x-chat-call-to-action-color: var(--_color);
  --x-details-color: var(--_color);
  --x-loading-color: var(--_color);
  --x-progress-color: var(--_color);
  background-color: var(--_background-color);
  color: var(--_color);
  display: block;
  font-family: var(--font-family-base);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-normal);
  height: var(--_min-height);
  overflow: auto;
  width: 100%;
}
@media (prefers-color-scheme: light) {
  :host(:not([force-dark-mode])) {
    --_background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-primary, var(--color-purple-navy-100));
    --_color: var(--color-black);
    --_info-bar-background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-secondary, var(--color-purple-navy-50));
    --_input-background-color: var(--color-white);
    --_input-outline-color: var(--_color);
    --_input-placeholder-color: rgba(0, 0, 0, 50%);
    --emoji-tray-background-color: var(--color-white);
    --input-text-outline-color: var(--color-black);
    --x-button-active-brightness: 0.9;
    --x-chat-background-color: var(--color-white);
    --x-chat-color: var(--color-black);
    --x-chat-message-bubble-background-color: var(--color-white);
    --x-chat-message-bubble-border-color: var(--color-black);
    --x-chat-message-bubble-message-background-color: var(--color-gray-50);
    --x-chat-message-bubble-title-color: var(--color-purple-navy-500);
  }
}
:host([force-light-mode]) {
  --_background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-primary, var(--color-purple-navy-100));
  --_color: var(--color-black);
  --_info-bar-background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-secondary, var(--color-purple-navy-50));
  --_input-background-color: var(--color-white);
  --_input-outline-color: var(--_color);
  --_input-placeholder-color: rgba(0, 0, 0, 0.5);
  --emoji-tray-background-color: var(--color-white);
  --input-text-outline-color: var(--color-black);
  --x-button-active-brightness: 0.9;
  --x-chat-background-color: var(--color-white);
  --x-chat-color: var(--color-black);
  --x-chat-message-bubble-background-color: var(--color-white);
  --x-chat-message-bubble-border-color: var(--color-black);
  --x-chat-message-bubble-message-background-color: var(--color-gray-50);
  --x-chat-message-bubble-title-color: var(--color-purple-navy-500);
}
:host([use-extended-borders]) {
  --_extended-borders-border-style: solid;
  --_extended-borders-border-width: var(--border-width);
  --_extended-borders-border: var(--_extended-borders-border-style) var(--_extended-borders-border-width);
  --_input-outline-color: var(--_color);
}
#root {
  display: grid;
  grid-template-rows: repeat(2, auto) 1fr;
  height: 100%;
  margin: 0 auto;
  position: relative;
  user-select: none;
}
link-to-element {
  font-weight: var(--font-weight-normal);
}
.code-snippet {
  background-color: var(--color-alice-blue);
  color: var(--color-gray-900);
  font-size: var(--font-size-small);
  margin: 0;
  overflow: auto;
  padding: var(--padding-size-medium);
}
.interface {
  color: var(--color-brink-pink);
}
.variable {
  color: var(--color-blue-500);
}
.form-type-1 {
  display: grid;
  gap: var(--gap-size-small);
  grid-template-columns: 1fr 120px;
  grid-template-rows: auto 1fr;
}
.form-type-1__label {
  grid-column: 1 / span 2;
}
.info-bar {
  --x-button-background-color: var(--_info-bar-background-color);
  background-color: var(--_info-bar-background-color);
  border: var(--_extended-borders-border, none);
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(2, auto);
  min-height: 40px;
  overflow: hidden;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: var(--z-index-important);
}
.info-bar__title {
  font-size: var(--font-size-medium);
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-bar__title:not(:empty) {
  padding: var(--padding-size-medium);
}
.info-bar__handle {
  user-select: text;
}
.info-bar__handle:empty {
  display: none;
}
.info-bar__handle:not(:empty) ~ .info-bar__handle-placeholder {
  display: none;
}
.info-bar__cta-buttons {
  display: flex;
  flex-wrap: nowrap;
}
.info-bar__toggle-forms-ui-button,
.info-bar__toggle-api-docs-button {
  flex-shrink: 0;
}
.info-bar__row-2 {
  align-items: center;
  border-top: var(--_extended-borders-border-style) var(--_extended-borders-border-width);
  display: flex;
  gap: var(--gap-size-medium);
  grid-column: 1 / span 2;
  justify-content: end;
  padding: var(--padding-size-x-small) var(--padding-size-medium);
}
.info-bar__network-info {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  font-size: var(--font-size-small);
  gap: var(--gap-size-medium);
  grid-column: 1 / span 3;
  grid-row: 2;
}
.info-bar__nat-type {
  text-transform: capitalize;
}
.info-bar__nat-type::before {
  content: 'NAT: ';
}
.info-bar__nat-type:empty::before {
  content: 'NAT: ...';
}
.info-bar__ice-gathering-time::before {
  content: 'ICE G-TIME: ';
}
.info-bar__ice-gathering-time:empty::before {
  content: 'ICE G-TIME: ...';
}
.info-bar__connecting-info {
  align-items: center;
  display: none;
  font-size: var(--font-size-small);
  gap: var(--gap-size-small);
  overflow: hidden;
}
.info-bar__connecting-info--visible {
  display: flex;
}
.info-bar__connecting-info-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-bar__connecting-info-label:is(:empty)::before {
  content: 'Establishing P2P Connection';
}
.info-bar__file-transfer-progress {
  font-size: var(--font-size-small);
}
.api-docs,
.forms-ui {
  max-height: calc(var(--_min-height) - var(--_slide-in-max-height-clearance));
  overflow: auto;
  user-select: text;
}
.forms-ui {
  background-color: var(--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-primary, var(--_background-color));
  border: var(--_extended-borders-border, none);
  border-top: none;
  color: var(--_color);
  display: grid;
  gap: var(--gap-size-medium);
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto 1fr;
  padding: var(--padding-size-medium);
}
.forms-ui__set-handle-form {
  border: solid var(--border-width) var(--_border-color);
  grid-column: 1 / span 2;
  padding: var(--padding-size-medium);
}
.forms-ui__set-handle-form ~ * {
  filter: opacity(0.2);
  pointer-events: none;
  user-select: none;
}
.forms-ui__input {
  --input-text-background-color: var(--_input-background-color);
  --input-text-color: var(--_input-color);
  --input-text-outline-color: var(--_input-outline-color);
  --input-text-placeholder-color: var(--_input-placeholder-color);
}
.forms-ui__sdp-forms-section {
  border: solid var(--border-width) var(--_border-color);
  display: grid;
  grid-template-rows: auto 1fr;
  row-gap: var(--gap-size-medium);
  padding: var(--padding-size-medium);
}
.forms-ui__sdp-forms-section-title {
  padding: 0;
}
.api-docs {
  background-color: var(--color-white);
  color: var(--color-black);
  display: flex;
  flex-direction: column;
  gap: var(--gap-size-medium);
  padding: var(--padding-size-medium);
  user-select: text;
}
.api-docs ul {
  list-style-type: circle;
}
.api-docs-event-type {
  font-weight: var(--font-weight-bold);
}
.api-docs-note,
.api-docs-warning {
  border: dashed 2px;
  padding: var(--padding-size-medium);
}
.api-docs-note::before {
  content: 'Note: ';
}
.api-docs-warning {
  color: var(--color-danger-red);
  font-weight: var(--font-weight-bold);
}
.api-docs__subcategory {
  border: solid var(--border-width) var(--color-black);
  padding: var(--padding-size-medium);
}
.api-docs__subcategory-title {
  background-color: var(--color-gray-100);
  margin-bottom: var(--margin-size-medium);
  padding: var(--padding-size-medium);
}
.api-docs__subcategory-item-name {
  border: solid var(--border-width) var(--color-black);
  overflow: hidden;
  padding: var(--padding-size-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content {
  border: var(--_extended-borders-border, none);
  border-top-width: 0;
  display: grid;
  gap: var(--gap-size-medium);
  grid-template-columns: var(--_local-media-stream-display-width-desktop) 1fr auto;
  grid-template-rows: auto 1fr auto;
  overflow: auto;
  padding: var(--padding-size-medium);
}
.local-media-streams,
.local-media-streams__controls {
  display: flex;
  flex-direction: column;
  gap: var(--gap-size-medium);
}
.local-media-streams__camera-controls {
  display: grid;
  gap: var(--gap-size-medium);
  grid-template-columns: 1fr auto;
}
.local-media-streams__display {
  aspect-ratio: 4 / 3;
  background-color: var(--color-gray-800);
  border: var(--_extended-borders-border, none);
}
.local-media-streams__display::-webkit-media-controls-enclosure {
  display: none !important;
}
.local-media-streams__screen-share-form {
  display: grid;
}
.handles {
  border: solid var(--border-width) var(--_border-color);
  display: grid;
  grid-column: 1;
  grid-row: 2;
  grid-template-rows: auto 1fr;
  min-height: 140px;
  overflow: hidden;
  padding: 0 var(--padding-size-medium) var(--padding-size-medium) var(--padding-size-medium);
}
.handles-heading {
  display: flex;
  font-size: var(--font-size-medium);
  gap: var(--gap-size-medium);
  justify-content: space-between;
  overflow: hidden;
}
.handles-heading__client-count:not(:empty)::before {
  content: '(';
}
.handles-heading__client-count:not(:empty)::after {
  content: ')';
}
.handles-heading__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.handles__list {
  height: 100%;
  list-style: none;
  margin: 0;
  overflow: auto;
  padding: 0;
  width: 100%;
}
.handles__list-item {
  align-items: center;
  border: solid var(--border-width) transparent;
  display: flex;
}
.handles__list-item--active {
  border-color: var(--_color);
}
.handles__list-item--active::before {
  align-self: stretch;
  background-color: var(--_color);
  content: '';
  display: block;
  width: 18px;
}
.handles__list-item-select-handle-button {
  --x-button-active-brightness: 1;
  flex-grow: 1;
  max-width: 100%;
  overflow: hidden;
}
.handles__list-item-new-messages-counter:not(:empty)::before {
  content: '('
}
.handles__list-item-new-messages-counter:not(:empty)::after {
  content: ')'
}
.attrition {
  font-size: var(--font-size-x-small);
  grid-row: 3;
}
.main-ui {
  display: grid;
  grid-row: 1 / span 3;
  grid-template-rows: 1fr auto;
  height: 100%;
  overflow: hidden;
  row-gap: var(--gap-size-medium);
}
.main-ui__chat-messages {
  border: var(--_extended-borders-border, none);
  height: 100%;
  overflow: hidden;
  user-select: text;
}
.main-ui__chat-message-form {
  display: flex;
}
.main-ui__chat-message-form-label {
  display: block;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  width: 0;
}
.main-ui__chat-message-form-input {
  --input-text-background-color: var(--_input-background-color);
  --input-text-color: var(--_input-color);
  --input-text-outline-color: var(--_input-outline-color);
  --input-text-placeholder-color: var(--_input-placeholder-color);
  z-index: var(--z-index-normal);
}
.main-ui__chat-message-form-send-file-button {
  margin-left: calc(var(--border-width) * -1);
  width: 70px;
}
.main-ui__chat-message-form-send-file-button .icon {
  height: var(--font-size-xx-large);
  width: var(--font-size-xx-large);
}
.incoming-media-streams {
  border: solid var(--border-width) var(--_border-color);
  grid-column: 3;
  grid-row: 1 / span 3;
  height: calc(100% - var(--margin-size-medium));
  margin-top: var(--margin-size-medium);
  width: 200px;
}
.incoming-media-streams-details {
  grid-column: 3;
  grid-row: 1 / span 3;
}
@media screen and (max-width: 767.9px) {
  :host {
    height: auto;
  }
  .attrition {
    grid-row: 4;
  }
  .content {
    grid-template-columns: 50% auto;
    grid-template-rows: repeat(2, auto) 600px auto;
  }
  .form-type-1 {
    grid-template-columns: auto;
  }
  .form-type-1__label {
    grid-column: 1;
  }
  .handles {
    grid-column: 1 / span 2;
    grid-row: 2;
    height: 140px;
  }
  .incoming-media-streams-details {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
  }
  .incoming-media-streams {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
  }
  .info-bar__connecting-info-loading-bar {
    width: 80px;
  }
  .info-bar__ice-gathering-time {
    display: none;
  }
  .local-media-streams__camera-controls {
    grid-template-columns: repeat(2, auto);
  }
  .local-media-streams__display {
    aspect-ratio: 6 / 13;
  }
  .main-ui {
    grid-row: 3;
    grid-column: 1 / span 2;
  }
}
@media screen and (min-width: 768px) {
  .local-media-streams__display {
    aspect-ratio: 4 / 3;
  }
}
@media screen and (orientation: landscape) and (min-aspect-ratio: 16 / 9) and (max-width: 1280px) {
  :host {
    height: auto;
  }
  .local-media-streams__display {
    aspect-ratio: 13 / 6;
  }
}
`;