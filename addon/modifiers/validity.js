import AutoTrackingExerciser from '../-private/auto-tracking-exerciser';
import ValidityWalker from '../-private/validity-walker';
import { modifier } from 'ember-modifier';
import { setValidity, validate } from '../-private/validity';
import { waitForPromise as waiterCallback } from '@ember/test-waiters';

export default modifier(function (
  element,
  validators,
  { validateTracked = [], validateImmediately = false, on }
) {
  // Ember passes in the params as a Proxy. Use Array.from to convert
  let teardown = setValidity(element, Array.from(validators), { on, waiterCallback });

  AutoTrackingExerciser.from(validateTracked, element)
    .runImmediatlyWhen(validateImmediately)
    .exercise(() => validate(...ValidityWalker.for(element)));

  return teardown;
});
