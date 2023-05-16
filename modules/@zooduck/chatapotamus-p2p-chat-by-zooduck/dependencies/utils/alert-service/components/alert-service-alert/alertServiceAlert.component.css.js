export default `
:host {
  --_dialogue-background-color: var(--color-gray-100);
  align-items: center;
  background-color: rgba(0, 0, 0, 45%);
  background-image: url('modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/assets/svg/misc/backdrop_x_light.svg');
  background-repeat: repeat;
  background-size: 6px;
  box-sizing: content-box;
  display: flex;
  font-family: var(--font-family-base);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-normal);
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: var(--z-index-critical);
}
:host([contained]) {
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: var(--z-index-important);
}
main {
  background-color: var(--_dialogue-background-color);
  box-shadow: 2px 2px 12px rgba(0, 0, 0, 45%);
  color: var(--color-gray-800);
  display: flex;
  flex-direction: column;
  gap: var(--gap-size-medium);
  max-width: calc(100% - (var(--padding-size-x-large) * 2));
  padding: var(--padding-size-x-large);
  width: 450px;
}
.title {
  color: rgba(0, 0, 0, 50%);
  display: flex;
  font-size: var(--font-size-medium);
  justify-content: center;
  padding: 0;
}
.title:empty {
  display: none;
}
.messages {
  word-wrap: break-word;
}
.control-prompts {
  display: flex;
  justify-content: center;
}
.control-prompts__button {
  --x-button-background-color: var(--_dialogue-background-color);
  flex-basis: 50%;
}
`;