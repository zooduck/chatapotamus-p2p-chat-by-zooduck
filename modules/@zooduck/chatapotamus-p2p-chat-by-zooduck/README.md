# chatapotamus-p2p-chat-by-zooduck

A WebRTC web component for managing peer-to-peer connections with text chat, VoIP, file transfer and screen sharing.

![screenshot.png](/screenshot.png?raw=true)

## Getting started

Copy the `modules` folder to your project, making sure to place it in the root directory where files are served. (See "Fixing assets path issues" below if you are unable to do this).

## Import

Import using a module file:

```javascript
import 'modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js'
```

Import using a `<script>` tag:

```html
<script type="module" src="modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js"></script>
```

## Use

Add the component to your webpage:

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
