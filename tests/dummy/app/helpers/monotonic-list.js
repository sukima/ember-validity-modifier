import { helper } from '@ember/component/helper';
import { tracked } from '@glimmer/tracking';

let COUNTER = 0;

const uniqueId = () => ++COUNTER;

class MonotonicList {
  @tracked list;
  add = () => {
    this.list.add(uniqueId());
    this.list = new Set(this.list);
  };
  remove = (id) => {
    this.list.delete(id);
    this.list = new Set(this.list);
  };

  get size() {
    return this.list.size;
  }

  *[Symbol.iterator]() {
    yield* this.list;
  }

  constructor(length = 0) {
    this.list = new Set(Array.from({ length }, uniqueId));
  }
}

export default helper(([size]) => new MonotonicList(size));
