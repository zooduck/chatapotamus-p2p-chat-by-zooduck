/**
 * Feature-rich implementation of DOMParser with XSS protection and sanitization built-in.
 *
 * Includes support for IDL attributes and onevent attributes (including Custom Events).
 *
 * @example
 * // Attach event listeners using onevent attributes:
 * class MyCustomElement extends HTMLElement {
 *   // ...
 *   onClickHandler(event) {
 *     // ...
 *   }
 *   onClicketyClickClickHandler(event) {
 *     // ...
 *   }
 *   #createButton() {
 *     // Don't forget to pass the event listener context to the constructor!
 *     return new SafeDOMParser(this).parseFromString`
 *       <button on:click="onClickHandler()">Click me</button>
 *     `
 *   }
 *   #createButtonWithCustomEventListener() {
 *     // Always use all lowercase alpha characters for custom event types!
 *     // Don't forget to pass the event listener context to the constructor!
 *     return new SafeDOMParser(this).parseFromString`
 *       <custom-button on:clicketyclickclick="onClicketyClickClickHandler()">Click me</custom-button>
 *     `
 *   }
 * }
 * @example
 * // Set an IDL Attribute (DOM Property):
 * const readonlyInput = new SafeDOMParser().parseFromString`<input [readOnly]=${true}>`
 *
 * @example
 * // Create multiple elements (returns an array of elements):
 * const ul = document.querySelector('ul')
 * const listItems = new SafeDOMParser().parseFromString`
 *   <li>1</li>
 *   <li>2</li>
 * `
 * ul.append(...listItems)
 */
