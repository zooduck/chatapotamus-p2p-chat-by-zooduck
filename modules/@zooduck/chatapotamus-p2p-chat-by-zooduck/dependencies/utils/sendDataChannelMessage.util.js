const DataChannelMessageType = {
  CAMERA_TRACK_DISABLE: 1,
  CAMERA_TRACK_ENABLE: 2,
  CAMERA_TRACKS_DISABLE: 3,
  FILE_INFO: 4,
  FILE_TRANSFER_FAIL: 5,
  MESSAGE: 6,
  MICROPHONE_TRACK_ENABLE: 7,
  SCREEN_SHARE: 8,
  SCREEN_SHARE_END: 9,
  SDP_ANSWER: 10,
  SDP_OFFER: 11,
  USER_MEDIA_TRACKS_DISABLE: 12
};
const sendDataChannelMessage = async (messageData, channel) => {
  if (!channel instanceof RTCDataChannel) {
    return Promise.reject(new Error(`${channel} is not a valid RTCDataChannel.`));
  }
  const messageDataWithChannel = {
    ...messageData,
    channel: channel.label
  };
  channel.send(JSON.stringify(messageDataWithChannel));
  return messageDataWithChannel;
}
export { DataChannelMessageType, sendDataChannelMessage };