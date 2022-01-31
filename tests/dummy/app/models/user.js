import { tracked } from '@glimmer/tracking';

export default class User {
  @tracked name;
  @tracked phone;
  @tracked email;
  @tracked password;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}
