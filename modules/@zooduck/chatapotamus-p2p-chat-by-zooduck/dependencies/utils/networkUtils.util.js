class NetworkUtils {
  #iceGatheringComplete;
  #iceGatheringTimeTestConnection;
  #natTypeResolve;
  #isInitialising;
  #natType;
  constructor() {
    this.#iceGatheringComplete = new Promise((resolve) => {
      this.#natTypeResolve = resolve;
    });
    this.init();
  }
  async getNATType() {
    await this.#iceGatheringComplete;
    return this.#natType;
  }
  async getICEGatheringTime(iceServers) {
    if (!iceServers?.[0]?.urls) {
      throw new Error('You must specify at least one ICE server.');
    }
    return new Promise((resolve) => {
      this.#iceGatheringTimeTestConnection = new RTCPeerConnection({ iceServers: iceServers });
      this.#iceGatheringTimeTestConnection.createDataChannel('ice_gathering_time_test');
      this.#iceGatheringTimeTestConnection.onicecandidate = (event) => {
        const { target: connection } = event;
        if (connection.iceGatheringState === 'complete') {
          performance.mark('end');
          const { duration: iceGatheringTime } = performance.measure('iceGatheringTime', 'start', 'end');
          resolve(iceGatheringTime);
        }
      }
      performance.mark('start');
      this.#iceGatheringTimeTestConnection.createOffer().then((offer) =>  {
        this.#iceGatheringTimeTestConnection.setLocalDescription(offer);
      });
    });
  }
  init() {
    if (this.#isInitialising) {
      return;
    }
    this.#isInitialising = true;
    this.#createConnectionForNATTypeTest();
  }
  #createConnectionForNATTypeTest() {
    const connection = new RTCPeerConnection({
      iceServers: [
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"}
      ]
    });
    connection.createDataChannel('nat_type_test');
    const serverReflexiveCandidates = new Map();
    connection.onicecandidate = (event) => {
      const { target: connection } = event;
      const parsedCandidate = this.#parseCandidate(event.candidate);
      if (parsedCandidate?.type === 'srflx') {
        serverReflexiveCandidates.set(parsedCandidate.port, parsedCandidate);
      }
      if (connection.iceGatheringState === 'complete') {
        const isSymmetricNAT = serverReflexiveCandidates.size > 1;
        this.#natType = isSymmetricNAT ? 'symmetric' : 'non-symmetric';
        this.#natTypeResolve();
        this.#isInitialising = false;
      }
    }
    connection.createOffer().then((offer) =>  {
      connection.setLocalDescription(offer);
    });
  }
  #parseCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      return candidate;
    }
    const { candidate: candidateString } = candidate;
    const parts = candidateString.split(' ');
    const address = parts[4];
    const port = parts[5];
    const protocol = parts[2];
    const type = candidateString.match(/typ ([^ ]+)/)[1];
    return {
      address: address,
      candidate: candidateString,
      port: parseInt(port, 10),
      protocol: protocol.toLowerCase(),
      type: type
    };
  }
}
const networkUtils = new NetworkUtils();
export { networkUtils };