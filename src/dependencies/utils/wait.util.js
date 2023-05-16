class Wait {
  /**
   * @method
   * @param {number} millisecondsToWait
   * @returns {Promise<void>}
   */
  forMilliseconds(millisecondsToWait = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, millisecondsToWait);
    });
  }
  /**
   * @method
   * @param {number} secondsToWait
   * @returns {Promise<void>}
   */
  forSeconds(secondsToWait = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, secondsToWait * 1000);
    });
  }
  /**
   * @method
   * @param {Date} date
   * @returns {Promise<void>}
   */
  untilDate(date) {
    const jsDate = date instanceof Date && date.toString() !== 'Invalid Date' ? date : new Date(date);
    if (jsDate.toString() === 'Invalid Date') {
      throw new Error('Invalid Date');
    }
    const millisecondsToWait = date.getTime() - Date.now();
    return new Promise((resolve) => {
      setTimeout(resolve, millisecondsToWait);
    });
  }
}

const wait = new Wait();

export { wait };
