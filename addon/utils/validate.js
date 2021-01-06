function validateElement(element) {
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
