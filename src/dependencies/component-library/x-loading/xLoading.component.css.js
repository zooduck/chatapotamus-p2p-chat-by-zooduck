export default `
/*
|==================================================|
| PUBLIC VARIABLES                                 |
|==================================================|
| --x-loading-color                                |
|--------------------------------------------------|
*/

:host {
  /* ------------------------- */
  /* !!! PRIVATE VARIABLES !!! */
  /* ------------------------- */
  --_color: var(--x-loading-color, var(--color-black));

  block-size: 1em; /* As per <progress> element. This allows us to set a height on the element. */
  inline-size: 10em; /* As per <progress> element. This allows us to set a width on the element. */
}

#root {
  border: solid var(--border-width) var(--_color);
  height: 100%;
  overflow: hidden;
  padding: 3px;
}

.loading-bar-container {
  height: 100%;
  overflow: hidden;
}

.loading-bar-container__loading-bar {
  animation: loading var(--animation-speed-slow) infinite;
  background-color: var(--_color);
  height: 100%;
  max-width: 100%;
}

@keyframes loading {
  0% {
    transform: translateX(0);
    width: 0%;
  }
  50% {
    transform: translateX(0);
    width: 100%;
  }
  100% {
    transform: translateX(100%);
    width: 100%;
  }
}
`;
