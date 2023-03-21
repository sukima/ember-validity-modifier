import Route from '@ember/routing/route';
import User from 'dummy/models/user';
import { tracked } from '@glimmer/tracking';

class IndexModel {
  @tracked users = [];

  addUser(user) {
    this.users = [...this.users, user];
  }
}

export default class IndexExampleRoute extends Route {
  model() {
    let model = new IndexModel();
    model.addUser(
      new User({
        name: 'Ralph Wreck-it',
        phone: '555-1234',
        email: 'ralph@fixitfelix.com',
        password: 'foobar',
      })
    );
    return model;
  }
}
