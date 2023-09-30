# SafeDOMParser

Feature-rich implementation of the [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) interface with XSS protection and sanitization built-in.

Includes support for IDL attributes / DOM properties and onevent attributes (including Custom Events).

## Installation

### For users with an access token

Add a `.npmrc` file to your project, with the following lines:

```text
@zooduck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

Install from the command line:

```node
npm install @zooduck/safe-dom-parser@latest
```

Install via package.json:

```json
"@zooduck/safe-dom-parser": "latest"
```

### For users without an access token

Clone or [Download](https://github.com/zooduck/safe-dom-parser/archive/refs/heads/master.zip) the repository to your machine.

## Getting started

Copy the `safe-dom-parser` folder to your project.

## Import

Import using a module file:

```javascript
import { SafeDOMParser } from 'path/to/safe-dom-parser/dist/index.module.js'
```

## Use

This module was designed with Web Components (Custom Elements) in mind, but can be used anywhere.

If you want to use `on:event` type attributes, you must pass the event listener context to the constructor (see examples below for more details).

## Examples

### Attach event listeners using `on:event` attributes

In a Web Component:

```javascript
class MyCustomElement extends HTMLElement {
  // ...
  onClickHandler(event) {
    // ...
  }
  onClicketyClickClickHandler(event) {
    // ...
  }
  #createButton() {
    // Don't forget to pass the event listener context to the constructor!
    return new SafeDOMParser(this).parseFromString`
      <button on:click="onClickHandler()">Click me</button>
    `
  }
  // Always use all lowercase alpha characters for custom events:
  #createButtonWithCustomEventListener() {
    // Don't forget to pass the event listener context to the constructor!
    return new SafeDOMParser(this).parseFromString`
      <custom-button on:clicketyclickclick="onClicketyClickClickHandler()">Click me</custom-button>
    `
  }
}
```

Anywhere else:

```javascript
const eventListeners = {
  onClickHandler(event) {
    // ...
  }
  onClicketyClickClickHandler(event) {
    // ...
  }
}

const createButton = () => {
  // Don't forget to pass the event listener context to the constructor!
  return new SafeDOMParser(eventListeners).parseFromString`
    <button on:click="onClickHandler()">Click me</button>
  `
}

const createButtonWithCustomEventListener = () => {
  // Always use all lowercase alpha characters for custom event types!
  // Don't forget to pass the event listener context to the constructor!
  return new SafeDOMParser(eventListeners).parseFromString`
    <custom-button on:clicketyclickclick="onClicketyClickClickHandler()">Click me</custom-button>
  `
}
```

### Set an IDL attribute / DOM property

```javascript
// Unlike content attributes, the value of a DOM property can be anything (in this case, a boolean).
const readonlyInput = new SafeDOMParser().parseFromString`<input [readOnly]=${true}>`
```

### Create mutiple root elements

```javascript
const ul = document.querySelector('ul')
// Returns an array of elements
const listItems = new SafeDOMParser().parseFromString`
  <li>1</li>
  <li>2</li>
`
ul.append(...listItems)
```
