/**
 * Utilities for determining the user's NAT type and estimating the amount of time
 * it takes for the user agent to generate ICE candidates for a RTCPeerConnection.
 *
 * @see {@link https://info.support.huawei.com/info-finder/encyclopedia/en/NAT.html NAT types defined in STUN}
 */
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
  /**
   * @method
   * @returns {Promise<'non-symmetric'|'symmetric'>}
   */
  async getNATType() {
    await this.#iceGatheringComplete;
    return this.#natType;
  }
  /**
   * @method
   * @param {{urls: string}[]} iceServers
   * @returns {Promise<number>}
   */
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
  /**
   * @method
   * @returns {void}
   */
  init() {
    if (this.#isInitialising) {
      return;
    }
    this.#isInitialising = true;
    this.#createConnectionForNATTypeTest();
  }
  /**
   * @private
   * @method
   * @returns {void}
   */
  #createConnectionForNATTypeTest() {
    const connection = new RTCPeerConnection({
      // ---------------------------------------------------------------------------------------
      // Google STUN servers required for serverReflexiveCandidates Map to work!!!
      // (for example, Metered STUN server does not return any Server Reflexive Candidates
      // and Metered TURN servers always return a SINGLE Server Reflexive Candidate).
      // ---------------------------------------------------------------------------------------
      // While working on this utility, I found that Firefox always returned 2 x UDP hosts
      // for Symmetric NAT and 1 x UDP host for Non-Symmetric (even without any iceServers).
      //
      // This seemed to make sense, since Symmetric NAT will assign different public
      // addresses and ports for a host based on the destination.
      //
      // Unfortunately, Chrome always returns 2 x UDP hosts, so the only way to get consistent
      // results between browsers is to use Google STUN servers and count the number of unique
      // Server Reflexive Candidates that are generated when creating a RTCPeerConnection.
      // ---------------------------------------------------------------------------------------
      iceServers: [
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"}
      ]
    });
    connection.createDataChannel('nat_type_test');
    const serverReflexiveCandidates = new Map();
    connection.onicecandidate = (event) => {
      const { target: connection } = event;
      // ----------------------------------------------------------------------
      // Chrome includes all the candidate properties in the candidate object
      // but Firefox does not (so we need to parse the candidate string).
      // ----------------------------------------------------------------------
      const parsedCandidate = this.#parseCandidate(event.candidate);
      if (parsedCandidate?.type === 'srflx') {
        serverReflexiveCandidates.set(parsedCandidate.port, parsedCandidate);
      }
      if (connection.iceGatheringState === 'complete') {
        const isSymmetricNAT = serverReflexiveCandidates.size > 1;
        // --------------------------------------------------------
        // There are four NAT types defined in STUN:
        // 1. Full-cone NAT
        // 2. Address-restricted NAT
        // 3. Port-restricted NAT
        // 4. Symmetric NAT (requires TURN server)
        // --------------------------------------------------------
        // Symnmetric NAT requires a TURN server because it
        // maps requests from the same source (host) IP address
        // and port to different public IP addresses and ports
        // for each destination - and since the STUN server is not
        // the final destination (the remote peer's public IP is)
        // a TURN server is required to relay the traffic.
        // --------------------------------------------------------
        this.#natType = isSymmetricNAT ? 'symmetric' : 'non-symmetric';
        this.#natTypeResolve();
        this.#isInitialising = false;
      }
    }
    connection.createOffer().then((offer) =>  {
      connection.setLocalDescription(offer);
    });
  }
  /**
   * @private
   * @method
   * @param {RTCIceCandidate} candidate
   * @returns {RTCIceCandidate}
   */
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

export { NetworkUtils };
