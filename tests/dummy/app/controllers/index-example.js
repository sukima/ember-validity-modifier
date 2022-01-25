import Controller from '@ember/controller';
import User from 'dummy/models/user';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';

export default class IndexExampleController extends Controller {
  @tracked validationMessages = {};

  @action
  assignValidationMessages({ target }) {
    target.dataset.state = 'dirty';
    this.validationMessages = {
      ...this.validationMessages,
      [target.name]: target.validationMessage
    };
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
    form.reset();
    elements[0].focus();
    next(() => {
      elements.forEach(e => e.dataset.state = 'clean');
      this.validationMessages = {};
    });
  }
}
