import Helper from '@ember/component/helper';
import { tracked } from '@glimmer/tracking';

export class ChangeTracker {
  @tracked count = 0;
  dirty = () => this.count++;
}

export default Helper.helper(() => new ChangeTracker());
