import Helper from '@ember/component/helper';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

function errorsFromValidityMessage(message) {
  return isPresent(message)
    ? { nativeErrors: [message], errors: [message], validationMessage: message }
    : {};
}

function errorsFromArray(messages) {
  return isPresent(messages)
    ? { customErrors: messages, errors: messages, validationMessage: messages[0] }
    : {};
}

function errorsFromString(message) {
  return isPresent(message)
    ? { customErrors: [message], errors: [message], validationMessage: message }
    : {};
}

const extractProperty =
  (property) =>
  ([key, value = {}]) =>
    [key, value[property] ?? []];

export class FormErrors {
  @tracked _errors = new Map();

  get for() {
    return Object.fromEntries(
      [...this._errors].map(extractProperty('errors')),
    );
  }

  get native() {
    return Object.fromEntries(
      [...this._errors].map(extractProperty('nativeErrors')),
    );
  }

  get custom() {
    return Object.fromEntries(
      [...this._errors].map(extractProperty('customErrors')),
    );
  }

  get message() {
    return Object.fromEntries(
      [...this._errors].map(extractProperty('validationMessage')),
    );
  }

  @action
  set(name, errors = {}) {
    if (Array.isArray(errors)) {
      errors = errorsFromArray(errors);
    } else if (typeof errors === 'string') {
      errors = errorsFromString(errors);
    }
    // else presume errors = { … }

    this._errors = new Map([...this._errors, [name, errors]]);
  }
  
  @action
  from(name, { detail, target: { validationMessage } }) {
    let errors = detail
      ? { ...detail, validationMessage }
      : errorsFromValidityMessage(validationMessage);
    this.set(name, errors);
  }

  @action
  update(event) {
    let { name } = event.target;
    this.from(name, event);
  }

  @action
  reset() {
    this._errors = new Map();
  }
}

export default Helper.helper(() => new FormErrors());
