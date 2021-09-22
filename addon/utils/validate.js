const validatables = new WeakSet();

function validateElement(element) {
  return new Promise((resolve, reject) => {
    let eventDetail = { resolve, reject };
    let validateEvent = new CustomEvent('validate', {
      bubbles: true,
      cancelable: true,
      detail: eventDetail,
    });
    if (element.dispatchEvent(validateEvent)) {
      resolve();
    }
  });
}

export function validate(...elements) {
  return Promise.all(elements.map(validateElement));
}

export function isValidatable(element) {
  return validatables.has(element);
}

export function registerValidatable(element) {
  validatables.add(element);
}

export function unregisterValidatable(element) {
  validatables.delete(element);
}
