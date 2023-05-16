const EXPIRED_ITEMS_INTERVAL = 60000;
const LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE = '__localStorageService__';
const TEMPORARY_ITEMS_KEY = 'temporary_items';
const SET_ITEM_EVENT_TYPE = 'setitem';
const localStorageServiceEventTarget = new EventTarget();
let onSetItemEventListener = () => {};
const localStorageService = new Proxy(localStorage, {
  get (target, property) {
    const value = target[property];
    if (property === 'addEventListener') {
      return function() {
        return localStorageServiceEventTarget.addEventListener(...arguments);
      }
    }
    if (value instanceof Function) {
      return function(...args) {
        if (value.name === 'clear') {
          Object.keys(target).forEach((key) => {
            if (new RegExp('^' + LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE).test(key)) {
              target.removeItem(key);
            }
          });
          return;
        }
        if (/(get|remove|set)Item/.test(value.name)) {
          args[0] = LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + args[0];
        }
        const returnValue = value.apply(target, args);
        if (value.name === 'setItem') {
          const [key, value, { expires = null } = {}] = args;
          if (!target.getItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY)) {
            target.setItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY, JSON.stringify({}));
          }
          if (expires && new Date(expires).toString() !== 'Invalid Date') {
            const temporaryItems = JSON.parse(target.getItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY));
            temporaryItems[key] = expires;
            target.setItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY, JSON.stringify(temporaryItems));
          }
          const event = new CustomEvent(SET_ITEM_EVENT_TYPE, {
            detail: [key, value]
          });
          localStorageServiceEventTarget.dispatchEvent(event);
          onSetItemEventListener(event);
        }
        return returnValue;
      }
    }
    return value;
  },
  set (_target, property, newValue) {
    if (property === `on${SET_ITEM_EVENT_TYPE}`) {
      onSetItemEventListener = newValue;
    }
  }
});
setInterval(() => {
  if (!localStorage.getItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY)) {
    return;
  }
  const keysToRemove = new Set();
  Object.entries(JSON.parse(localStorage.getItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY))).forEach(([key, date]) => {
    if (new Date(date).getTime() <= Date.now()) {
      keysToRemove.add(key);
      localStorage.removeItem(key);
    }
  });
  const temporaryItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY));
  keysToRemove.forEach((key) => {
    delete temporaryItems[key];
  });
  localStorage.setItem(LOCAL_STORAGE_SERVICE_ITEM_NAMESPACE + TEMPORARY_ITEMS_KEY, JSON.stringify(temporaryItems));
}, EXPIRED_ITEMS_INTERVAL);
export { localStorageService };