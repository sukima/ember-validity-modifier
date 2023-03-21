const assignedDeferreds = new WeakMap();
const validatedEventAttached = new WeakSet();

function createDeferred() {
  let resolve;
  let promise = new Promise((i) => (resolve = i));
  return { resolve, promise };
}

export function validatable(element) {
  if (!validatedEventAttached.has(element)) {
    validatedEventAttached.add(element);
    element.addEventListener('validated', (event) => {
      if (!assignedDeferreds.has(element)) {
        assignedDeferreds.set(element, createDeferred());
      }
      assignedDeferreds.get(element).resolve(event);
    });
  }
  return element;
}

export async function waitForValidated(element) {
  if (!assignedDeferreds.has(element)) {
    assignedDeferreds.set(element, createDeferred());
  }
  let event = await assignedDeferreds.get(element).promise;
  assignedDeferreds.delete(element);
  return event;
}
