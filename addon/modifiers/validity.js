import { modifier } from 'ember-modifier';
import { validate } from 'ember-validity-modifier/utils/validate';

const commaSeperate = s => s.split(',').map(i => i.trim()).filter(Boolean);
const reduceValidators = async (validators, ...args) => {
  let errors = await Promise.all(validators.map(validator => validator(...args)));
  return errors.flat();
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
  autoValidationEvents.forEach(eventName => {
    element.addEventListener(eventName, autoValidationHandler);
  });
  return () => {
    element.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      element.removeEventListener(eventName, autoValidationHandler);
    });
  };
});
