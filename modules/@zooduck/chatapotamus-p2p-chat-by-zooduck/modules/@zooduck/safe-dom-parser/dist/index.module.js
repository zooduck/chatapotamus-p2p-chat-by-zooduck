class SafeDOMParser {
  #IDL_ATTRIBUTE_PLACEHOLDER_PREFIX = '__safe-dom-parser-idl-attribute-placeholder__';
  #eventListenerContext;
  #idlAttributePlaceholders = new Map();
  #parsedHTMLString = '';
  #elementPlaceholders = new Map();
  constructor(eventListenerContext) {
    this.#eventListenerContext = eventListenerContext;
  }
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
    const rootElementsGeneratedByDocument = this.#generateElementsWithDocument(elements);
    rootElementsGeneratedByDocument.forEach((rootElement, index, array) => {
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
  #processElement(childElement) {
    if (this.#elementPlaceholders.has(childElement.id)) {
      childElement.replaceWith(this.#elementPlaceholders.get(childElement.id));
    } else {
      this.#removeOnEventTypeAttributesFromElement(childElement);
      this.#setIDLTypeAttributesOnElement(childElement);
      this.#addEventListenersToElement(childElement);
    }
  }
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
  #removeOnEventTypeAttributesFromElement(element) {
    Array.from(element.attributes).forEach((attribute) => {
      if (/^on[a-z]+/.test(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    });
  }
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
  #stripScriptTagsFromHTMLString(htmlString) {
    return htmlString.replace(/<script>/g, '&lt;script&gt;').replace(/<\/script>/g, '&lt;\\script&gt;');
  }
  #updateParsedHTMLString(templateLiteralPlaceholder) {
    const IDL_ATTRIBUTE_REGEX = /\[[a-zA-Z]+\]=$/;
    const IDL_ATTRIBUTE_WITH_NON_CAPTURING_ASSIGNMENT_OPERATOR_POSITIVE_LOOKAHEAD_REGEX = /\[[a-zA-Z]+\](?==$)/;
    const { unsafeHTML } = templateLiteralPlaceholder || {};
    if (IDL_ATTRIBUTE_WITH_NON_CAPTURING_ASSIGNMENT_OPERATOR_POSITIVE_LOOKAHEAD_REGEX.test(this.#parsedHTMLString)) {
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