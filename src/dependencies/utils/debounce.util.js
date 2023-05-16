class Debounce {
  #counter = 0;
  #maxIterations;
  #milliseconds;
  #timeout;
  /**
   * @constructor
   * @param {number} milliseconds
   * @param {number} [maxIterations=Infinity]
   */
  constructor(milliseconds, maxIterations = Infinity) {
    this.#milliseconds = milliseconds;
    this.#maxIterations = maxIterations;
  }
  /**
   * @method
   * @param {number} milliseconds
   * @returns {Promise<void>}
   */
  done() {
    clearTimeout(this.#timeout);
    this.#counter += 1;

    return new Promise((resolve) => {
      if (this.#counter === this.#maxIterations) {
        this.#counter = 0;
        resolve();
      }
      this.#timeout = setTimeout(() => {
        resolve();
      }, this.#milliseconds);
    })
  }
}

export { Debounce };
