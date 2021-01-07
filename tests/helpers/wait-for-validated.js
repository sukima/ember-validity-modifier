const validatables = new WeakMap();

function createDeferred() {
  let resolve;
  let promise = new Promise(i => resolve = i);
  return { resolve, promise };
}

export function validatable(element) {
  element.addEventListener('validated', event => {
    if (!validatables.has(element)) {
      validatables.set(element, createDeferred());
    }
    validatables.get(element).resolve(event);
  });
  return element;
}

export function waitForValidated(element) {
  if (!validatables.has(element)) {
    validatables.set(element, createDeferred());
  }
  return validatables.get(element).promise;
}
