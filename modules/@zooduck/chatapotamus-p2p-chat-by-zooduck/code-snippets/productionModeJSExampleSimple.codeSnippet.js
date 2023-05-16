export default `
import 'modules/@zooduck/chatapotamus-p2p-chat-by-zooduck/index.module.js';

const offererElement = document.getElementById('offerer');
const answererElement = document.getElementById('answerer');

offererElement.productionMode = true;
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
