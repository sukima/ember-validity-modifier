import { helper } from '@ember/component/helper';
import { tracked } from '@glimmer/tracking';

export class Counter {
  @tracked count;
  inc = () => ++this.value;
  dec = () => --this.value;
  set = (value) => this.value = value;

  constructor(value = 0) {
    this.set(value);
  }
}

export default helper(([value]) => new Counter(value));
