export default `
:host {
  --_arrow-size: 1em;
  --_color: var(--file-transfer-progress-color, var(--color-black));
  display: block;
  overflow: hidden;
}
:host(:not([total-bytes])),
:host([total-bytes="0"]) {
  display: none;
}
.file-info {
  align-items: center;
  display: flex;
  gap: var(--gap-size-x-small);
}
.file-info__label {
  color: var(--_color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-info__label:empty {
  display: none;
}
.file-info__arrows-clipping-container {
  flex-shrink: 0;
  overflow: hidden;
  width: calc(var(--_arrow-size) * 3);
}
:host(:not([total-bytes])) .file-info__arrows-clipping-container,
:host(:not([total-bytes])) .file-info__label,
:host(:not([total-bytes])) .file-info__progress,
:host([total-bytes="0"]) .file-info__arrows-clipping-container,
:host([total-bytes="0"]) .file-info__progress {
  display: none;
}
.file-info__arrows {
  display: flex;
  animation: arrows var(--animation-speed-slow) infinite linear;
}
.file-info--file-transfer-complete .file-info__arrows {
  animation: none;
}
.file-info__arrows .icon {
  fill: var(--_color);
  height: var(--_arrow-size);
  stroke: var(--_color);
  width: var(--_arrow-size);
}
@keyframes arrows {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
}
`;