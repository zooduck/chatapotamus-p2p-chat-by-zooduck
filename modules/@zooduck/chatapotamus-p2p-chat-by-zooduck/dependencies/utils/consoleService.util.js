const consoleService = (function() {
  let disabled = false;
  return new Proxy(window.console, {
    get(target, property, _receiver) {
      if (property === 'disabled') {
        return disabled;
      }
      const value = target[property];
      if (!disabled) {
        return value;
      }
      return value instanceof Function ? () => {} : target[property];
    },
    set(target, property, newValue, _receiver) {
      if (property === 'disabled') {
        disabled = newValue;
      } else {
        target[property] = newValue;
      }
      return true;
    }
  });
})();
export { consoleService };