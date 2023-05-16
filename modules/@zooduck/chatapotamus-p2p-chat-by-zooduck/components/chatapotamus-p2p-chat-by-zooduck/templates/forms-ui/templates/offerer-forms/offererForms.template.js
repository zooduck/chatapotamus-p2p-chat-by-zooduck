import '../../../../../../dependencies/component-library/form-controls/input-text/index.js';
import '../../../../../../dependencies/component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
function offererFormsTemplate() {
  return new SafeDOMParser(this).parseFromString`
    <section class="forms-ui__sdp-forms-section">
      <h2 class="forms-ui__sdp-forms-section-title">Offerer ONLY</h2>
      <form
        autocomplete="off"
        class="form-type-1"
        on:submit="onCreateSDPOfferFormSubmit()">
        <label class="form-type-1__label" for="remote-handle-input">Create SDP offer for remote user</label>
        <input-text
          allowed-characters-pattern="[\\w#]"
          class="forms-ui__input"
          id="remote-handle-input"
          name="remote-handle"
          placeholder="Enter remote user's handle"
          spellcheck="false"
          title="Enter remote user's handle">
        </input-text>
        <x-button
          action="secondary"
          disabled
          id="create-sdp-offer-button"
          name="submit-button"
          type="submit">
          <span>Create Offer</span>
        </x-button>
      </form>
      <form
        autocomplete="off"
        class="form-type-1"
        on:submit="onSetSDPAnswerFormSubmit()">
        <label class="form-type-1__label" for="sdp-answer-input">Set SDP answer from remote user</label>
        <input-text
          class="forms-ui__input"
          id="sdp-answer-input"
          multiline
          name="sdp-answer"
          on:keydown="onSessionDescriptionMultilineInputKeyDown()"
          placeholder="Paste SDP answer from remote user here"
          rows="2"
          spellcheck="false"
          title="Paste SDP answer from remote user here">
        </input-text>
        <x-button
          action="secondary"
          disabled
          id="set-sdp-answer-button"
          name="submit-button"
          type="submit">
          <span>Set Answer</span>
        </x-button>
      </form>
    </section>
  `;
}
export { offererFormsTemplate };