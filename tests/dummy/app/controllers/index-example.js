import Controller from '@ember/controller';
import User from 'dummy/models/user';
import { action } from '@ember/object';

export default class IndexExampleController extends Controller {
  @action
  setDirtyState({ target }) {
    target.dataset.state = 'dirty';
  }

  @action
  handleFormSubmit({ target: form }) {
    this.createUser(Object.fromEntries(new FormData(form)));
    this.resetForm(form);
  }

  createUser(data) {
    this.model.addUser(new User(data));
  }

  resetForm(form) {
    let elements = [...form.elements];
    elements[0].focus();
    requestAnimationFrame(() => {
      form.reset();
      elements.forEach((e) => (e.dataset.state = 'clean'));
    });
  }
}
