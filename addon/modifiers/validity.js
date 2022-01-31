import AutoTrackingExerciser from '../-private/auto-tracking-exerciser';
import ValidityWalker from '../-private/validity-walker';
import { modifier } from 'ember-modifier';
import { setValidity, validate } from '../-private/validity';
import { waitForPromise as waiterCallback } from '@ember/test-waiters';

export default modifier(function (
  element,
  validators,
  {
    validateTracked = [],
    validateImmediately = false,
    on = 'change,input,blur'
  }
) {
  let teardown = setValidity(element, validators, { on, waiterCallback });

  AutoTrackingExerciser.from(validateTracked, element)
    .runImmediatlyWhen(validateImmediately)
    .exercise(() => validate(...ValidityWalker.for(element)));

  return teardown;
});
