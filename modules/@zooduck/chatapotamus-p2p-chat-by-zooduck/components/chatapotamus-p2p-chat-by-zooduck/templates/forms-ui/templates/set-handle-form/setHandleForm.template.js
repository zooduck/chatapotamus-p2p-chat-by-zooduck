import '../../../../../../dependencies/component-library/form-controls/input-text/index.js';
import '../../../../../../dependencies/component-library/form-controls/x-button/index.js';
import { SafeDOMParser } from '../../../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
function setHandleFormTemplate() {
  return new SafeDOMParser(this).parseFromString`
    <form
      autocomplete="off"
      class="forms-ui__set-handle-form form-type-1"
      id="set-handle-form"
      on:submit="onSetHandleFormSubmit()">
      <label class="form-type-1__label" for="handle-input">Enter your handle</label>
      <input-text
        allowed-characters-pattern="[\\w#]"
        class="forms-ui__input"
        id="handle-input"
        name="handle"
        pattern="[\\w\\d]{3,}"
        pattern-mismatch-validation-message="Your handle must contain at least 3 characters.\n\nYour handle can contain word characters (A-Za-z_) and numbers only."
        value-missing-validation-message="Please enter a value for this field."
        placeholder="e.g. coconut_man, MoonHead, PEA"
        required
        spellcheck="false">
      </input-text>
      <x-button
        action="secondary"
        id="handle-submit-button"
        name="submit-button"
        type="submit">
        <span>Save</span>
      </x-button>
    </form>
  `;
}
export { setHandleFormTemplate };