const validatables = new WeakMap();

function createDeferred() {
  let resolve;
  let promise = new Promise(i => resolve = i);
  return { resolve, promise };
}

function getDeferred(element) {
  let deferred = validatables.get(element) ?? createDeferred();
  validatables.set(element, deferred);
  return deferred;
}

export function validatable(element) {
  let handler = (event) => getDeferred(element).resolve(event);
  element.addEventListener('validated', handler);
  return element;
}

export async function waitForValidated(element) {
  await getDeferred(element).promise;
  validatables.delete(element);
}
