export default `
/*
|================================================|
| PUBLIC VARIABLES                               |
|================================================|
| --splash-screen-service-splash-screen-border   |
|------------------------------------------------|
*/

:host {
  /* ------------------------- */
  /* !!! PRIVATE VARIABLES !!! */
  /* ------------------------- */
  --_border: none;
}

:host([with-borders]) {
  --_border: var(--splash-screen-service-splash-screen-border, solid var(--border-width) var(--color-white));
}

#root {
  background-color: var(--color-gray-800);
  border: var(--_border);
  color: var(--color-white);
  display: grid;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-normal);
  grid-template-columns: 1fr auto; /* Second column is for the optional Cancellation X */
  grid-template-rows: calc(50% + var(--padding-size-medium) + var(--margin-size-medium)) calc(50% - var(--margin-size-medium) - var(--padding-size-medium));
  height: 100vh;
  justify-items: center;
  left: 0;
  padding: var(--padding-size-medium);
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: var(--z-index-very-important);
}

#root.contained {
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: var(--z-index-important);
}

.top-half {
  display: grid;
  grid-template-rows: minmax(50%, 1fr) auto;
  margin-bottom: var(--margin-size-medium);
  row-gap: var(--gap-size-medium);
  justify-items: center;
}

.top-half__title {
  align-self: end;
  font-size: 1.5em;
  overflow: hidden;
  padding: 0;
  text-align: center;
}

.top-half__message {
  color: var(--color-white);
  display: flex;
  justify-content: center;
  margin: 0;
  max-width: 300px;
  overflow: hidden;
  word-break: break-all;
}

.something-happening-animation {
  grid-column: 1;
  height: 50px;
  position: relative;
  width: 60px;
}

.something-happening-animation__block {
  animation: block infinite var(--animation-speed-normal);
  background-color: white;
  bottom: 0;
  height: 25px;
  left: 0;
  position: absolute;
  width: 20px;
}

.something-happening-animation__block:nth-of-type(2) {
  animation-delay: 0.25s;
  left: 20px;
}

.something-happening-animation__block:nth-of-type(3) {
  animation-delay: 0.1s;
  left: 40px;
}

.cancel-button {
  --x-button-background-color: var(--color-gray-800);
  --x-button-color: var(--color-white);
  --x-button-active-brightness: 1.4;

  align-self: start;
  grid-column: 2;
  grid-row: 1;
}

@keyframes block {
  0% {
    height: 50px;
  }
  50% {
    height: 0px;
  }
  100% {
    height: 50px;
  }
}
`;
