const assignedDeferreds = new WeakMap();

function createDeferred() {
  let resolve;
  let promise = new Promise(i => resolve = i);
  return { resolve, promise };
}

export function validatable(element) {
  element.addEventListener('validated', event => {
    if (!assignedDeferreds.has(element)) {
      assignedDeferreds.set(element, createDeferred());
    }
    assignedDeferreds.get(element).resolve(event);
    assignedDeferreds.delete(element);
  });
  return element;
}

export function waitForValidated(element) {
  if (!assignedDeferreds.has(element)) {
    assignedDeferreds.set(element, createDeferred());
  }
  return assignedDeferreds.get(element).promise;
}
