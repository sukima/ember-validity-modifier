export function validate(...elements) {
  let validateEvent = new CustomEvent('validate');
  elements.forEach(el => el.dispatchEvent(validateEvent));
}
