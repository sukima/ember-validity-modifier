import { modifier } from 'ember-modifier';
import { verifyFormValidity } from '../-private/validity';

export default modifier(
  function (element, _, options) {
    return verifyFormValidity(element, options);
  },
  { eager: false }
);
