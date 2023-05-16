import '../../../../../../dependencies/component-library/form-controls/input-text/index.js  ';
import '../../../../../../dependencies/component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
function answererFormTemplate() {
  return new SafeDOMParser(this).parseFromString`
    <section class="forms-ui__sdp-forms-section">
      <h2 class="forms-ui__sdp-forms-section-title">Answerer ONLY</h2>
      <form
        autocomplete="off"
        class="form-type-1"
        on:submit="onSetSDPOfferFormSubmit()">
        <label class="form-type-1__label" for="sdp-offer-input">Set SDP offer from remote user</label>
        <input-text
          class="forms-ui__input"
          id="sdp-offer-input"
          multiline
          name="sdp-offer"
          on:keydown="onSessionDescriptionMultilineInputKeyDown()"
          placeholder="Paste SDP offer from remote user here"
          rows="2"
          spellcheck="false"
          title="Paste SDP offer from remote user here">
        </input-text>
        <x-button
          action="secondary"
          disabled
          id="set-sdp-offer-button"
          name="submit-button"
          type="submit">
          <span>Set Offer</span>
        </x-button>
      </form>
    </section>
  `;
}
export { answererFormTemplate };