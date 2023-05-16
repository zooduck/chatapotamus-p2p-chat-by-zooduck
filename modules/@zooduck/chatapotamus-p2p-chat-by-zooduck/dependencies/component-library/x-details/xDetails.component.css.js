export default `
:host {
  --_color: var(--x-details-color, var(--color-black));
  --_border: var(--x-details-border, solid var(--border-width) var(--_color));
  display: inline-block;
}
:host(:focus) {
  outline: none !important;
}
main {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
}
.summary {
  align-items: center;
  border: var(--_border);
  cursor: pointer;
  display: flex;
  gap: var(--gap-size-medium);
  padding: var(--padding-size-small);
}
:host([disabled]) .summary {
  cursor: not-allowed;
  filter: opacity(0.5);
}
.summary__text {
  color: var(--_color);
  flex-grow: 1;
}
.summary__details-state-chevron {
  fill: var(--_color);
  stroke: var(--_color);
}
:host([open]) .summary__details-state-chevron {
  transform: rotateZ(180deg);
}
.details {
  display: none;
  overflow: hidden;
}
.details--visible {
  display: block;
}
`;