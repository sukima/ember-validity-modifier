/*****************************************/
/* Version 1.0.0                         */
/* License MIT                           */
/* Copyright (C) 2022 Devin Weaver       */
/* https://tritarget.org/cdn/validity.js */
/*****************************************/

class ListStore {
  #store = new WeakMap();
  get(key) {
    return this.#store.get(key) ?? new Set();
  }
  set(key, list) {
    return this.#store.set(key, list);
  }
  has(key, item) {
    return this.get(key).has(item);
  }
  delete(key, item) {
    return this.get(key).delete(item);
  }
  concat(key, list) {
    return new Set([...this.get(key), ...list]);
  }
  append(key, list) {
    return this.set(key, this.concat(key, list));
  }
  remove(key, items) {
    for (let item of items) {
      this.delete(key, item);
    }
  }
}

class EventsManager {
  #store;
  #element;
  #listeners = new Map();
  constructor(element, store) {
    this.#store = store;
    this.#element = element;
  }
  add(name, handler) {
    if (this.#store.has(this.#element, name)) { return; }
    this.#store.append(this.#element, [name]);
    this.#element.addEventListener(name, handler);
    this.#listeners.set(name, handler);
  }
  has(name) {
    return this.#listeners.has(name);
  }
  removeAll() {
    for (let [name, handler] of this.#listeners) {
      this.#store.delete(this.#element, name);
      this.#element.removeEventListener(name, handler);
    }
  }
}

class Latch {
  count = 0;
  bump() {
    this.count++;
  }
  check() {
    this.count--;
    return this.count <= 0;
  }
}

async function reduceValidators(validators, ...args) {
  let promises = Array.from(validators, validator => validator(...args));
  let errors = await Promise.all(promises);
  return Array.from(new Set(errors.reduce((a, b) => [...a, ...b], [])));
}

function validateElement(element) {
  return new Promise((resolve, reject) => {
    let event = new CustomEvent('validate', {
      bubbles: true,
      cancelable: true,
      detail: { resolve, reject }
    });
    let wasNotPrevented = element?.dispatchEvent(event) ?? true;
    if (wasNotPrevented) { resolve(); }
  });
}

const eventsStore = new ListStore();
const validatorsStore = new ListStore();
const noop = () => {};
const rethrow = (error) => { throw error; };
const commaSeperate = s => s.split(',').map(i => i.trim()).filter(Boolean);

export function validate(...elements) {
  return Promise.all(elements.map(validateElement));
}

export function setValidity(
  element,
  validators = [],
  { on = 'change,input,blur', waiterCallback = noop } = {}
) {
  let eventsManager = new EventsManager(element, eventsStore);
  let eventNames = commaSeperate(on);
  let lastTask = Promise.resolve();
  let latch = new Latch();

  const updateValidity = ({ target }) => {
    latch.bump();
    lastTask = lastTask.then(async () => {
      if (!latch.check()) { return; }
      target.setCustomValidity('');
      let nativeErrors = target.checkValidity() ? [] : [target.validationMessage];
      let customErrors = await reduceValidators(validatorsStore.get(element), target);
      let errors = [...customErrors, ...nativeErrors];
      let detail = { errors, customErrors, nativeErrors };
      target.setCustomValidity(customErrors[0] ?? '');
      target.dispatchEvent(
        new CustomEvent('validated', { bubbles: true, detail })
      );
    });
    waiterCallback(lastTask);
    return lastTask;
  };

  const validateHandler = (event) => {
    let { resolve = noop, reject = rethrow } = event.detail ?? {};
    event.preventDefault();
    event.stopPropagation();
    updateValidity(event).then(resolve, reject);
  };

  validators = Array.isArray(validators) ? validators : [validators];
  validatorsStore.append(element, validators);

  eventsManager.add('validate', validateHandler);
  eventNames.forEach(evt => eventsManager.add(evt, updateValidity));

  return () => {
    eventsManager.removeAll();
    validatorsStore.remove(element, validators);
  };
}

export function verifyFormValidity(
  formElement,
  { submit, reportValidity = false } = {}
) {
  let originalNoValidate = formElement.noValidate;
  let checkMethod = reportValidity ? 'reportValidity' : 'checkValidity';

  const submitHandler = async event => {
    let submitAction = submit ?? (() => event.target.submit());
    event.preventDefault();
    await validate(...event.target.elements);
    if (event.target[checkMethod]()) {
      submitAction(event);
    }
  };

  formElement.noValidate = true;
  formElement.addEventListener('submit', submitHandler)

  return () => {
    formElement.noValidate = originalNoValidate;
    formElement.removeEventListener('submit', submitHandler)
  };
}
