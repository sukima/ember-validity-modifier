import { modifier } from 'ember-modifier';
import { validate, registerValidatable } from 'ember-validity-modifier/utils/validate';

const commaSeperate = s => s.split(',').map(i => i.trim()).filter(Boolean);
const reduceValidators = async (validators, ...args) => {
  let errors = await Promise.all(validators.map(validator => validator(...args)));
  return errors.reduce((a, b) => [...a, ...b], []);
};

export default modifier(function validity(
  element,
  validators,
  { on: eventNames = 'change,input,blur' }
) {
  let isValidating = false;
  let autoValidationEvents = commaSeperate(eventNames);
  let autoValidationHandler = () => validate(element);
  let validateHandler = async () => {
    if (isValidating) { return; }
    isValidating = true;
    let [error = ''] = await reduceValidators(validators, element);
    element.checkValidity();
    element.setCustomValidity(error);
    element.dispatchEvent(new CustomEvent('validated'));
    isValidating = false;
  };
  element.addEventListener('validate', validateHandler);
  autoValidationEvents.forEach(eventName => {
    element.addEventListener(eventName, autoValidationHandler);
  });
  registerValidatable(element);
  return () => {
    element.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      element.removeEventListener(eventName, autoValidationHandler);
    });
  };
});
