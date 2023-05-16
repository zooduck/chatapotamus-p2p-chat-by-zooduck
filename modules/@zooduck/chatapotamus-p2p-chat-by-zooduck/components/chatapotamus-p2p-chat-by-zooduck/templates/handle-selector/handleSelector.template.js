import '../../../../dependencies/component-library/form-controls/x-button/xButton.component.js';
import { svgIconService } from '../../../../assets/svgIconService.util.js';
import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
await svgIconService.loadIcons([svgIconService.Icon.CANCELLATION_X]);
function handleSelectorTemplate({ handle = '' } = {}) {
  return new SafeDOMParser(this).parseFromString`
    <li class="handles__list-item" id="handles-list-item-${handle}" title="${handle}">
      <x-button
        class="handles__list-item-select-handle-button"
        id="${handle}"
        text-align-left
        type="button"
        value="${handle}"
        on:click="onSelectHandleButtonClick()">${handle}</x-button>
      <span class="handles__list-item-new-messages-counter"></span>
      <x-button
        action="danger"
        data-connection-id="${handle}"
        on:click="onDisconnectUserButtonClick()">
        ${svgIconService.getIcon(svgIconService.Icon.CANCELLATION_X, { class: 'icon' })}
      </x-button>
    </li>
  `;
}
export { handleSelectorTemplate };