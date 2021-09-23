import { assert } from '@ember/debug';
import { modifier } from 'ember-modifier';
import {
  isValidatable,
  registerValidatable,
  unregisterValidatable,
} from 'ember-validity-modifier/utils/validate';

const doNothing = () => {};
const rethrow = (error) => { throw error; }
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
  assert(
    'Only one validity modifier can be applied to an element',
    !isValidatable(element),
  );
  let taskCount = 0;
  let lastTask = Promise.resolve();
  let autoValidationEvents = commaSeperate(eventNames);
  let updateValidity = ({ target }) => {
    taskCount++;
    lastTask = lastTask.then(async () => {
      taskCount--;
      if (taskCount !== 0) { return; }
      let [error = ''] = await reduceValidators(validators, target);
      target.checkValidity();
      target.setCustomValidity(error);
      target.dispatchEvent(new CustomEvent('validated', { bubbles: true }));
    });
    return lastTask;
  };
  let validateHandler = (event) => {
    let { resolve = doNothing, reject = rethrow } = event.detail ?? {};
    event.preventDefault();
    event.stopPropagation();
    updateValidity(event).then(resolve, reject);
  };
  registerValidatable(element);
  element.addEventListener('validate', validateHandler);
  autoValidationEvents.forEach(eventName => {
    element.addEventListener(eventName, updateValidity);
  });
  registerValidatable(element);
  AutoTrackingExerciser.from(watch)
    .exercise(() => updateValidity({ target: element }));
  return () => {
    unregisterValidatable(element);
    element.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      element.removeEventListener(eventName, updateValidity);
    });
  };
});
