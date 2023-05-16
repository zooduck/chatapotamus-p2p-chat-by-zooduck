import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { answererFormTemplate } from './templates/answerer-form/answererForm.template.js';
import { offererFormsTemplate } from './templates/offerer-forms/offererForms.template.js';
import { setHandleFormTemplate } from './templates/set-handle-form/setHandleForm.template.js';
function formsUITemplate() {
  return new SafeDOMParser(this).parseFromString`
    <section class="forms-ui" id="forms-ui" use-custom-scrollbars>
      ${setHandleFormTemplate.call(this)}
      ${offererFormsTemplate.call(this)}
      ${answererFormTemplate.call(this)}
    </section>
  `;
}
export { formsUITemplate };