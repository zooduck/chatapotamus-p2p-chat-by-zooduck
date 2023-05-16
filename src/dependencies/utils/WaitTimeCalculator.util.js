class WaitTimeCalculator {
  #minWaitTime;
  #startMarkName;
  #endMarkName;
  constructor(minWaitTimeInMilliseconds = 0) {
    this.#minWaitTime = minWaitTimeInMilliseconds;
  }
  /**
   * @type {number}
   */
  get remainingWaitTime() {
    const remainingWaitTime = this.#minWaitTime - performance.measure('remainingWaitTime', this.#startMarkName, this.#endMarkName).duration;
    return remainingWaitTime < 0 ? 0 : remainingWaitTime;
  }
  /**
   * @method
   * @returns {void}
   */
  markStart() {
    this.#startMarkName = crypto.randomUUID();
    performance.mark(this.#startMarkName);
  }
  /**
   * @method
   * @returns {void}
   */
  markEnd() {
    this.#endMarkName = crypto.randomUUID();
    performance.mark(this.#endMarkName);
  }
}

export { WaitTimeCalculator };