class SafeDOMParser {
  #IDL_ATTRIBUTE_PLACEHOLDER_PREFIX = '__safe-dom-parser-idl-attribute-placeholder__';
  #eventListenerContext;
  #idlAttributePlaceholders = new Map();
  #parsedHTMLString = '';
  #elementPlaceholders = new Map();
  /**
   * @constructor
   * @param {*} [eventListenerContext]
   */
  constructor(eventListenerContext) {
    this.#eventListenerContext = eventListenerContext;
  }
  /**
   * @method
   * @param {string[]} htmlStrings
   * @param {*[]} placeholders
   * @returns {HTMLElement|HTMLElement[]}
   */
  parseFromString(htmlStrings, ...placeholders) {
    htmlStrings.forEach((htmlString, index) => {
      this.#parsedHTMLString += this.#stripScriptTagsFromHTMLString(htmlString);
      const templateLiteralPlaceholder = placeholders[index];
      if (templateLiteralPlaceholder === undefined) {
        return;
      }
      [templateLiteralPlaceholder].flat().forEach((placeholder) => {
        this.#updateParsedHTMLString(placeholder);
      });
    });

    const doc = new DOMParser().parseFromString(this.#stripScriptTagsFromHTMLString(this.#parsedHTMLString), 'text/html');
    const elements = Array.from(doc.head.children).concat(Array.from(doc.body.children));
    // -----------------------------------------------------------------------------------------
    // Generating the children using document.createElement() ensures that any custom elements
    // are initialised immediately (since a custom element's constructor is not called until
    // it is attached to the document). In other words, if we do not do this here, the custom
    // element will only be initialised after it is added to the document.
    // ------------------------------------------------------------------------------------------
    const rootElementsGeneratedByDocument = this.#generateElementsWithDocument(elements);

    rootElementsGeneratedByDocument.forEach((rootElement, index, array) => {
      // ----------------------------------------------------------------------
      // We cannot use Element.replaceWith() on a rootElement (if we need to)
      // because Element.replaceWith() only works if the element has a parent.
      // For that reason, we cannot use the #processElement() method.
      // ----------------------------------------------------------------------
      // Instead, we have to modify the elementsGeneratedByDocument array with
      // the return value (element) from the #processRootElement() method.
      // ----------------------------------------------------------------------
      array[index] = this.#processRootElement(rootElement);
    });

    rootElementsGeneratedByDocument.forEach((rootElement) => {
      rootElement.querySelectorAll('*').forEach((childElement) => {
        this.#processElement(childElement);
      });
    });

    if (!elements.length) {
      return '';
    }

    if (elements.length === 1) {
      return rootElementsGeneratedByDocument[0];
    }

    return Array.from(rootElementsGeneratedByDocument);
  }
  /**
   * @private
   * @method
   * @param {HTMLElement}
   * @returns {void}
   */
  #addEventListenersToElement(element) {
    const context = this.#eventListenerContext;
    Array.from(element.attributes).forEach(({ name, value }) => {
      const eventType = name.match(/^on:([a-z]+)/)?.[1];
      if (!eventType) {
        return;
      }
      element.removeAttribute(name);
      if (!value || !context) {
        return;
      }
      const listenerName = value.match(/[a-zA-Z]+/)[0];
      const listener = context[listenerName];
      if (!listener) {
        return;
      }
      element.addEventListener(eventType, listener.bind(context));
    });
  }
  /**
   * @private
   * @method
   * @param {string} string
   * @returns {string}
   */
  #escapeUnsafeHTMLCharacters(string) {
    const htmlUnsafeCharactersMap = new Map([
      [/&(?![a-zA-Z0-9#]+;)/g, '&amp;'],
      [/"/g, '&quot;'],
      [/'/g, '&#x27;'],
      [/</g, '&lt;'],
      [/>/g, '&gt;']
    ]);
    let escapedString = string;
    htmlUnsafeCharactersMap.forEach((htmlEntity, unsafeCharacterRegex) => {
      escapedString = escapedString.replace(unsafeCharacterRegex, htmlEntity);
    });

    return escapedString;
  }
  /**
   * @private
   * @method
   * @param {HTMLElement[]} elements
   * @returns {HTMLElement[]}
   */
  #generateElementsWithDocument = (elements) => {
    return Array.from(elements).map((element) => {
      const elementGeneratedByDocument = document.createElement(element.localName);

      Array.from(element.attributes).forEach(({ name, value }) => {
        elementGeneratedByDocument.setAttribute(name, value);
      });

      elementGeneratedByDocument.append(...Array.from(element.cloneNode(true).childNodes));

      return elementGeneratedByDocument;
    });
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} childElement
   * @returns {void}
   */
  #processElement(childElement) {
    if (this.#elementPlaceholders.has(childElement.id)) {
      childElement.replaceWith(this.#elementPlaceholders.get(childElement.id));
    } else {
      this.#removeOnEventTypeAttributesFromElement(childElement);
      this.#setIDLTypeAttributesOnElement(childElement);
      this.#addEventListenersToElement(childElement);
    }
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} rootElement
   * @returns {HTMLElement}
   */
  #processRootElement(rootElement) {
    if (this.#elementPlaceholders.has(rootElement.id)) {
      return this.#elementPlaceholders.get(rootElement.id);
    } else {
      this.#removeOnEventTypeAttributesFromElement(rootElement);
      this.#setIDLTypeAttributesOnElement(rootElement);
      this.#addEventListenersToElement(rootElement);
      return rootElement;
    }
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} element
   * @returns {void}
   */
  #removeOnEventTypeAttributesFromElement(element) {
    Array.from(element.attributes).forEach((attribute) => {
      if (/^on[a-z]+/.test(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    });
  }
  /**
   * @private
   * @method
   * @param {HTMLElement} element
   * @returns {void}
   */
  #setIDLTypeAttributesOnElement(element) {
    const IDL_ATTRIBUTE_PLACEHOLDER_REGEX = new RegExp(`^${this.#IDL_ATTRIBUTE_PLACEHOLDER_PREFIX}+`);
    const IDL_ATTRIBUTE_PLACEHOLDER_PREFIX_REGEX = new RegExp(`^${this.#IDL_ATTRIBUTE_PLACEHOLDER_PREFIX}`);
    Array.from(element.attributes).forEach((attribute) => {
      if (IDL_ATTRIBUTE_PLACEHOLDER_REGEX.test(attribute.name)) {
        const { idlAttributeName, idlAttributeValue } = this.#idlAttributePlaceholders.get(attribute.name.replace(IDL_ATTRIBUTE_PLACEHOLDER_PREFIX_REGEX, ''));
        element[idlAttributeName] = idlAttributeValue;
        element.removeAttribute(attribute.name);
      }
    });
  }
  /**
   * @private
   * @method
   * @param {string} htmlString
   * @returns {string}
   */
  #stripScriptTagsFromHTMLString(htmlString) {
    return htmlString.replace(/<script>/g, '&lt;script&gt;').replace(/<\/script>/g, '&lt;\\script&gt;');
  }
  /**
   * @private
   * @method
   * @param {string|HTMLElement|SVGSVGElement|{unsafeHTML: string}|*} templateLiteralPlaceholder
   * @returns {void}
   */
  #updateParsedHTMLString(templateLiteralPlaceholder) {
    const IDL_ATTRIBUTE_REGEX = /\[[a-zA-Z]+\]=$/;
    const IDL_ATTRIBUTE_WITH_NON_CAPTURING_ASSIGNMENT_OPERATOR_POSITIVE_LOOKAHEAD_REGEX = /\[[a-zA-Z]+\](?==$)/;
    const { unsafeHTML } = templateLiteralPlaceholder || {};

    if (IDL_ATTRIBUTE_WITH_NON_CAPTURING_ASSIGNMENT_OPERATOR_POSITIVE_LOOKAHEAD_REGEX.test(this.#parsedHTMLString)) {
      // ---------------------------------------------------------------------------------
      // This is the only condition where the templateLiteralPlaceholder can be anything.
      // ---------------------------------------------------------------------------------
      const idlAttributeName = this.#parsedHTMLString.match(IDL_ATTRIBUTE_WITH_NON_CAPTURING_ASSIGNMENT_OPERATOR_POSITIVE_LOOKAHEAD_REGEX)[0].slice(1, -1);
      const idlAttributePlaceholderID = crypto.randomUUID();
      const idlAttributePlaceholderAttribute = this.#IDL_ATTRIBUTE_PLACEHOLDER_PREFIX + idlAttributePlaceholderID;
      this.#idlAttributePlaceholders.set(idlAttributePlaceholderID, {
        idlAttributeName: idlAttributeName,
        idlAttributeValue: templateLiteralPlaceholder
      });
      this.#parsedHTMLString = this.#parsedHTMLString.replace(IDL_ATTRIBUTE_REGEX, idlAttributePlaceholderAttribute);
    } else if (templateLiteralPlaceholder instanceof HTMLElement || templateLiteralPlaceholder instanceof SVGSVGElement) {
      const placeholderID = crypto.randomUUID();
      this.#elementPlaceholders.set(placeholderID, templateLiteralPlaceholder);
      this.#parsedHTMLString += `<${templateLiteralPlaceholder.localName} id="${placeholderID}"></${templateLiteralPlaceholder.localName}>`;
    } else if (unsafeHTML) {
      this.#parsedHTMLString += unsafeHTML;
    } else {
      this.#parsedHTMLString += this.#escapeUnsafeHTMLCharacters(templateLiteralPlaceholder.toString());
    }
  }
}

export { SafeDOMParser };
