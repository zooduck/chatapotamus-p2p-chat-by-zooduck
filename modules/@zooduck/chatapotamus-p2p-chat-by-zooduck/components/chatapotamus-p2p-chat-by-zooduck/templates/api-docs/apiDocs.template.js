import '../../../../dependencies/component-library/link-to-element/linkToElement.component.js';
import { SafeDOMParser } from '../../../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import cssVariablesColorSchemeExampleCodeSnippet from '../../../../code-snippets/cssVariablesColorSchemeExample.codeSnippet.js';
import productionModeExampleHTMLCodeSnippet from '../../../../code-snippets/productionModeHTMLExample.codeSnippet.js';
import productionModeExampleJSCodeSnippetSimple from '../../../../code-snippets/productionModeJSExampleSimple.codeSnippet.js';
import productionModeExampleJSCodeSnippetWithEvents from '../../../../code-snippets/productionModeJSExampleWithEvents.codeSnippet.js';
import iceServersExampleCodeSnippet from '../../../../code-snippets/iceServersExample.codeSnippet.js';
const cssVariables = `
--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-primary
--chatapotamus-p2p-chat-by-zooduck-color-scheme-color-secondary
`.trim();
const createEventTypeMarkup = (eventType) => {
  const EVENT_TYPE_PARTS_REGEX = /(chatapotamusp2pchatbyzooduck)([\w]+)/;
  const [_, eventTypePrefix, eventTypeSuffix] = eventType.match(EVENT_TYPE_PARTS_REGEX);
  return { unsafeHTML: `${eventTypePrefix}<span class="api-docs-event-type">${eventTypeSuffix}</span>` };
};
function apiDocsTemplate({
  dataChannelOpenEventType = '',
  dataChannelCloseEventType = '',
  defaultEmptyChatPlaceholder = '',
  defaultMaxIncomingMediaStreams = '',
  defaultMessageInputPlaceholder = '',
  defaultICEServers = '',
  deleteChatHistoryEventType = '',
  disconnectUserRequestEventType = '',
  fileTransferFailEventType = '',
  localHandleCopiedToClipboardEventType = '',
  localName = '',
  mediaDeviceErrorEventType = '',
  setHandleEventType = ''
} = {}) {
  return new SafeDOMParser(this).parseFromString`
    <section class="api-docs" id="api-docs" use-custom-scrollbars>
    <!--
    -----------
    Attributes
    -----------
    -->
    <section class="api-docs__subcategory">
      <h2 class="api-docs__subcategory-title">Attributes</h2>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-alerts">alerts:<span class="interface">'element'|'none'|'window'</span></h3>
      <p>
        Determines whether or not to display alerts and where to display them.
      </p>
      <p>
        This attribute accepts the following values:
      </p>
      <ul>
        <li><code>element</code>: Display alerts on the component. (This is the default).</li>
        <li><code>none</code>: Do not display alerts.</li>
        <li><code>window</code>: Display alerts on the window.</li>
      </ul>
      <p class="api-docs-warning">
        This attribute has no effect if the <code>production-mode</code> attribute has NOT been set.
      </p>
      <p class="api-docs-warning">
        If you set the value to <code>none</code> you will need to implement functionality for at least the confirm
        dialogues yourself (using the component events and methods).
        <br>
        <br>
        If you do not, any action that requires user confirmation (like clicking on a cancellation X button
        to terminate a connection) will simply do nothing.
        <br>
        <br>
        See <link-to-element for="examples">Examples</link-to-element> for more details.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-api-docs">api-docs:<span class="interface">boolean</span></h3>
      <p>
        Determines whether or not to include a Docs CTA in the header.
      </p>
      <p class="api-docs-warning">
        This attribute has no effect if the <code>production-mode</code> attribute has been set.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-empty-chat-placeholder">empty-chat-placeholder:<span class="interface">string</span></h3>
      <p>
        Gets or sets the placeholder for the chat. The default value is: "${defaultEmptyChatPlaceholder}".
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-force-dark-mode">force-dark-mode:<span class="interface">boolean</span></h3>
      <p>
        Setting this attribute ignores the operating system and/or user agent color scheme settings of the user and displays
        the component with its default dark mode color scheme.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-force-light-mode">force-light-mode:<span class="interface">boolean</span></h3>
      <p>
        Setting this attribute ignores the operating system and/or user agent color scheme settings of the user and displays
        the component with its default light mode color scheme.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-log-connection-info">log-connection-info:<span class="interface">boolean</span></h3>
      <p>
        Determines whether or not connection info is logged to the user agent console.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-max-incoming-media-streams-to-display">max-incoming-media-streams-to-display:<span class="interface">number</span></h3>
      <p>
        Gets or sets the maximum number of incoming media streams to display. The default value is: ${defaultMaxIncomingMediaStreams}.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-message-input-placeholder">message-input-placeholder:<span class="interface">string</span></h3>
      <p>
        Gets or sets the placeholder for the message input. The default value is: "${defaultMessageInputPlaceholder}".
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-production-mode">production-mode:<span class="interface">boolean</span></h3>
      <p>
        Setting this attribute removes SDP forms and API docs (the "Connect" and "Docs" CTAs) from the UI and enables
        access to the component's public methods. Once this attribute is set, unsetting it will have no effect.
      </p>
      <h3 class="api-docs__subcategory-item-name" id="api-docs-content-attribute-use-extended-borders">use-extended-borders:<span class="interface">boolean</span></h3>
      <p>
        Some color schemes will benefit from additional borders (or you may just prefer borders on everything).
        Either way, setting this attribute will add borders to every section, without you having to resort to any CSS hacks.
      </p>
    </section>
    <!--
    -----------
    Properties
    -----------
    -->
    <section class="api-docs__subcategory">
      <h2 class="api-docs__subcategory-title">Properties</h2>
      <h3 class="api-docs__subcategory-item-name">alerts:<span class="interface">'element'|'none'|'window'</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-alerts">alerts</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">apiDocs:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-api-docs">api-docs</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">emptyChatPlaceholder:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-empty-chat-placeholder">empty-chat-placeholder</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">forceDarkMode:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-force-dark-mode">force-dark-mode</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">forceLightMode:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-force-light-mode">force-light-mode</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">handle:<span class="interface">string</span> (readonly)</h3>
      <p>
        Returns the handle that was set either by the user or with the <code>setHandle()</code> method.
      </p>
      <p class="api-docs-warning">
        The <code>setHandle()</code> method can only be used if the <code>production-mode</code> attribute has been set.
      </p>
      <h3 class="api-docs__subcategory-item-name">iceServers:<span class="interface">RTCIceServer[]</span></h3>
      <p>
        Sets the value of the <code>iceServers</code> property of the <code>RTCConfiguration</code> to be used
        for new <code>RTCPeerConnections</code>. The default value is:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify(defaultICEServers, null, 2)}</pre>
      </p>
      <p class="api-docs-note">
        For privacy reasons, the <code>iceServers</code> getter always returns the default configuration.
      </p>
      <p class="api-docs-note">
        The default configuration (which uses <code>STUN</code> servers only) is suitable for connections
        between peers that are behind Non-symmetric NATs.
      </p>
      <p class="api-docs-warning">
        If either peer is behind a Symmetric NAT, you will need to include one or more <code>TURN</code>
        servers, like:
        <pre class="code-snippet" use-custom-scrollbars>${iceServersExampleCodeSnippet}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">logConnectionInfo:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-log-connection-info">log-connection-info</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">maxIncomingMediaStreamsToDisplay:<span class="interface">number</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-max-incoming-media-streams-to-display">max-incoming-media-streams-to-display</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">messageInputPlaceholder:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-message-input-placeholder">message-input-placeholder</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">productionMode:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-production-mode">production-mode</link-to-element>
      </p>
      <h3 class="api-docs__subcategory-item-name">useExtendedBorders:<span class="interface">boolean</span></h3>
      <p>
        See: <link-to-element for="api-docs-content-attribute-use-extended-borders">use-extended-borders</link-to-element>
      </p>
    </section>
    <!--
    -----------
    Methods
    -----------
    -->
    <section class="api-docs__subcategory">
      <h2 class="api-docs__subcategory-title">Methods</h2>
      <p class="api-docs-warning">
        These methods are available only when the <code>production-mode</code> attribute has been set.
      </p>
      <h3 class="api-docs__subcategory-item-name">setHandle(<span class="variable">handle</span>:<span class="interface">string</span>):<span class="interface">void</span></h3>
      <p>
        Sets the component's handle. Calling this method more than once has no effect.
      </p>
      <h3 class="api-docs__subcategory-item-name">getOfferForRemoteUser(<span class="variable">remoteUser</span>:<span class="interface">string</span>):<span class="interface">Promise&lt;RTCSessionDescription&gt;</span></h3>
      <p>
        Returns a <code>Promise</code> that resolves to a <code>RTCSessionDescription</code> to be passed to the
        <code>setOfferFromRemoteUser()</code> method on the remote user's <code>&lt;${localName}&gt;</code> component.
      </p>
      <h3 class="api-docs__subcategory-item-name">setOfferFromRemoteUser(<span class="variable">sessionDescriptionOffer</span>:<span class="interface">RTCSessionDescription</span>):<span class="interface">Promise&lt;RTCSessionDescription&gt;</span></h3>
      <p>
        Returns a <code>Promise</code> that resolves to a <code>RTCSessionDescription</code> to be passed to the
        <code>setAnswerFromRemoteUser()</code> method on the remote user's <code>&lt;${localName}&gt;</code> component.
      </p>
      <h3 class="api-docs__subcategory-item-name">setAnswerFromRemoteUser(<span class="variable">sessionDescriptionAnswer</span>:<span class="interface">RTCSessionDescription</span>):<span class="interface">Promise&lt;void&gt;</span></h3>
      <p>
        Opens a peer-to-peer connection with the answerer specified in the <code>sessionDescriptionAnswer</code>.
      </p>
      <h3 class="api-docs__subcategory-item-name">closeConnection(<span class="variable">remoteUser</span>:<span class="interface">string</span>):<span class="interface">void</span></h3>
      <p>
        Terminates the connection with the specified user.
      </p>
      <h3 class="api-docs__subcategory-item-name">deleteChatHistory(<span class="variable">remoteUser</span>:<span class="interface">string</span>|<span class="interface">undefined</span>):<span class="interface">void</span></h3>
      <p>
        Deletes all chat history with the specified user from local storage.
      </p>
      <p class="api-docs-warning">
        If this method is called without any parameters, ALL chat history for this component will be deleted from local storage.
      </p>
    </section>
    <!--
    -----------
    Events
    -----------
    -->
    <section class="api-docs__subcategory">
      <h2 class="api-docs__subcategory-title">Events</h2>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(dataChannelOpenEventType)}</h3>
      <p>
        Fired when a peer-to-peer connection is established.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ initiator: '<handle_of_data_channel_creator>', localUser: '<local_peer_handle>', remoteUser: '<remote_peer_handle>'},  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(dataChannelCloseEventType)}</h3>
      <p>
        Fired when a peer-to-peer connection is terminated.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ initiator: '<handle_of_user_that_terminated_the_connection>', localUser: '<local_peer_handle>', remoteUser: '<remote_peer_handle>'},  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(deleteChatHistoryEventType)}</h3>
      <p>
        Fired when a user requests to delete their local chat history with another user.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ initiator: '<handle_of_user_that_requested_to_delete_their_chat_history>', localUser: '<local_peer_handle>', remoteUser: '<remote_peer_handle>'},  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(disconnectUserRequestEventType)}</h3>
      <p>
        Fired when a disconnection request is triggered by the user.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ initiator: '<handle_of_user_that_requested_to_terminate_the_connection>', localUser: '<local_peer_handle>', remoteUser: '<remote_peer_handle>'},  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(fileTransferFailEventType)}</h3>
      <p>
        Fired when a file transfer fails.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ error: '<error_message>', file: '<file>', remoteUser: '<remote_peer_handle>'},  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(localHandleCopiedToClipboardEventType)}</h3>
      <p>
        Fired when the user clicks their handle in the info bar header.
      </p>
      <p class="api-docs-note">
        This event will only fire if the user handle was successfully copied to the clipboard.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ handle: '<user_handle>' },  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(mediaDeviceErrorEventType)}</h3>
      <p>
        Fired when a media device error occurs.
        (For example, if the toggle camera button is clicked but no camera is detected).
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ error: '<NotAllowedError|NotFoundError>' },  null, 2)}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">${createEventTypeMarkup(setHandleEventType)}</h3>
      <p>
        Fired when a user handle is set using the <code>setHandle()</code> method.
      </p>
      <p class="api-docs-warning">
        The <code>setHandle()</code> method can only be used if the <code>production-mode</code> attribute has been set.
      </p>
      <p>
        Event.detail:
        <pre class="code-snippet" use-custom-scrollbars>${JSON.stringify({ handle: '<user_handle>' },  null, 2)}</pre>
      </p>
    </section>
    <!--
    -----------
    Themeing
    -----------
    -->
    <section class="api-docs__subcategory">
      <h2 class="api-docs__subcategory-title">Themeing</h2>
      <p>
        The component has two color schemes, light and dark. Based on the user's operating system
        or user agent settings, the appropriate color scheme is automatically applied.
      </p>
      <p>
        You can override this behaviour if you wish and force a particular color scheme by using
        the <code>force-dark-mode</code> or <code>force-light-mode</code> content attributes.
      </p>
      <h3 class="api-docs__subcategory-item-name">CSS Variables</h3>
      <p>
        Both color schemes are comprised of just two background shades, which can be set using
        the following CSS variables:
        <pre class="code-snippet" use-custom-scrollbars>${cssVariables}</pre>
      </p>
      <p>
        Unless you are forcing a particular color scheme, you will likely want to set custom values
        for both light and dark color schemes.
      </p>
      <p>
        You can do this using the <code>prefers-color-scheme</code> CSS media feature.
      </p>
      <p>
        For example:
        <pre class="code-snippet" use-custom-scrollbars>${cssVariablesColorSchemeExampleCodeSnippet}</pre>
      </p>
      <h3 class="api-docs__subcategory-item-name">The "use-extended-borders" attribute</h3>
      <p>See: <link-to-element for="api-docs-content-attribute-use-extended-borders">use-extended-borders</link-to-element></p>
    </section>
    <!--
    -----------
    Examples
    -----------
    -->
    <section class="api-docs__subcategory" id="examples">
      <h2 class="api-docs__subcategory-title">Examples</h2>
      <h3 class="api-docs__subcategory-item-name">production-mode</h3>
      <p>
        These examples are for informational purposes and have been tested in Google Chrome and Mozilla Firefox only.
        They illustrate the connection flow and how to use the methods and events provided by the component.
      </p>
      <p>
        They are quite useful for gaining a practical understanding of the component mechanics.
      </p>
      <h3>html</h3>
      <pre class="code-snippet" use-custom-scrollbars>${productionModeExampleHTMLCodeSnippet}</pre>
      <h3>javascript (simple)</h3>
      <pre class="code-snippet" use-custom-scrollbars>${productionModeExampleJSCodeSnippetSimple}</pre>
      <h3>javascript (with events and in-built alerts turned off)</h3>
      <p class="api-docs-note">
        Unless you have alerts turned off (by setting the <code>alerts</code> attribute to <code>"none"</code>)
        it is unlikely you will need to listen to any of the component's events, except possibly the
        <code>${setHandleEventType}</code> event - which might be useful if you have a form for setting the user's
        handle in your app.
        <br>
        <br>
        (For example, you could use this event to disable or hide the form once a value for the handle has been set).
      </p>
      <pre class="code-snippet" use-custom-scrollbars>${productionModeExampleJSCodeSnippetWithEvents}</pre>
    </section>
  </section>
  `;
};
export { apiDocsTemplate };