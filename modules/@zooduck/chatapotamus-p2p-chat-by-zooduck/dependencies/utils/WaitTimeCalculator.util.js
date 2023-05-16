class WaitTimeCalculator {
  #minWaitTime;
  #startMarkName;
  #endMarkName;
  constructor(minWaitTimeInMilliseconds = 0) {
    this.#minWaitTime = minWaitTimeInMilliseconds;
  }
  get remainingWaitTime() {
    const remainingWaitTime = this.#minWaitTime - performance.measure('remainingWaitTime', this.#startMarkName, this.#endMarkName).duration;
    return remainingWaitTime < 0 ? 0 : remainingWaitTime;
  }
  markStart() {
    this.#startMarkName = crypto.randomUUID();
    performance.mark(this.#startMarkName);
  }
  markEnd() {
    this.#endMarkName = crypto.randomUUID();
    performance.mark(this.#endMarkName);
  }
}
export { WaitTimeCalculator };