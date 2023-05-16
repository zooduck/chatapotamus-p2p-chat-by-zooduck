export default `
:host {
  --_background-color: var(--emoji-tray-background-color, var(--color-white));
  display: block;
}
.emoji-tray {
  background-color: var(--_background-color);
  height: 100%;
}
.emoji-list {
  background-color: var(--color-white);
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  list-style: none;
  margin: 0;
  overflow: hidden auto;
  padding: var(--padding-size-small);
}
.emoji-list__item-button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-emoji);
  font-size: var(--font-size-x-large);
  outline: none;
  padding: 0 0 0.2ex 0;
}
.emoji-list__item-button:focus {
  outline: dotted 2px var(--color-black);
  outline-offset: -2px;
}
`;