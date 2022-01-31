import Helper from '@ember/component/helper';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

class Toggleable {
  @tracked value;

  constuructor(initial) {
    this.value = initial ? true : false;
  }

  @action
  set(value) {
    this.value = value;
  }

  @action
  toggle() {
    this.set(!this.value);
  }
}

export function toggleable([initialValue]) {
  return new Toggleable(initialValue);
}

export default Helper.helper(toggleable);
