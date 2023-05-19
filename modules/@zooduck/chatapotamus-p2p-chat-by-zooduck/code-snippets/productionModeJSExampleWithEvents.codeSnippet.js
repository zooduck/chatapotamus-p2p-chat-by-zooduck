export default `
import 'modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js';

const { EventDict: ChatapotamusP2PChatByZooduckEvent } = customElements.get('chatapotamus-p2p-chat-by-zooduck');

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.SET_HANDLE, (event) => {
  const { handle } = event.detail;
  alert(\`Handle saved as "\${handle}".\`);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.DATA_CHANNEL_OPEN, (event) => {
  const { initiator, localUser, remoteUser } = event.detail;
  if (initiator === localUser) {
    return;
  }
  alert(\`Connection to \${remoteUser} established!\`);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.DATA_CHANNEL_CLOSE, (event) => {
  const { initiator, localUser } = event.detail;
  if (initiator === localUser) {
    return;
  }
  alert(\`Connection terminated by \${initiator}.\`);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.DELETE_CHAT_HISTORY, (event) => {
  const { target: chatapotamusP2PChatByZooduckElement } = event;
  const { remoteUser } = event.detail;
  const deleteChatHistory = confirm(\`Delete chat history with \${remoteUser}?\`);
  if (!deleteChatHistory) {
    return;
  }
  chatapotamusP2PChatByZooduckElement.deleteChatHistory(remoteUser);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.DISCONNECT_USER_REQUEST, (event) => {
  const { target: chatapotamusP2PChatByZooduckElement } = event;
  const { remoteUser } = event.detail;
  const disconnectUser = confirm(\`Terminate connection with \${remoteUser}?\`);
  if (!disconnectUser) {
    return;
  }
  chatapotamusP2PChatByZooduckElement.closeConnection(remoteUser);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.LOCAL_HANDLE_COPIED_TO_CLIPBOARD, () => {
  alert('Your handle has been copied to the clipboard.');
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.MEDIA_DEVICE_ERROR, (event) => {
  const { error } = event.detail;
  alert(error);
});

window.addEventListener(ChatapotamusP2PChatByZooduckEvent.FILE_TRANSFER_FAIL, (event) => {
  const { error, file, remoteUser } = event.detail;
  alert(\`File \${file.name} could not be sent to \${remoteUser}. The following error was reported:\\n\\n\${error}\`);
});

const offererElement = document.getElementById('offerer');
const answererElement = document.getElementById('answerer');

offererElement.alerts = 'none';
offererElement.productionMode = true;

answererElement.alerts = 'none';
answererElement.productionMode = true;

offererElement.setHandle('user_a');
answererElement.setHandle('user_b');

try {
  const offer = await offererElement.getOfferForRemoteUser('user_b');
  const answer = await answererElement.setOfferFromRemoteUser(offer);
  await offererElement.setAnswerFromRemoteUser(answer);
  console.log('RTCPeerConnection successfully established between %s and %s!', offererElement.handle, answererElement.handle);
} catch (error) {
  console.error(error);
}`.trim();
