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
  let autoValidationEvents = commaSeperate(eventNames);
  let autoValidationHandler = () => validate(element);
  let validateHandler = async () => {
    let [error = ''] = await reduceValidators(validators, element);
    element.checkValidity();
    element.setCustomValidity(error);
    element.dispatchEvent(new CustomEvent('validated'));
  };
  element.addEventListener('validate', validateHandler);
  let watchForValidatorUpdates = false;
  autoValidationEvents.forEach(eventName => {
    if (eventName === 'validator-update') {
      watchForValidatorUpdates = true;
      return;
    }
    element.addEventListener(eventName, autoValidationHandler);
  });
  registerValidatable(element);
  if (watchForValidatorUpdates) {
    validate(element);
  }
  return () => {
    element.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      element.removeEventListener(eventName, autoValidationHandler);
    });
  };
});
