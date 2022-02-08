import Helper from '@ember/component/helper';
import { tracked } from '@glimmer/tracking';

let COUNTER = 0;

const uniqueId = () => ++COUNTER;

class MonotonicSet {
  @tracked stack;
  add = () => {
    this.stack.add(uniqueId());
    this.stack = new Set(this.stack);
  };
  remove = (id) => {
    this.stack.delete(id);
    this.stack = new Set(this.stack);
  };

  get size() {
    return this.stack.size;
  }

  constructor(length = 0) {
    this.stack = new Set(Array.from({ length }, uniqueId));
  }
}

export default Helper.helper(([initialSize]) => new MonotonicSet(initialSize));
