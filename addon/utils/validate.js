const validatables = new WeakSet();

function validateElement(element) {
  if (!isValidatable(element)) { return; }
  let validateEvent = new CustomEvent('validate');
  return new Promise(resolve => {
    let handler = () => {
      element.removeEventListener('validated', handler);
      resolve();
    };
    element.addEventListener('validated', handler);
    element.dispatchEvent(validateEvent);
  });
}

export function validate(...elements) {
  return Promise.all(elements.map(validateElement));
}

export function registerValidatable(element) {
  validatables.add(element);
}

export function isValidatable(element) {
  return validatables.has(element);
}
