import { helper } from '@ember/component/helper';
import { tracked } from '@glimmer/tracking';

class Trackable {
  @tracked value;
  set = (value) => this.value = value;
  toggle = () => this.set(!this.value);

  constuructor(initialValue) {
    this.set(initialValue);
  }

  get is() {
    return { [this.value]: true };
  }
}

export default helper(([value]) => new Trackable(value));
