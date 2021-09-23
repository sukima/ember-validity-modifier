import { modifier } from 'ember-modifier';
import { validate, registerValidatable } from 'ember-validity-modifier/utils/validate';
import { deprecate } from '@ember/application/deprecations';

const commaSeperate = s => s.split(',').map(i => i.trim()).filter(Boolean);
const reduceValidators = async (validators, ...args) => {
  let errors = await Promise.all(validators.map(validator => validator(...args)));
  return errors.reduce((a, b) => [...a, ...b], []);
};

class AutoTrackingExerciser {
  constructor(props) {
    this.props = props;
  }
  exercise(callback) {
    this.props.forEach(i => i);
    if (this.props.length) { callback(); }
  }
  static from(maybeProps) {
    return Array.isArray(maybeProps)
      ? new AutoTrackingExerciser(maybeProps)
      : new AutoTrackingExerciser([maybeProps]);
  }
}

export default modifier(function validity(
  element,
  validators,
  { watch = [], on: eventNames = 'change,input,blur' }
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
    deprecate(
      'Use "watch" argument instead of the "validator-update" event',
      false,
      {
        id: 'ember-validity-modifier-validator-update',
        url: 'https://github.com/sukima/ember-validity-modifier/#example-with-watch-argument',
        until: '2.0.0'
      }
    );
    validate(element);
  } else {
    AutoTrackingExerciser.from(watch)
      .exercise(() => validate(element));
  }
  return () => {
    element.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      element.removeEventListener(eventName, autoValidationHandler);
    });
  };
});
