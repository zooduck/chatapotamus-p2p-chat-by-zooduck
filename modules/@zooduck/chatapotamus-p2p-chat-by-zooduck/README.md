# chatapotamus-p2p-chat-by-zooduck

A WebRTC web component for managing peer-to-peer connections with text chat, VoIP, file transfer and screen sharing.

![screenshot.png](/screenshot.png?raw=true)

Visit [Github Pages](https://zooduck.github.io/chatapotamus-p2p-chat-by-zooduck/) to see this component in action.

## Getting started

This component is hosted by the [jsdelivr](https://www.jsdelivr.com/) CDN.

Simply add the following module script to your document head:

```html
<script src="https://cdn.jsdelivr.net/gh/zooduck/chatapotamus-p2p-chat-by-zooduck@latest/modules/%40zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js" type="module"></script>
```

Or import using a module file:

```javascript
import 'https://cdn.jsdelivr.net/gh/zooduck/chatapotamus-p2p-chat-by-zooduck@latest/modules/%40zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js'
```

## Use

Add the component to your page:

```html
<chatapotamus-p2p-chat-by-zooduck api-docs></chatapotamus-p2p-chat-by-zooduck>
```

## RTC Configuration

The component ships with a default RTC Configuration that includes STUN servers only.

If you require TURN servers, or want to provide your own STUN servers, use the `iceServers` property:

```javascript
const p2pChatElement = document.querySelector('chatapotamus-p2p-chat-by-zooduck')
p2pChatElement.iceServers = [
  {
    urls: 'stun:a.relay.metered.ca:80'
  },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: '<username>',
    credential: '<password>'
  }
]
```

## Self hosting

The easiest way to use this component is via CDN (as explained in the "Getting Started" section near the top of this file).

*Unless you have a specific reason to host the component yourself, you can ignore the following instructions.*

## Installation

### For users with an access token

Add a `.npmrc` file to your project, with the following lines:

```text
@zooduck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

Install from the command line:

```node
npm install @zooduck/chatapotamus-p2p-chat-by-zooduck@latest
```

Install via package.json:

```json
"@zooduck/chatapotamus-p2p-chat-by-zooduck": "latest"
```

### For users without an access token

Clone or [Download](https://github.com/zooduck/chatapotamus-p2p-chat-by-zooduck/archive/refs/heads/master.zip) the repository to your machine.

## Adding the component to your project

Copy the `modules` folder to your project, making sure to place it in the root directory where files are served. (See "Fixing assets path issues" below if you are unable to do this).

## Import

Import using a module script:

```html
<script src="modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js" type="module"></script>
```

Import using a module file:

```javascript
import 'modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js'
```

Note: For privacy reaons, the `iceServers` getter will always return the default configuration.

## Fixing assets path issues

If you cannot place the `modules` folder in your project's root directory, you will need to run a script to update assets paths in the component.

Failure to do so will result in browsers that do not yet support import assertions for `.css` files (like Firefox) being unable to load certain assets.

The `modules/@zooduck/chatapotamus-p2p-chat-by-zooduck` folder contains a `package.json` with two properties and an `update-assets-path` script:

```json
{
  "currentAssetsPath": "modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/assets",
  "newAssetsPath": "modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/assets",
  "scripts": {
    "update-assets-path": "node build-scripts/setAssetsPath.build.mjs"
  }
}
```

If you are changing the assets path for the first time, you need only concern yourself with updating the value of the `"newAssetsPath"` property.

To run the script, cd to the `modules/@zooduck/chatapotamus-p2p-chat-by-zooduck` folder, then:

```node
npm run update-assets-path
```
