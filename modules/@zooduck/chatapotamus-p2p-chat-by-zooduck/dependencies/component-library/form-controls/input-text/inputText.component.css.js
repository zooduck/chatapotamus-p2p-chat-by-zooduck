export default `
:host {
  --_background-color: var(--input-text-background-color, var(--color-white));
  --_color: var(--input-text-color, var(--color-black));
  --_outline-color: var(--input-text-outline-color, var(--_color));
  --_placeholder-color:  var(--input-text-placeholder-color, rgba(0, 0, 0, 0.5));
  display: inline-block;
  min-width: 20ch;
  width: 100%;
}
.input {
  background-color: var(--_background-color);
  border: none;
  color: var(--_color);
  display: inline-block;
  font: inherit;
  font-family: var(--font-family-base);
  height: 100%;
  outline: solid var(--border-width) var(--_outline-color);
  outline-offset: calc(var(--border-width) * -1);
  padding: var(--padding-size-medium);
  width: 100%;
  word-break: break-word;
}
textarea.input {
  resize: none;
}
.input::placeholder {
  color: var(--_placeholder-color);
  font-family: var(--font-family-base);
}
.input:disabled {
  cursor: not-allowed;
  filter: opacity(0.5);
}
.input:focus {
  outline: dotted 2px var(--_color);
  outline-offset: -2px;
}
.multiline-input-with-emoji-tray {
  border: solid var(--border-width) var(--_color);
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.multiline-input-with-emoji-tray .input {
  --_outline-color: transparent;
  font-family: var(--font-family-emoji);
}
.multiline-input-with-emoji-tray-button {
  display: flex;
  height: 100%;
}
.multiline-input-with-emoji-tray-button__button {
  border-right: solid var(--border-width) var(--_color);
  font-size: var(--font-size-xx-large);
}
.multiline-input-with-emoji-tray__emoji-tray {
  grid-column: 2;
  height: 100%;
  left: 0;
  overflow: auto;
  position: absolute;
  top: 0;
  transform: translateY(100%);
  width: 100%;
}
.multiline-input-with-emoji-tray__emoji-tray--visible {
  transition: transform var(--animation-speed-fast);
  transform: translateY(0);
}
@media screen and (max-width: 767px) {
  :host {
    min-width: auto;
  }
}
`;