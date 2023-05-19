import '../../dependencies/component-library/form-controls/x-button/index.js';
import '../../dependencies/component-library/form-controls/input-text/index.js';
import '../../dependencies/component-library/media-streams/index.js';
import '../../dependencies/component-library/x-chat/index.js';
import '../../dependencies/component-library/slide-in/index.js';
import '../../dependencies/component-library/x-details/index.js';
import { SafeDOMParser } from '../../modules/@zooduck/safe-dom-parser/dist/index.module.js';
import { WebComponent } from '../../modules/@zooduck/web-component-mixin/dist/index.module.js';
import { loadCSSStyleSheet } from './loadCSSStyleSheet.util.js';
import { ScreenShareFormValue, UserControlText } from './magicStrings.js';
import { alertService } from '../../dependencies/utils/alert-service/index.js';
import { ConnectionsService } from '../../dependencies/utils/connections-service/index.js';
import { useCustomScrollbars } from '../../dependencies/utils/use-custom-scrollbars/index.js';
import { DataChannelMessageType, sendDataChannelMessage } from '../../dependencies/utils/sendDataChannelMessage.util.js';
import { localStorageService } from '../../dependencies/utils/localStorageService.util.js';
import { MediaStreamService } from '../../dependencies/utils/MediaStreamService.util.js';
import { apiDocsTemplate } from './templates/api-docs/apiDocs.template.js';
import { formsUITemplate } from './templates/forms-ui/formsUI.template.js';
import { infoBarHeaderTemplate } from './templates/info-bar-header/infoBarHeader.template.js';
import { handleSelectorTemplate } from './templates/handle-selector/handleSelector.template.js';
import { localMediaStreamsTemplate } from './templates/local-media-streams/localMediaStreams.template.js';
import { dataChannelFileSender } from '../../dependencies/utils/dataChannelFileSender.util.js';
import { networkUtils } from '../../dependencies/utils/networkUtils.util.js';
import { wait } from '../../dependencies/utils/wait.util.js';
import { WaitTimeCalculator } from '../../dependencies/utils/WaitTimeCalculator.util.js';
import mediaStreamAudioOnlyPosterSVGDataImage from '../../assets/svg-data-image/media_stream_audio_only_poster.svg.js';
import mediaStreamErrorPosterTransparentSVGDataImage from '../../assets/svg-data-image/media_stream_error_poster_transparent.svg.js';
import { svgIconService } from '../../assets/svgIconService.util.js';
const globalStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../styles/global.css',
  jsFile: '../../styles/global.css.js'
});
const styleSheet = await loadCSSStyleSheet({
  cssFile: './chatapotamusP2PChatByZooduck.component.css',
  jsFile: './chatapotamusP2PChatByZooduck.component.css.js'
});
const variablesStyleSheet = await loadCSSStyleSheet({
  cssFile: '../../styles/variables.css',
  jsFile: '../../styles/variables.css.js'
});
await svgIconService.loadIcons([svgIconService.Icon.PAPERCLIP]);
class HTMLChatapotamusP2PChatByZooduckElement extends WebComponent {
  static LOCAL_NAME = 'chatapotamus-p2p-chat-by-zooduck';
  #DEFAULT_ALERTS = 'element';
  #DEFAULT_EMPTY_CHAT_PLACEHOLDER = 'For you, there is no Massage.';
  #DEFAULT_ICE_SERVERS = [
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];
  #DEFAULT_MAX_INCOMING_MEDIA_STREAMS = 10;
  #DEFAULT_MESSAGE_INPUT_PLACEHOLDER = 'Do you have for me... the Massage?';
  #MESSAGE_HISTORY_KEY_PREFIX = 'message_history#';
  #PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE = 'You must set the production-mode attribute to use this feature.';
  #VALID_HANDLE_PATTERN = /^\w{3,}#[a-z0-9]{8}\d{4}$/;
  #activeChatHandle;
  #connectionID;
  #connectionsClosedByUs = new Set();
  #connectionsService;
  #iceGatheringTimeSeconds;
  #iceServers;
  #isFileSendInProgress;
  #isProductionMode;
  #mediaStreamService;
  #natType;
  #remoteScreenShares = new Map();
  #resizeObserver;
  #xChatElements;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [variablesStyleSheet, globalStyleSheet, styleSheet];
    this.#mediaStreamService = new MediaStreamService();
    this.#connectionsService = new ConnectionsService(this.#mediaStreamService);
    this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
    this.#xChatElements = new Map();
    this.#xChatElements.set('__PLACEHOLDER__', this.#createXChatPlaceholder());
    this.#insertExternalResourceLinks([
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto+Flex:wdth,wght@25..151,100..1000&display=swap' }
    ]);
    networkUtils.getNATType().then((natType) => {
      this.#natType = natType;
      this.ready().then(() => {
        this.shadowRoot.getElementById('info-bar-nat-type').textContent = this.#natType === 'symmetric'
          ? 'SYMTC'
          : 'N-SYMTC';
      });
    });
    this.#displayICEGatheringTime();
    this.#addEventListeners();
    this.#addObservers();
  }
  static get observedAttributes() {
    return [
      'alerts',
      'api-docs',
      'empty-chat-placeholder',
      'force-dark-mode',
      'force-light-mode',
      'log-connection-info',
      'max-incoming-media-streams-to-display',
      'message-input-placeholder',
      'production-mode',
      'use-extended-borders'
    ];
  }
  static get Alerts() {
    return {
      ELEMENT: 'element',
      NONE: 'none',
      WINDOW: 'window'
    };
  }
  get Alerts() {
    return this.constructor.Alerts;
  }
  static get EventDict() {
    return {
      DATA_CHANNEL_CLOSE: this.#createEventTypeWithNamespace('datachannelclose'),
      DATA_CHANNEL_OPEN: this.#createEventTypeWithNamespace('datachannelopen'),
      DELETE_CHAT_HISTORY: this.#createEventTypeWithNamespace('deletechathistory'),
      DISCONNECT_USER_REQUEST: this.#createEventTypeWithNamespace('disconnectuserrequest'),
      FILE_TRANSFER_FAIL: this.#createEventTypeWithNamespace('filetransferfail'),
      LOCAL_HANDLE_COPIED_TO_CLIPBOARD: this.#createEventTypeWithNamespace('localhandlecopiedtoclipboard'),
      MEDIA_DEVICE_ERROR: this.#createEventTypeWithNamespace('mediadeviceerror'),
      SET_HANDLE: this.#createEventTypeWithNamespace('sethandle')
    };
  }
  static #createEventTypeWithNamespace(eventType) {
    return this.LOCAL_NAME.replace(/-/g, '') + eventType;
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }
    switch (attributeName) {
      case 'api-docs':
        this.ready().then(this.#updateUI.bind(this));
        break;
      case 'empty-chat-placeholder':
        this.ready().then(() => {
          this.shadowRoot.getElementById('chat-messages').emptyChatPlaceholder = newValue === null
            ? this.#DEFAULT_EMPTY_CHAT_PLACEHOLDER
            : newValue;
        });
        break;
      case 'max-incoming-media-streams-to-display':
        this.ready().then(() => {
          this.shadowRoot.getElementById('incoming-media-streams').maxMediaStreams = newValue === null
            ? this.#DEFAULT_MAX_INCOMING_MEDIA_STREAMS
            : newValue;
        });
        break;
      case 'message-input-placeholder':
        this.ready().then(() => {
          this.shadowRoot.getElementById('message-input').placeholder = newValue === null
            ? this.#DEFAULT_MESSAGE_INPUT_PLACEHOLDER
            : newValue;
        });
        break;
      case 'production-mode':
        if (newValue === null || this.#isProductionMode) {
          return;
        }
        this.#isProductionMode = true;
        this.ready().then(this.#updateUI.bind(this));
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.render();
    useCustomScrollbars.withDocument(this.shadowRoot);
    this.#mediaStreamService.display = this.shadowRoot.getElementById('local-media-streams-display');
    this.isReady = true;
  }
  get alerts() {
    if (!this.#isStandaloneMode && Object.values(this.Alerts).includes(this.getAttribute('alerts'))) {
      return this.getAttribute('alerts');
    }
    return this.#DEFAULT_ALERTS;
  }
  set alerts(value) {
    this.setAttribute('alerts', value);
  }
  get apiDocs() {
    return this.hasAttribute('api-docs') && this.#isStandaloneMode;
  }
  set apiDocs(value) {
    this.toggleAttribute('api-docs', value);
  }
  get emptyChatPlaceholder() {
    return this.getAttribute('empty-chat-placeholder') || this.#DEFAULT_EMPTY_CHAT_PLACEHOLDER;
  }
  set emptyChatPlaceholder(value) {
    this.setAttribute('empty-chat-placeholder', value);
  }
  get forceDarkMode() {
    return this.hasAttribute('force-dark-mode');
  }
  set forceDarkMode(value) {
    this.toggleAttribute('force-dark-mode', value);
  }
  get forceLightMode() {
    return this.hasAttribute('force-light-mode');
  }
  set forceLightMode(value) {
    this.toggleAttribute('force-light-mode', value);
  }
  get handle() {
    return this.#connectionID;
  }
  get iceServers() {
    return this.#DEFAULT_ICE_SERVERS;
  }
  set iceServers(value) {
    this.#iceServers = value;
    this.#displayICEGatheringTime();
  }
  get logConnectionInfo() {
    return this.hasAttribute('log-connection-info');
  }
  set logConnectionInfo(value) {
    this.toggleAttribute('log-connection-info', value);
  }
  get maxIncomingMediaStreamsToDisplay() {
    return parseInt(this.getAttribute('max-incoming-media-streams-to-display'), 10) || this.#DEFAULT_MAX_INCOMING_MEDIA_STREAMS;
  }
  set maxIncomingMediaStreamsToDisplay(value) {
    this.setAttribute('max-incoming-media-streams-to-display', value);
  }
  get messageInputPlaceholder() {
    return this.getAttribute('message-input-placeholder') || this.#DEFAULT_MESSAGE_INPUT_PLACEHOLDER;
  }
  set messageInputPlaceholder(value) {
    this.setAttribute('message-input-placeholder', value);
  }
  get productionMode() {
    return this.#isProductionMode;
  }
  set productionMode(value) {
    this.toggleAttribute('production-mode', value);
  }
  get useExtendedBorders() {
    return this.hasAttribute('use-extended-borders');
  }
  set useExtendedBorders(value) {
    this.toggleAttribute('use-extended-borders', value);
  }
  get #alertTitle() {
    return this.#isStandaloneMode ? this.localName : '';
  }
  get #isStandaloneMode() {
    return !this.#isProductionMode;
  }
  get #mobileBreakpoint() {
    return parseFloat(getComputedStyle(this).getPropertyValue('--_breakpoint-mobile'));
  }
  deleteChatHistory(remoteUser) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    this.#removeChatHistory(remoteUser);
  }
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(this.#createContent());
    this.hasRendered = true;
  }
  closeConnection(remoteUser) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    this.#closeConnection(remoteUser);
  }
  async getOfferForRemoteUser(remoteUser) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    return this.#getSDPOfferForRemoteUser(remoteUser);
  }
  setAnswerFromRemoteUser(sessionDescriptionAnswer) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    return this.#setSDPAnswerFromRemoteUser(sessionDescriptionAnswer);
  };
  setHandle(value) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    if (this.handle) {
      throw new Error(`Handle already saved as "${this.handle}".`);
    }
    this.#connectionID = value;
    this.shadowRoot.getElementById('info-bar-handle').textContent = this.handle;
    this.sendCustomEvent(this.constructor.EventDict.SET_HANDLE, {
      detail: {
        handle: this.handle
      }
    });
  }
  async setOfferFromRemoteUser(sessionDescriptionOffer) {
    if (!this.#isProductionMode) {
      throw new Error(this.#PRODUCTION_MODE_REQUIRED_ERROR_MESSAGE);
    }
    return this.#setSDPOfferFromRemoteUser(sessionDescriptionOffer);
  }
  onAPIDocsSlideInClose() {
    this.shadowRoot.getElementById('toggle-api-docs-button').toggle(false);
    this.shadowRoot.getElementById('toggle-forms-ui-button').disabled = false;
  }
  onAPIDocsSlideInOpen() {
    this.shadowRoot.getElementById('toggle-api-docs-button').toggle(true);
    this.shadowRoot.getElementById('toggle-forms-ui-button').disabled = true;
  }
  async onCreateSDPOfferFormSubmit(event) {
    event.preventDefault();
    if (!this.#connectionID) {
      return;
    }
    const { target: form } = event;
    const remoteHandleInput = form.elements.namedItem('remote-handle');
    const remoteHandle = remoteHandleInput.value;
    if (!remoteHandle || remoteHandle === this.#connectionID) {
      return;
    }
    if (this.#connectionsService.hasActiveConnection(remoteHandle)) {
      return console.error(`Unable to create SDP offer for ${remoteHandle}. You already have an active connection with this user.`);
    }
    remoteHandleInput.value = '';
    let sdpOffer;
    let connectionsServiceError;
    try {
      sdpOffer = await this.#getSDPOfferForRemoteUser(remoteHandle);
    } catch (error) {
      connectionsServiceError = error;
    }
    if (connectionsServiceError) {
      throw connectionsServiceError;
    }
    await alertService.alert([
      `A SDP offer for ${remoteHandle} has been saved to the clipboard.`,
      `Share this with ${remoteHandle} so they can generate a SDP answer for you.`
    ], {
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: this.#alertTitle
    });
    navigator.clipboard.writeText(JSON.stringify(sdpOffer));
  }
  async onDeleteChatHistoryRequest(event) {
    const { remoteHandle } = event.detail;
    this.sendCustomEvent(this.constructor.EventDict.DELETE_CHAT_HISTORY, {
      detail: {
        initiator: this.#connectionID,
        localUser: this.#connectionID,
        remoteUser: remoteHandle
      }
    });
    if (this.alerts === this.Alerts.NONE) {
      return;
    }
    const shouldDeleteChatHistory = await alertService.confirm([
      `Are you sure you want to destroy your chat history with ${remoteHandle} on this device?`,
      `Destroying your chat history will not remove your messages from ${remoteHandle}'s chat history.`
    ], {
      actionType: 'warning',
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: 'Warning! This action is irreversable.'
    });
    if (!shouldDeleteChatHistory) {
      return;
    }
    this.#removeChatHistory(remoteHandle);
  }
  async onDisconnectUserButtonClick(event) {
    const { connectionId: connectionID } = event.target.dataset;
    this.sendCustomEvent(this.constructor.EventDict.DISCONNECT_USER_REQUEST, {
      detail: {
        initiator: this.#connectionID,
        localUser: this.#connectionID,
        remoteUser: connectionID
      }
    });
    if (this.alerts === this.Alerts.NONE) {
      return;
    }
    const disconnectUser = await alertService.confirm(`Terminate connection with ${connectionID}?`, {
      actionType: 'warning',
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: this.#alertTitle
    });
    if (!disconnectUser) {
      return;
    }
    this.#closeConnection(connectionID);
  }
  onFormsUISlideInClose() {
    this.shadowRoot.getElementById('toggle-forms-ui-button').toggle(false);
    if (!this.apiDocs) {
      return;
    }
    this.shadowRoot.getElementById('toggle-api-docs-button').disabled = false;
  }
  onFormsUISlideInOpen() {
    this.shadowRoot.getElementById('toggle-forms-ui-button').toggle(true);
    if (!this.apiDocs) {
      return;
    }
    this.shadowRoot.getElementById('toggle-api-docs-button').disabled = true;
  }
  onIncomingMediaStreamsDetailsClose() {
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  onIncomingMediaStreamsDetailsOpen() {
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  async onInfoBarTitleClick() {
    if (!this.handle) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.handle);
      this.sendCustomEvent(this.constructor.EventDict.LOCAL_HANDLE_COPIED_TO_CLIPBOARD, {
        detail: {
          handle: this.handle
        }
      });
      if (this.alerts !== this.Alerts.NONE) {
        alertService.alert(`Your handle has been copied to the clipboard.`, {
          onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
          title: this.#alertTitle
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  onLocalMediaStreamsDisplayClick(event) {
    const { target: localMediaStreamsDisplayElement } = event;
    const { enabledTracks, isScreenBeingShared } = this.#mediaStreamService;
    if (enabledTracks.length || isScreenBeingShared) {
      localMediaStreamsDisplayElement.requestFullscreen();
    }
  }
  onMessageFormSubmit(event) {
    event.preventDefault();
    if (!this.#activeChatHandle) {
      return;
    }
    const { target: form } = event;
    const formData = new FormData(form);
    const message = formData.get('message');
    if (message.trim() === '') {
      return;
    }
    const chatMessagesElement = this.shadowRoot.getElementById('chat-messages');
    const { channel } = this.#connectionsService.getConnection(this.#activeChatHandle);
    sendDataChannelMessage({
      fromID: this.#connectionID,
      message: message,
      toID: this.#activeChatHandle,
      type: DataChannelMessageType.MESSAGE,
      unix: Date.now()
    }, channel).then((data) => {
      const { fromID, message, toID, unix } = data;
      const messageData = {
        fromID: fromID,
        message: message,
        toID: toID,
        unix: unix,
        messageType: 'message',
        origin: 'local',
        type: 'text'
      };
      chatMessagesElement.addMessage(messageData);
      this.#saveChatToLocalStorage(messageData, toID);
      form.reset();
    }).catch((error) => {
      console.error(error);
      chatMessagesElement.addMessage({
        message: error.message,
        messageType: 'info',
        type: 'text',
        unix: Date.now()
      });
    });
  }
  onMessageInputKeyDown(event) {
    const { code, key, keyCode, shiftKey, target: messageInput } = event;
    const isEnterKey = code === 'Enter' || key === 'Enter' || keyCode === 13;
    if (isEnterKey && !shiftKey && event.composedPath()[0] instanceof HTMLTextAreaElement) {
      event.preventDefault();
      messageInput.form.requestSubmit();
    }
  }
  onScreenShareFormSubmit(event) {
    event.preventDefault();
    const { target: form } = event;
    const screenActionInput = form.elements.namedItem('screen-share-action');
    const connectionsArray = this.#connectionsService.getActiveConnections().map(({ connection }) => {
      return connection;
    });
    switch (screenActionInput.value) {
      case ScreenShareFormValue.SHARE_SCREEN:
        this.#mediaStreamService.startSharingScreen().then(() => {
          this.#mediaStreamService.publishScreen(connectionsArray);
        }).catch((error) => {
          this.sendCustomEvent(this.constructor.EventDict.MEDIA_DEVICE_ERROR, {
            detail: {
              error: error
            }
          });
          if (this.alerts !== this.Alerts.NONE) {
            alertService.alert(error, {
              onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
              title: this.#alertTitle
            });
          }
        });
        break;
      case ScreenShareFormValue.STOP_SHARING_SCREEN:
        this.#mediaStreamService.stopSharingScreen(connectionsArray);
        break;
      default:
        break;
    }
  }
  onScreenShareFormSubmitButtonClick(event) {
    event.preventDefault();
  }
  onSelectHandleButtonClick(event) {
    const { target: button } = event;
    this.#activeChatHandle = button.value;
    this.#setActiveHandleInDOM(button.closest('.handles__list-item'));
    this.shadowRoot.getElementById('chat-messages').replaceWith(this.#xChatElements.get(this.#activeChatHandle));
    const chatHistory = JSON.parse(localStorageService.getItem(`${this.#MESSAGE_HISTORY_KEY_PREFIX}${this.#connectionID}|${this.#activeChatHandle}`));
    const xChatElement = this.#xChatElements.get(this.#activeChatHandle);
    if (xChatElement.isInitialised) {
      return;
    }
    xChatElement.init(chatHistory);
  }
  onSendFileButtonClick() {
    if (!this.#activeChatHandle || this.#isFileSendInProgress) {
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      const { name, size, type } = file;
      const { channel } = this.#connectionsService.getConnection(this.#activeChatHandle);
      const toID = this.#activeChatHandle;
      sendDataChannelMessage({
        file: {
          name: name,
          size: size,
          type: type
        },
        fromID: this.#connectionID,
        toID: toID,
        type: DataChannelMessageType.FILE_INFO,
        unix: Date.now()
      }, channel);
      const fileTransferProgressElement = this.shadowRoot.getElementById('file-transfer-progress');
      fileTransferProgressElement.label = `Preparing file: ${name}`;
      fileTransferProgressElement.totalBytes = size;
      fileTransferProgressElement.bytesLoaded = 0;
      dataChannelFileSender.addEventListener(dataChannelFileSender.EventDict.FILE_CHUNK_SEND, (event) => {
        const { bytesSent, totalBytes } = event.detail;
        fileTransferProgressElement.label = `Sending file: ${name}`;
        fileTransferProgressElement.totalBytes = totalBytes;
        fileTransferProgressElement.bytesLoaded = bytesSent;
      });
      dataChannelFileSender.send(file, channel).then(() => {
        const fileData = {
          fromID: this.#connectionID,
          file: {
            name: name,
            size: size,
            type: type
          },
          dataURL: URL.createObjectURL(new Blob([file], { type: type })),
          origin: 'local',
          toID: toID,
          type: 'file',
          unix: Date.now()
        };
        this.#xChatElements.get(this.#activeChatHandle).addFile(fileData);
        this.#saveChatToLocalStorage(fileData, this.#activeChatHandle);
      }).catch((error) => {
        console.error(error);
        sendDataChannelMessage({
          error: error.message,
          file: {
            name: name,
            size: size,
            type: type
          },
          fromID: this.#connectionID,
          type: DataChannelMessageType.FILE_TRANSFER_FAIL
        }, channel);
        this.#updateFileTransferProgressIndicatorOnFailedFileTransfer();
        this.sendCustomEvent(this.constructor.EventDict.FILE_TRANSFER_FAIL, {
          detail: {
            error: error.message,
            file: file,
            remoteUser: toID
          }
        });
        if (this.alerts !== this.Alerts.NONE) {
          alertService.alert([`File ${name} could not be sent to ${toID}.`, error], {
            onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
            title: this.#alertTitle
          });
        }
      }).finally(() => {
        this.#isFileSendInProgress = false;
      });
      this.#isFileSendInProgress = true;
    });
    input.click();
  }
  onSessionDescriptionMultilineInputKeyDown(event) {
    const { code, key, keyCode } = event;
    const isEnterKey = code === 'Enter' || key === 'Enter' || keyCode === 13;
    if (isEnterKey) {
      event.preventDefault();
      event.target.form.requestSubmit();
    }
  }
  onSetHandleFormSubmit(event) {
    event.preventDefault();
    if (this.#connectionID) {
      return;
    }
    const { target: form } = event;
    const handleInputElement = form.elements.namedItem('handle');
    const handle = handleInputElement.value.trim();
    if (!handle || this.handle) {
      return;
    }
    if (this.#VALID_HANDLE_PATTERN.test(handle)) {
      this.#setHandleEnteredByUser(handle);
      return;
    }
    const uniqueHandle = handle.replace(/#/g, '') + '#' + crypto.randomUUID().substring(0, 8) + Date.now().toString().slice(-4);
    if (!this.#VALID_HANDLE_PATTERN.test(uniqueHandle)) {
      throw new Error(`${handle} is not a valid handle.`);
    }
    this.#setHandleEnteredByUser(uniqueHandle);
  }
  async onSetSDPAnswerFormSubmit(event) {
    event.preventDefault();
    if (!this.#connectionID) {
      return;
    }
    const { target: form } = event;
    const sdpAnswerInput = form.elements.namedItem('sdp-answer');
    let sdpAnswer;
    try {
      sdpAnswer = JSON.parse(sdpAnswerInput.value.trim());
    } catch (error) {
      throw new Error(`Expected RTCSessionDescription as JSON, got:\n-------\n${sdpAnswerInput.value.trim()}\n-------\ninstead.`);
    }
    sdpAnswerInput.value = '';
    try {
      await this.#setSDPAnswerFromRemoteUser(sdpAnswer);
    } catch (error) {
      console.error(error);
      alertService.alert(error, {
        onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
        title: this.#alertTitle
      });
    }
  }
  async onSetSDPOfferFormSubmit(event) {
    event.preventDefault();
    if (!this.#connectionID) {
      return;
    }
    const { target: form } = event;
    const sdpOfferInput = form.elements.namedItem('sdp-offer');
    let sdpOffer;
    try {
      sdpOffer = JSON.parse(sdpOfferInput.value.trim());
    } catch (error) {
      throw new Error(`Expected RTCSessionDescription as JSON, got:\n-------\n${sdpOfferInput.value.trim()}\n-------\ninstead.`);
    }
    const remoteHandle = this.#connectionsService.getOffererFromSessionDescription(sdpOffer);
    if (!remoteHandle) {
      return;
    }
    if (this.#connectionsService.hasActiveConnection(remoteHandle)) {
      return console.error(`Unable to set SDP offer from ${remoteHandle}. An active connection between ${this.handle} and ${remoteHandle} already exists.`);
    }
    sdpOfferInput.value = '';
    this.#connectionsService.addAnswererConnection(
      this.#connectionID,
      remoteHandle,
      this.config
    );
    const sdpAnswer = await this.#setSDPOfferFromRemoteUser(sdpOffer);
    await alertService.alert([
      `A SDP answer for ${remoteHandle} has been saved to the clipboard.`,
      `Share this with ${remoteHandle} so they can open a direct peer-to-peer connection with you.`
    ], {
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: this.#alertTitle
    });
    navigator.clipboard.writeText(JSON.stringify(sdpAnswer));
    this.shadowRoot.getElementById('forms-ui-slide-in').open = false;
  }
  onToggleAPIDocsButtonClick(event) {
    event.preventDefault();
    this.shadowRoot.getElementById('api-docs-slide-in').toggleAttribute('open');
  }
  onToggleCameraButtonClick(event) {
    const { target: toggleCameraButton } = event;
    const connectionsArray = this.#connectionsService.getActiveConnections().map(({ connection }) => {
      return connection;
    });
    switch (toggleCameraButton.toggleState) {
      case customElements.get('x-button').ToggleState.OFF:
        this.#mediaStreamService.connectCamera().then(() => {
          this.#mediaStreamService.publishCamera(connectionsArray);
        }).catch(async (error) => {
          this.sendCustomEvent(this.constructor.EventDict.MEDIA_DEVICE_ERROR, {
            detail: {
              error: error
            }
          });
          if (this.alerts !== this.Alerts.NONE) {
            await alertService.alert(error, {
              onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
              title: this.#alertTitle
            });
          }
          toggleCameraButton.toggle(false);
        });
        break;
      case customElements.get('x-button').ToggleState.ON:
        this.#mediaStreamService.disableCamera();
        break;
      default:
        break;
    }
  }
  onToggleFormsButtonClick(event) {
    event.preventDefault();
    if (this.#connectionID) {
      this.#enableSDPFormButtons();
    }
    this.shadowRoot.getElementById('forms-ui-slide-in').toggleAttribute('open');
  }
  onToggleMicrophoneButtonClick(event) {
    const { target: toggleMicrophoneButton } = event;
    const connectionsArray = this.#connectionsService.getActiveConnections().map(({ connection }) => {
      return connection;
    });
    switch (toggleMicrophoneButton.toggleState) {
      case customElements.get('x-button').ToggleState.OFF:
        this.#mediaStreamService.connectMicrophone().then(() => {
          this.#mediaStreamService.publishMicrophone(connectionsArray);
        }).catch(async (error) => {
          this.sendCustomEvent(this.constructor.EventDict.MEDIA_DEVICE_ERROR, {
            detail: {
              error: error
            }
          });
          if (this.alerts !== this.Alerts.NONE) {
            await alertService.alert(error, {
              onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
              title: this.#alertTitle
            });
          }
          toggleMicrophoneButton.toggle(false);
        });
        break;
      case customElements.get('x-button').ToggleState.ON:
        this.#mediaStreamService.disableMicrophone();
        break;
      default:
        break;
    }
  }
  #onCameraTrackDisable(event) {
    const { stream } = event.detail;
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamID: stream.id,
        type: DataChannelMessageType.CAMERA_TRACK_DISABLE
      }, channel);
    });
  }
  #onCameraTrackEnable(event) {
    const { stream } = event.detail;
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamID: stream.id,
        type: DataChannelMessageType.CAMERA_TRACK_ENABLE
      }, channel);
    });
  }
  #onConnectionInfo(event) {
    if (!this.logConnectionInfo) {
      return;
    }
    console.log(...event.detail.log);
  }
  async #onDataChannelClose(event) {
    const { remoteConnectionID } = event.detail;
    const { connection, incomingMediaStreams } = this.#connectionsService.getConnection(remoteConnectionID);
    const connectionClosedByUs = this.#connectionsClosedByUs.has(connection);
    this.#updateConnectingInfo({ isConnecting: false });
    this.sendCustomEvent(this.constructor.EventDict.DATA_CHANNEL_CLOSE, {
      detail: {
        initiator: connectionClosedByUs ? this.#connectionID : remoteConnectionID,
        localUser: this.#connectionID,
        remoteUser: remoteConnectionID
      }
    });
    if (!connectionClosedByUs && this.alerts !== this.Alerts.NONE) {
      await alertService.alert(`Connection terminated by ${remoteConnectionID}.`, {
        onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
        title: this.#alertTitle
      });
    }
    this.shadowRoot.getElementById('incoming-media-streams').removeDisplay(remoteConnectionID);
    this.#updateIncomingMediaStreamsDetailsSummary();
    this.#removeDisconnectedUserFromHandlesList(remoteConnectionID);
    incomingMediaStreams.clear();
  }
  #onDataChannelMessage(event) {
    const { fromID } = event.detail;
    const messageData = {
      ...event.detail,
      origin: 'remote',
      type: 'text'
    };
    this.#xChatElements.get(fromID).addMessage(messageData);
    this.#saveChatToLocalStorage(messageData, fromID);
  }
  async #onDataChannelOpen(event) {
    const { channelOwner, remoteConnectionID } = event.detail;
    if (!remoteConnectionID) {
      return;
    }
    this.#updateConnectingInfo({ isConnecting: false });
    this.sendCustomEvent(this.constructor.EventDict.DATA_CHANNEL_OPEN, {
      detail: {
        initiator: channelOwner,
        localUser: this.#connectionID,
        remoteUser: remoteConnectionID
      }
    });
    if (!this.#xChatElements.has(remoteConnectionID)) {
      const xChatElement =  this.#createXChatInstance(remoteConnectionID);
      const { EventDict: XChatEvent } = customElements.get('x-chat');
      xChatElement.addEventListener(XChatEvent.ALL_MESSAGES_READ, this.#onXChatAllMessagesRead.bind(this));
      xChatElement.addEventListener(XChatEvent.MESSAGE_READ, this.#onXChatMessageRead.bind(this));
      xChatElement.addEventListener(XChatEvent.NEW_MESSAGE, this.#onXChatNewMessage.bind(this));
      this.#xChatElements.set(remoteConnectionID, xChatElement);
    }
    this.#addUserToHandlesList(remoteConnectionID);
    if (this.alerts === this.Alerts.NONE) {
      return;
    }
    await alertService.alert(`Connection to ${remoteConnectionID} established!`, {
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: this.#alertTitle
    });
    if (!this.#isStandaloneMode) {
      return;
    }
    this.shadowRoot.getElementById('forms-ui-slide-in').open = false;
  }
  #onMicrophoneTrackDisable() {
    this.shadowRoot.getElementById('local-media-streams-display').poster = mediaStreamErrorPosterTransparentSVGDataImage;
  }
  #onMicrophoneTrackEnable(event) {
    const { stream } = event.detail;
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamID: stream.id,
        type: DataChannelMessageType.MICROPHONE_TRACK_ENABLE
      }, channel);
    });
    this.shadowRoot.getElementById('local-media-streams-display').poster = mediaStreamAudioOnlyPosterSVGDataImage;
  }
  #onRemoteCameraTrackDisable(event) {
    const { author } = event.detail;
    this.shadowRoot.getElementById('incoming-media-streams').clearDisplay(author);
  }
  #onRemoteCameraTrackEnable(event) {
    const { author, mediaStreamID } = event.detail;
    const { incomingMediaStreams } = this.#connectionsService.getConnection(author);
    if (!incomingMediaStreams.has(mediaStreamID)) {
      return;
    }
    if (this.#remoteScreenShares.has(author)) {
      return;
    }
    const { stream: cameraStream } = incomingMediaStreams.get(mediaStreamID);
    this.shadowRoot.getElementById('incoming-media-streams').attachMediaStream(author, cameraStream);
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  #onRemoteFileChunkReceived(event) {
    const { bytesLoaded, file, fromID } = event.detail;
    if (this.#activeChatHandle !== fromID) {
      return;
    }
    const fileTransferProgressElement = this.shadowRoot.getElementById('file-transfer-progress');
    fileTransferProgressElement.label = `Receiving file: ${file.name}`;
    fileTransferProgressElement.totalBytes = file.size;
    fileTransferProgressElement.bytesLoaded = bytesLoaded;
  }
  #onRemoteFileReceived(event) {
    const { dataURL, fromID, file, toID, unix } = event.detail;
    const fileData = {
      dataURL: dataURL,
      fromID: fromID,
      file: file,
      origin: 'remote',
      toID: toID,
      type: 'file',
      unix: unix
    };
    this.#xChatElements.get(fromID).addFile(fileData);
    this.#saveChatToLocalStorage(fileData, fromID);
  }
  #onRemoteFileTransferFail(event) {
    const { error, file, fromID } = event.detail;
    if (this.#activeChatHandle !== fromID) {
      return;
    }
    this.#updateFileTransferProgressIndicatorOnFailedFileTransfer();
    this.sendCustomEvent(this.constructor.EventDict.FILE_TRANSFER_FAIL, {
      detail: {
        error: error,
        file: file,
        remoteUser: fromID
      }
    });
  }
  #onRemoteFileTransferStart(event) {
    const { file, fromID } = event.detail;
    if (this.#activeChatHandle !== fromID) {
      return;
    }
    const fileTransferProgressElement = this.shadowRoot.getElementById('file-transfer-progress');
    fileTransferProgressElement.label = `Awaiting file: ${file.name}`;
    fileTransferProgressElement.totalBytes = file.size;
    fileTransferProgressElement.bytesLoaded = 0;
  }
  #onRemoteMicrophoneTrackEnable(event) {
    const { author, mediaStreamID } = event.detail;
    const { incomingMediaStreams } = this.#connectionsService.getConnection(author);
    if (!incomingMediaStreams.has(mediaStreamID)) {
      return;
    }
    if (this.#remoteScreenShares.has(author)) {
      return;
    }
    const { stream: microphoneStream } = incomingMediaStreams.get(mediaStreamID);
    this.shadowRoot.getElementById('incoming-media-streams').attachMediaStream(author, microphoneStream);
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  #onRemoteScreenShare(event) {
    const { author, mediaStreamID } = event.detail;
    const { stream: screenShareMediaStream } = this.#connectionsService.getConnection(author).incomingMediaStreams.get(mediaStreamID);
    this.shadowRoot.getElementById('incoming-media-streams').attachMediaStream(author, screenShareMediaStream);
    this.#remoteScreenShares.set(author, screenShareMediaStream);
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  #onRemoteScreenShareEnd(event) {
    const { author } = event.detail;
    this.shadowRoot.getElementById('incoming-media-streams').clearDisplay(author);
    this.#remoteScreenShares.delete(author);
    const lastMediaStreamWithEnabledTracks = this.#getLastIncomingMediaStreamWithEnabledTracks(author);
    if (lastMediaStreamWithEnabledTracks) {
      this.shadowRoot.getElementById('incoming-media-streams').attachMediaStream(author, lastMediaStreamWithEnabledTracks);
    } else {
      this.shadowRoot.getElementById('incoming-media-streams').removeDisplay(author);
    }
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  #onRemoteUserMediaTracksDisable(event) {
    const { author } = event.detail;
    if (this.#hasConnectionGotIncomingMediaStreamsWithEnabledTracks(author)) {
      return;
    }
    this.shadowRoot.getElementById('incoming-media-streams').removeDisplay(author);
    this.#updateIncomingMediaStreamsDetailsSummary();
  }
  #onResize() {
    this.#setMaxContentHeight();
    this.#setMaxHeightForSlideInContent();
    this.#updateLocalMediaStreamsControlButtons();
  }
  #onScreenShare(event) {
    const { mediaStreamID } = event.detail;
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamID: mediaStreamID,
        type: DataChannelMessageType.SCREEN_SHARE
      }, channel);
    });
    this.#setScreenFormValue(ScreenShareFormValue.STOP_SHARING_SCREEN);
  }
  #onScreenShareEnd(event) {
    const { mediaStreamID } = event.detail;
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamID: mediaStreamID,
        type: DataChannelMessageType.SCREEN_SHARE_END
      }, channel);
    });
    this.#setScreenFormValue(ScreenShareFormValue.SHARE_SCREEN);
  }
  #onUserMediaTracksDisable(event) {
    const { mediaStreams } = event.detail;
    const mediaStreamIDs = mediaStreams.map((mediaStream) => {
      return mediaStream.id;
    });
    this.#connectionsService.getActiveConnections().forEach(({ channel }) => {
      sendDataChannelMessage({
        author: this.#connectionID,
        mediaStreamIDs: JSON.stringify(mediaStreamIDs),
        type: DataChannelMessageType.USER_MEDIA_TRACKS_DISABLE
      }, channel);
    });
  }
  #onXChatAllMessagesRead(event) {
    const { sender } = event.detail;
    const handleListItemToUpdate = this.shadowRoot.getElementById(`handles-list-item-${sender}`);
    if (!handleListItemToUpdate) {
      return;
    }
    handleListItemToUpdate.querySelector('.handles__list-item-new-messages-counter').textContent = '';
  }
  #onXChatMessageRead(event) {
    const { sender, unreadMessages } = event.detail;
    const handleListItemToUpdate = this.shadowRoot.getElementById(`handles-list-item-${sender}`);
    if (!handleListItemToUpdate) {
      return;
    }
    handleListItemToUpdate.querySelector('.handles__list-item-new-messages-counter').textContent = unreadMessages || '';
  }
  #onXChatNewMessage(event) {
    const { sender, unreadMessages } = event.detail;
    const handleListItemToUpdate = this.shadowRoot.getElementById(`handles-list-item-${sender}`);
    if (!handleListItemToUpdate) {
      return;
    }
    handleListItemToUpdate.querySelector('.handles__list-item-new-messages-counter').textContent = unreadMessages;
  }
  #addEventListeners() {
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.CONNECTION_INFO, this.#onConnectionInfo.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.DATA_CHANNEL_CLOSE, this.#onDataChannelClose.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.DATA_CHANNEL_MESSAGE, this.#onDataChannelMessage.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.DATA_CHANNEL_OPEN, this.#onDataChannelOpen.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_FILE_RECEIVED, this.#onRemoteFileReceived.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_FILE_CHUNK_RECEIVED, this.#onRemoteFileChunkReceived.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_FILE_TRANSFER_FAIL, this.#onRemoteFileTransferFail.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_FILE_TRANSFER_START, this.#onRemoteFileTransferStart.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.CAMERA_TRACK_DISABLE, this.#onCameraTrackDisable.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.CAMERA_TRACK_ENABLE, this.#onCameraTrackEnable.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.MICROPHONE_TRACK_DISABLE, this.#onMicrophoneTrackDisable.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.MICROPHONE_TRACK_ENABLE, this.#onMicrophoneTrackEnable.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.SCREEN_SHARE, this.#onScreenShare.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.SCREEN_SHARE_END, this.#onScreenShareEnd.bind(this));
    this.#mediaStreamService.addEventListener(MediaStreamService.EventDict.USER_MEDIA_TRACKS_DISABLE, this.#onUserMediaTracksDisable.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_CAMERA_TRACK_DISABLE, this.#onRemoteCameraTrackDisable.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_CAMERA_TRACK_ENABLE, this.#onRemoteCameraTrackEnable.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_MICROPHONE_TRACK_ENABLE, this.#onRemoteMicrophoneTrackEnable.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_SCREEN_SHARE, this.#onRemoteScreenShare.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_SCREEN_SHARE_END, this.#onRemoteScreenShareEnd.bind(this));
    this.#connectionsService.addEventListener(ConnectionsService.EventDict.REMOTE_USER_MEDIA_TRACKS_DISABLE, this.#onRemoteUserMediaTracksDisable.bind(this));
  }
  #addObservers() {
    this.#resizeObserver.observe(this);
  }
  #addUserToHandlesList(remoteConnectionID) {
    const handleSelectorElement = this.#createHandleSelector(remoteConnectionID);
    this.shadowRoot.getElementById('handles-list').append(handleSelectorElement);
    this.shadowRoot.getElementById('handles-client-count').textContent = this.#connectionsService.getActiveConnections().length;
  }
  #closeConnection(remoteConnectionID) {
    this.#connectionsService.closeConnection(remoteConnectionID);
    this.#connectionsClosedByUs.add(this.#connectionsService.getConnection(remoteConnectionID).connection);
  }
  #createAPIDocs() {
    return apiDocsTemplate({
      dataChannelCloseEventType: this.constructor.EventDict.DATA_CHANNEL_CLOSE,
      dataChannelOpenEventType: this.constructor.EventDict.DATA_CHANNEL_OPEN,
      defaultEmptyChatPlaceholder: this.#DEFAULT_EMPTY_CHAT_PLACEHOLDER,
      defaultMaxIncomingMediaStreams: this.#DEFAULT_MAX_INCOMING_MEDIA_STREAMS,
      defaultMessageInputPlaceholder: this.#DEFAULT_MESSAGE_INPUT_PLACEHOLDER,
      defaultICEServers: this.#DEFAULT_ICE_SERVERS,
      deleteChatHistoryEventType: this.constructor.EventDict.DELETE_CHAT_HISTORY,
      disconnectUserRequestEventType: this.constructor.EventDict.DISCONNECT_USER_REQUEST,
      fileTransferFailEventType: this.constructor.EventDict.FILE_TRANSFER_FAIL,
      localHandleCopiedToClipboardEventType: this.constructor.EventDict.LOCAL_HANDLE_COPIED_TO_CLIPBOARD,
      localName: this.localName,
      mediaDeviceErrorEventType: this.constructor.EventDict.MEDIA_DEVICE_ERROR,
      setHandleEventType: this.constructor.EventDict.SET_HANDLE
    });
  }
  #createContent() {
    const { EventDict: XDetailsEvent } = customElements.get('x-details');
    return new SafeDOMParser(this).parseFromString`
      <section id="root">
        ${this.#createInfoBarHeader()}
        <section class="slide-ins" id="slide-ins">${this.#createSlideIns()}</section>
        <main class="content" id="content" use-custom-scrollbars>
          ${this.#createLocalMediaStreamsSection()}
          <section class="handles">
            <h2 class="handles-heading">
              <span class="handles-heading__title">Connections</span>
              <span class="handles-heading__client-count" id="handles-client-count">0</span>
            </h2>
            <ul class="handles__list" id="handles-list" use-custom-scrollbars></ul>
          </section>
          <section class="attrition">MADE BY ZOODUCK</section>
          <section class="main-ui" id="main-ui">
            ${this.#createXChatPlaceholder()}
            <form
              autocomplete="off"
              class="main-ui__chat-message-form"
              id="message-form"
              on:submit="onMessageFormSubmit()">
              <label class="main-ui__chat-message-form-label" for="message-input">Message</label>
              <input-text
                autocomplete="off"
                class="main-ui__chat-message-form-input"
                emoji-tray
                id="message-input"
                multiline
                name="message"
                on:keydown="onMessageInputKeyDown()"
                placeholder="${this.messageInputPlaceholder}"
                rows="3"
                spellcheck="false">
              </input-text>
              <x-button
                action="secondary"
                class="main-ui__chat-message-form-send-file-button"
                type="button"
                on:click="onSendFileButtonClick()">
                ${svgIconService.getIcon(svgIconService.Icon.PAPERCLIP, { class: 'icon', slot: 'icon' })}
              </x-button>
            </form>
          </section>
          <x-details
            class="incoming-media-streams-details"
            id="incoming-media-streams-details"
            on:${XDetailsEvent.CLOSE}="onIncomingMediaStreamsDetailsClose()"
            on:${XDetailsEvent.OPEN}="onIncomingMediaStreamsDetailsOpen()"
            summary="... (0)">
            <media-streams
              class="incoming-media-streams"
              id="incoming-media-streams"
              max-media-streams="${this.maxIncomingMediaStreamsToDisplay}"
              media-streams-title="Remote Streams">
            </media-streams>
          </x-details>
        </main>
      </section>
    `;
  }
  #createFormsUI() {
    return formsUITemplate.call(this);
  }
  #createHandleSelector(connectionID) {
    return handleSelectorTemplate.call(this, { handle: connectionID });
  }
  #createInfoBarHeader() {
    return infoBarHeaderTemplate.call(this, {
      apiDocs: this.apiDocs,
      handle: this.handle,
      handlePlaceholder: 'UnnamedPlayer',
      iceGatheringTimeSeconds: this.#iceGatheringTimeSeconds,
      isStandaloneMode: this.#isStandaloneMode,
      natType: this.#natType
    });
  }
  #createLocalMediaStreamsSection() {
    return localMediaStreamsTemplate.call(this);
  }
  #createSlideIns() {
    const slideInElements = [];
    const { EventDict: SlideInEventDict } = customElements.get('slide-in');
    if (this.#isStandaloneMode) {
      slideInElements.push(new SafeDOMParser(this).parseFromString`
        <slide-in
          class="slide-ins__forms-ui-slide-in"
          id="forms-ui-slide-in"
          on:${SlideInEventDict.CLOSE}="onFormsUISlideInClose()"
          on:${SlideInEventDict.OPEN}="onFormsUISlideInOpen()">
          ${this.#createFormsUI()}
        </slide-in>
      `);
    }
    if (this.apiDocs) {
      slideInElements.push(new SafeDOMParser(this).parseFromString`
        <slide-in
          id="api-docs-slide-in"
          on:${SlideInEventDict.CLOSE}="onAPIDocsSlideInClose()"
          on:${SlideInEventDict.OPEN}="onAPIDocsSlideInOpen()">
          ${this.#createAPIDocs()}
        </slide-in>
      `);
    }
    return slideInElements;
  }
  #createXChatInstance(remoteHandle) {
    return new SafeDOMParser(this).parseFromString`
      <x-chat
        call-to-action="Destroy History|danger"
        class="main-ui__chat-messages"
        empty-chat-placeholder="${this.emptyChatPlaceholder}"
        id="chat-messages"
        on:destroyhistory="onDeleteChatHistoryRequest()"
        remote-handle="${remoteHandle}">
      </x-chat>
    `;
  }
  #createXChatPlaceholder() {
    return new SafeDOMParser().parseFromString`
      <x-chat
        class="main-ui__chat-messages"
        empty-chat-placeholder="${this.emptyChatPlaceholder}"
        id="chat-messages">
      </x-chat>
    `;
  }
  #displayICEGatheringTime() {
    this.ready().then(() => {
      this.shadowRoot.getElementById('info-bar-ice-gathering-time').textContent = '';
      const iceServers = this.#iceServers || this.#DEFAULT_ICE_SERVERS;
      networkUtils.getICEGatheringTime(iceServers).then((iceGatheringTime) => {
        this.#iceGatheringTimeSeconds = parseFloat(new Number(iceGatheringTime / 1000).toFixed(2));
        this.shadowRoot.getElementById('info-bar-ice-gathering-time').textContent = this.#iceGatheringTimeSeconds + 's';
      });
    });
  }
  #enableSDPFormButtons() {
    [
      'create-sdp-offer-button',
      'set-sdp-offer-button',
      'set-sdp-answer-button'
    ].forEach((buttonID) => {
      this.shadowRoot.getElementById(buttonID).disabled = false;
    });
  }
  async #getSDPOfferForRemoteUser(remoteHandle) {
    this.#updateConnectingInfo({ isConnecting: true, label: `Creating SDP offer for ${remoteHandle}` });
    const waitTimeCalculator = new WaitTimeCalculator(2000);
    waitTimeCalculator.markStart();
    const sessionDescriptionOffer = await this.#connectionsService.addOffererConnection(
      this.#connectionID,
      remoteHandle,
      { iceServers: this.#iceServers || this.#DEFAULT_ICE_SERVERS }
    );
    waitTimeCalculator.markEnd();
    if (this.#isStandaloneMode) {
      await wait.forMilliseconds(waitTimeCalculator.remainingWaitTime);
    }
    this.#updateConnectingInfo({ isConnecting: true, label: `Awaiting SDP answer from ${remoteHandle}` });
    return sessionDescriptionOffer;
  }
  #getLastIncomingMediaStreamWithEnabledTracks(connectionID) {
    return Array.from(this.#connectionsService.getConnection(connectionID).incomingMediaStreams.values()).find(({ hasEnabledTracks }) => {
      return hasEnabledTracks;
    })?.stream;
  }
  #hasConnectionGotIncomingMediaStreamsWithEnabledTracks(connectionID) {
    return Array.from(this.#connectionsService.getConnection(connectionID).incomingMediaStreams.values()).some(({ hasEnabledTracks }) => {
      return hasEnabledTracks;
    });
  }
  #insertExternalResourceLinks(externalLinks) {
    const documentLinks = Array.from(document.head.querySelectorAll('link'));
    externalLinks.forEach(({ rel, href }) => {
      const linkExists = documentLinks.some((link) => {
        return link.rel === rel && link.href.startsWith(href);
      });
      if (linkExists) {
        return;
      }
      const link = new SafeDOMParser(this).parseFromString`<link rel="${rel}" href="${href}">`;
      document.head.append(link);
    });
  }
  #removeChatHistory(remoteID) {
    if (!remoteID) {
      return localStorageService.clear();
    }
    const messageHistoryKey = `${this.#MESSAGE_HISTORY_KEY_PREFIX}${this.#connectionID}|${remoteID}`;
    localStorageService.removeItem(messageHistoryKey);
    this.#xChatElements.get(remoteID).clearMessages();
  }
  #removeDisconnectedUserFromHandlesList(remoteConnectionID) {
    const handleElement = this.shadowRoot.getElementById(`handles-list-item-${remoteConnectionID}`);
    const isActiveHandleDisconnectedUser = this.#activeChatHandle === remoteConnectionID;
    if (!handleElement) {
      return;
    }
    handleElement.remove();
    this.shadowRoot.getElementById('handles-client-count').textContent = this.#connectionsService.getActiveConnections().length;
    if (!isActiveHandleDisconnectedUser) {
      return;
    }
    this.#activeChatHandle = null;
    this.shadowRoot.getElementById('chat-messages').replaceWith(this.#xChatElements.get('__PLACEHOLDER__'));
  }
  #saveChatToLocalStorage(messageData, remoteID) {
    const messageHistoryKey = `${this.#MESSAGE_HISTORY_KEY_PREFIX}${this.#connectionID}|${remoteID}`;
    const messageHistory = JSON.parse(localStorageService.getItem(messageHistoryKey)) || [];
    messageHistory.push(messageData);
    localStorageService.setItem(messageHistoryKey, JSON.stringify(messageHistory));
  }
  #setActiveHandleInDOM(handleListItem) {
    this.shadowRoot.getElementById('handles-list').querySelectorAll('.handles__list-item').forEach((listItem) => {
      listItem.classList.remove('handles__list-item--active');
    });
    handleListItem.classList.add('handles__list-item--active');
  }
  #setMaxContentHeight() {
    requestAnimationFrame(() => {
      const { marginBottom, marginTop } = getComputedStyle(document.body);
      const maxElementHeightPixels = window.innerHeight - parseFloat(marginBottom) - parseFloat(marginTop);
      this.shadowRoot.getElementById('root').style.maxHeight = maxElementHeightPixels + 'px';
    });
  }
  async #setSDPAnswerFromRemoteUser(sessionDescriptionAnswer) {
    const remoteConnectionID = this.#connectionsService.getAnswererFromSessionDescription(sessionDescriptionAnswer);
    if (!this.#connectionsService.hasConnection(remoteConnectionID)) {
      return;
    }
    if (this.#connectionsService.hasActiveConnection(remoteConnectionID)) {
      return;
    }
    const { connection } = this.#connectionsService.getConnection(remoteConnectionID);
    this.#updateConnectingInfo({ isConnecting: true, label: `Establishing P2P connection with ${remoteConnectionID}` });
    if (this.#isStandaloneMode) {
      await wait.forMilliseconds(2000);
    }
    return this.#connectionsService.setAnswer({
      connection: connection,
      connectionID: this.#connectionID,
      remoteConnectionID: remoteConnectionID,
      sessionDesciptionAnswer: sessionDescriptionAnswer
    });
  }
  #setMaxHeightForSlideInContent() {
    requestAnimationFrame(() => {
      const apiDocs = this.shadowRoot.getElementById('api-docs');
      const formsUI = this.shadowRoot.getElementById('forms-ui');
      const { height } = getComputedStyle(this);
      const slideInHeightClearance = getComputedStyle(this).getPropertyValue('--_slide-in-height-clearance');
      const windowInnerHeightAdjustPixels = window.innerHeight < this.clientHeight ? this.clientHeight - window.innerHeight : 0;
      if (apiDocs) {
        apiDocs.style.maxHeight = `calc(${height} - ${slideInHeightClearance} - ${windowInnerHeightAdjustPixels}px)`;
      }
      if (formsUI) {
        formsUI.style.maxHeight = `calc(${height} - ${slideInHeightClearance} - ${windowInnerHeightAdjustPixels}px)`;
      }
    });
  }
  async #setHandleEnteredByUser(value) {
    if (this.#connectionID) {
      return;
    }
    const handleInputElement = this.shadowRoot.getElementById('handle-input');
    const handleSubmitButtonElement = this.shadowRoot.getElementById('handle-submit-button');
    const infoBarHandleElement = this.shadowRoot.getElementById('info-bar-handle');
    handleInputElement.allowedCharactersPattern = '[\\w#]';
    handleInputElement.value = value;
    handleInputElement.readOnly = true;
    handleSubmitButtonElement.disabled = true;
    this.#connectionID = handleInputElement.value;
    infoBarHandleElement.textContent = this.handle;
    infoBarHandleElement.title = this.handle;
    this.shadowRoot.getElementById('set-handle-form').remove();
    await alertService.alert([
      `Handle saved as "${this.handle}".`,
      'You can copy your handle to the clipboard by clicking on it in the header.'
    ], {
      onElement: this.alerts === this.Alerts.ELEMENT ? this : null,
      title: this.#alertTitle
    });
    this.#enableSDPFormButtons();
  }
  async #setSDPOfferFromRemoteUser(sessionDescriptionOffer) {
    const remoteConnectionID = this.#connectionsService.getOffererFromSessionDescription(sessionDescriptionOffer);
    if (!remoteConnectionID) {
      return;
    }
    this.#connectionsService.addAnswererConnection(
      this.#connectionID,
      remoteConnectionID,
      this.config
    );
    if (!this.#connectionsService.hasConnection(remoteConnectionID)) {
      return;
    }
    const { connection } = this.#connectionsService.getConnection(remoteConnectionID);
    this.#updateConnectingInfo({ isConnecting: true, label: `Creating SDP answer for ${remoteConnectionID}` });
    const waitTimeCalculator = new WaitTimeCalculator(2000);
    waitTimeCalculator.markStart();
    const sessionDescriptionAnswer = await this.#connectionsService.setOffer({
      connection: connection,
      connectionID: this.#connectionID,
      remoteConnectionID: remoteConnectionID,
      sessionDescriptionOffer: sessionDescriptionOffer,
      addConnectionIDsToSessionDescription: true
    });
    waitTimeCalculator.markEnd();
    if (this.#isStandaloneMode) {
      await wait.forMilliseconds(waitTimeCalculator.remainingWaitTime);
    }
    this.#updateConnectingInfo({ isConnecting: true, label: `Waiting for ${remoteConnectionID}` });
    return sessionDescriptionAnswer;
  }
  #setScreenFormValue(value) {
    const screenFormSubmitButton = this.shadowRoot.getElementById('screen-share-form-submit-button');
    const screenActionInput = this.shadowRoot.getElementById('screen-share-action-input');
    switch (value) {
      case ScreenShareFormValue.SHARE_SCREEN:
        screenActionInput.value = ScreenShareFormValue.SHARE_SCREEN;
        if (window.innerWidth >= this.#mobileBreakpoint) {
          screenFormSubmitButton.querySelector('span').textContent = UserControlText.SHARE_SCREEN;
        }
        screenFormSubmitButton.toggle(false);
        break;
      case ScreenShareFormValue.STOP_SHARING_SCREEN:
        screenActionInput.value = ScreenShareFormValue.STOP_SHARING_SCREEN;
        if (window.innerWidth >= this.#mobileBreakpoint) {
          screenFormSubmitButton.querySelector('span').textContent = UserControlText.STOP_SHARING_SCREEN;
        }
        screenFormSubmitButton.toggle(true);
        break;
      default:
        break;
    }
  }
  #updateConnectingInfo({ isConnecting, label = '' } = {}) {
    this.shadowRoot.getElementById('info-bar-connecting-info').classList.toggle('info-bar__connecting-info--visible', isConnecting);
    this.shadowRoot.getElementById('info-bar-connecting-info-label').textContent = isConnecting ? label : '';
  }
  #updateFileTransferProgressIndicatorOnFailedFileTransfer() {
    const fileTransferProgressElement = this.shadowRoot.getElementById('file-transfer-progress');
    fileTransferProgressElement.fail();
  }
  #updateIncomingMediaStreamsDetailsSummary() {
    const incomingMediaStreamsDetailsElement = this.shadowRoot.getElementById('incoming-media-streams-details');
    const { activeStreams } = this.shadowRoot.getElementById('incoming-media-streams');
    this.shadowRoot.getElementById('incoming-media-streams-details').summary = incomingMediaStreamsDetailsElement.open
      ? ''
      : `... (${activeStreams})`;
  }
  #updateLocalMediaStreamsControlButtons() {
    const toggleCameraButtonTextElement = this.shadowRoot.getElementById('toggle-camera-button-text');
    const toggleMicrophoneButtonTextElement = this.shadowRoot.getElementById('toggle-microphone-button-text');
    const screenShareFormSubmitButtonTextElement = this.shadowRoot.getElementById('screen-share-form-submit-button-text');
    requestAnimationFrame(() => {
      if (window.innerWidth < this.#mobileBreakpoint) {
        toggleCameraButtonTextElement.textContent = '';
        toggleMicrophoneButtonTextElement.textContent = '';
        screenShareFormSubmitButtonTextElement.textContent = '';
      } else {
        toggleCameraButtonTextElement.textContent = UserControlText.TOGGLE_CAMERA;
        toggleMicrophoneButtonTextElement.textContent = UserControlText.TOGGLE_MICROPHONE;
        screenShareFormSubmitButtonTextElement.textContent = this.#mediaStreamService.isScreenBeingShared
          ? UserControlText.STOP_SHARING_SCREEN
          : UserControlText.SHARE_SCREEN;
      }
    });
  }
  #updateUI() {
    this.shadowRoot.getElementById('info-bar').replaceWith(this.#createInfoBarHeader());
    this.shadowRoot.getElementById('slide-ins').innerHTML = '';
    this.shadowRoot.getElementById('slide-ins').append(...this.#createSlideIns());
  }
}
customElements.define(HTMLChatapotamusP2PChatByZooduckElement.LOCAL_NAME, HTMLChatapotamusP2PChatByZooduckElement);
export { HTMLChatapotamusP2PChatByZooduckElement };