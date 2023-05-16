export default `
/*
|================================================|
| PUBLIC VARIABLES                               |
|================================================|
| --x-scroller-scrollbar-width                   |
|------------------------------------------------|
*/

:host {
  /* ------------------------- */
  /* !!! PRIVATE VARIABLES !!! */
  /* ------------------------- */
  --_scrollbar-width: var(--x-scroller-scrollbar-width, 12px);
  --_scrollbar-background-image: url('../../../../../assets/svg/misc/backdrop_circle_dark.svg');
  --_scrollbar-control-surface-background-color: rgba(0, 0, 0, 0.2);
}

:host {
  display: block;
  overflow: hidden;
  position: relative;
  visibility: hidden;
}

.scrollbars {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.scrollbar-x,
.scrollbar-y {
  background-image: var(--_scrollbar-background-image);
  background-repeat: repeat;
  background-size: 4px;
  filter: opacity(0);
  pointer-events: all;
  position: absolute;
  transition: filter var(--animation-speed-fast);
  user-select: none;
}

.scrollbar-y {
  height: calc(100% - var(--_scrollbar-width));
  right: 0;
  top: 0;
  width: var(--_scrollbar-width);
}

:host(:is(:hover, :focus)) .scrollbar-x,
:host(:is(:hover, :focus)) .scrollbar-y,
.scrollbars--visible .scrollbar-x,
.scrollbars--visible .scrollbar-y {
  filter: opacity(1);
}

.scrollbar-x {
  bottom: 0;
  height: var(--_scrollbar-width);
  left: 0;
  width: calc(100% - var(--_scrollbar-width));
}

.scrollbar-x__control-surface,
.scrollbar-y__control-surface {
  background-color: var(--_scrollbar-control-surface-background-color);
  pointer-events: none;
  position: relative;
}

.scrollbar-x__control-surface {
  height: 100%;
  width: 0;
}

.scrollbar-y__control-surface {
  height: 0;
  width: 100%;
}

:host(:not([theme])) :is(.scrollbar-x, .scrollbar-y),
:host([theme]) :is(.scrollbar-x, .scrollbar-y),
:host([theme="light"]) :is(.scrollbar-x, .scrollbar-y) {
  --_scrollbar-background-image: url('../../../../../assets/svg/misc/backdrop_circle_dark.svg');
}

:host([theme="dark"]) :is(.scrollbar-x, .scrollbar-y) {
  --_scrollbar-background-image: url('../../../../../assets/svg/misc/backdrop_circle_light.svg');
}

:host(:not([theme])) :is(.scrollbar-x__control-surface, .scrollbar-y__control-surface),
:host([theme]) :is(.scrollbar-x__control-surface, .scrollbar-y__control-surface),
:host([theme="light"]) :is(.scrollbar-x__control-surface, .scrollbar-y__control-surface) {
  --_scrollbar-control-surface-background-color: rgba(0, 0, 0, 0.2);
}

:host([theme="dark"]) :is(.scrollbar-x__control-surface, .scrollbar-y__control-surface) {
  --_scrollbar-control-surface-background-color: rgba(255, 255, 255, 0.2);
}
`;
