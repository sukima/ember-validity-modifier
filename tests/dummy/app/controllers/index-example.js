import Controller from '@ember/controller';
import User from 'dummy/models/user';
import { action } from '@ember/object';
import { validate } from 'ember-validity-modifier';
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
  async handleFormSubmit(event) {
    event.preventDefault();
    let { target: form } = event;
    await validate(...form.elements);
    if (form .checkValidity()) {
      this.createUser(Object.fromEntries(new FormData(form)));
      this.resetForm(form);
    }
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
