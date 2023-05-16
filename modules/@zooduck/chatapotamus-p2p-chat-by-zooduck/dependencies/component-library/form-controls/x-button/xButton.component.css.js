export default `
:host {
  --_active-brightness: var(--x-button-active-brightness, 0.92);
  --_background-color: var(--x-button-background-color, var(--color-gray-50));
  --_border-color: var(--_color);
  --_color: var(--x-button-color, var(--color-black));
  display: inline-block;
}
::slotted(.icon) {
  fill: var(--_color) !important;
  stroke: var(--_color) !important;
}
:host([action="primary"]) .button {
  --_background-color: var(--color-blue-600);
  --_color: var(--color-white);
}
:host([action="primary"]) .button:is(:active, :focus, :hover) {
  --_active-brightness: 1.2;
  --_color: var(--color-white);
}
:host([action="secondary"]) .button__background {
  outline: solid var(--border-width) var(--_border-color);
  outline-offset: calc(var(--border-width) * -1);
}
:host([action="warning"]) {
  --_background-color: var(--color-danger-red);
  --_color: var(--color-white);
}
:host([action="danger"]) .button:is(:active, :focus, :hover),
:host([action="warning"]) .button:is(:active, :focus, :hover) {
  --_active-brightness: 1.2;
  --_background-color: var(--color-danger-red);
  --_color: var(--color-white);
}
:host(:not([action="danger"])) .button:is(:active, :focus, :hover):not(:disabled) .button__background {
  filter: brightness(var(--_active-brightness));
}
.button {
  align-items: center;
  background: none;
  border: none;
  color: var(--_color);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  height: 100%;
  justify-content: space-between;
  outline: solid var(--border-width) transparent;
  padding: var(--padding-size-small);
  position: relative;
  text-align: center;
  width: 100%;
}
.button:is(:active, :focus):not(:disabled) .button__background {
  outline-style: dotted;
  outline-width: 2px;
  outline-offset: -2px;
}
.button--text-align-left {
  text-align: left;
}
.button--with-icon.button--with-label {
  display: flex;
  gap: var(--gap-size-medium);
}
.button:disabled {
  cursor: not-allowed;
  filter: opacity(0.5);
}
.button__background {
  background-color: var(--_background-color);
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
.button__label {
  display: block;
  flex-grow: 1;
}
.button__button,
.button__label {
  cursor: inherit;
}
.button__label,
.slot-pointer-events-killer {
  pointer-events: none;
  position: relative;
}
.button--with-icon:not(.button--with-label) .slot-pointer-events-killer {
  width: 100%;
}
.button__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.button:not(.button--toggle-on) slot[name="icon-on"] {
  display: none;
}
.button:not(.button--toggle-on) slot[name="icon-off"] {
  display: block;
}
.button--toggle-on slot[name="icon-on"] {
  display: block;
}
.button--toggle-on slot[name="icon-off"] {
  display: none;
}
`;