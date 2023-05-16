class Wait {
  forMilliseconds(millisecondsToWait = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, millisecondsToWait);
    });
  }
  forSeconds(secondsToWait = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, secondsToWait * 1000);
    });
  }
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