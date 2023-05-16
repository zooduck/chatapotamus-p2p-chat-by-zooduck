import '../../../../dependencies/component-library/form-controls/x-button/index.js';
import '../../../../dependencies/component-library/file-transfer-progress/index.js';
import '../../../../dependencies/component-library/x-loading/index.js';
import { svgIconService } from '../../../../assets/svgIconService.util.js';
import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
await svgIconService.loadIcons([
  svgIconService.Icon.CHEVRON_DOWN,
  svgIconService.Icon.CHEVRON_UP
]);
function infoBarHeaderTemplate({
  apiDocs = false,
  handle = '',
  handlePlaceholder = '',
  iceGatheringTimeSeconds = '',
  isStandaloneMode = true,
  natType = ''
} = {}) {
  const infoBarHeaderElement = new SafeDOMParser(this).parseFromString`
    <header class="info-bar" id="info-bar">
      <h1 class="info-bar__title">
        <span
          class="info-bar__handle"
          id="info-bar-handle"
          on:click="onInfoBarTitleClick()"
          title="${handle}">${handle}</span>
        <span class="info-bar__handle-placeholder">${handlePlaceholder}</span>
      </h1>
      <section class="info-bar__cta-buttons" id="info-bar-cta-buttons"></section>
      <section class="info-bar__row-2">
        <section class="info-bar__network-info" id="info-bar-network-info">
          <span class="info-bar__nat-type" id="info-bar-nat-type">${natType}</span>
          <span class="info-bar__ice-gathering-time" id="info-bar-ice-gathering-time">${iceGatheringTimeSeconds}s</span>
        </section>
        <file-transfer-progress class="info-bar__file-transfer-progress" id="file-transfer-progress"></file-transfer-progress>
        <section class="info-bar__connecting-info" id="info-bar-connecting-info">
          <span class="info-bar__connecting-info-label" id="info-bar-connecting-info-label"></span>
          <x-loading class="info-bar__connecting-info-loading-bar"></x-loading>
        </section>
      </section>
    </header>
  `;
  if (isStandaloneMode) {
    infoBarHeaderElement.querySelector('#info-bar-cta-buttons').append(new SafeDOMParser(this).parseFromString`
      <x-button
        class="info-bar__toggle-forms-ui-button"
        id="toggle-forms-ui-button"
        on:click="onToggleFormsButtonClick()"
        toggle-state="0">
        <span>Connect</span>
        ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_DOWN, { class: 'icon', slot: 'icon-on' })}
        ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_UP, { class: 'icon', slot: 'icon-off' })}
      </x-button>
    `);
  }
  if (apiDocs) {
    infoBarHeaderElement.querySelector('#info-bar-cta-buttons').append(new SafeDOMParser(this).parseFromString`
      <x-button
        class="info-bar__toggle-api-docs-button"
        id="toggle-api-docs-button"
        toggle-state="0"
        on:click="onToggleAPIDocsButtonClick()">
        <span>Docs</span>
        ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_DOWN, { class: 'icon', slot: 'icon-on' })}
        ${svgIconService.getIcon(svgIconService.Icon.CHEVRON_UP, { class: 'icon', slot: 'icon-off' })}
      </x-button>
    `);
  }
  return infoBarHeaderElement;
}
export { infoBarHeaderTemplate };