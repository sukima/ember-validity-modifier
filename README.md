ember-validity-modifier
==============================================================================

A very simple validation addon using a custom modifier. This makes adding
custom validations to form elements as simple as adding a modifier to the field
along with your own helper or validation function.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-validity-modifier
```


Usage
------------------------------------------------------------------------------

#### Example using a component action

```hbs
<input {{validity this.validate}}>
```

```js
export default MyComponent extends Component {
  @action
  validate({ value }) {
    return value === 'foobar' ? [] : ['Must be a foobar'];
  }
}
```

#### Example using a custom helper

```hbs
<input {{validity (validate-foobar)}}>
```

```js
export default helper(function validateFoobar() {
  return ({ value }) => value === 'foobar' ? [] : ['Must be a foobar'];
});
```

#### Example using native validations

```hbs
<input required pattern="foobar" {{validity}}>
```

#### Example using more than one validations

```hbs
<input {{validity (validate-present) (validate-phone-number)}}>
```

#### Example of only validating on specific events

By default validation will happen on `change`, `input`, and `blur`. Comma separate event names.

```hbs
<input {{validity (validate-foobar) on="change,input"}}>
```

#### Example validation on form submit

```hbs
<form ...attributes novalidate {{on "submit" this.validateAndSubmit}}>
  <label for="firstName">First name</label>
  <input type="text" name="firstName" id="firstName" required {{validity}}>
  <label for="lastName">Last name</label>
  <input type="text" name="lastName" id="lastName" required {{validity (validate-not-match "firstName")}}>
  <button type="submit">Submit form</button>
</form>
```

```js
import Component from '@glimmer/component';
import { validate } from 'ember-validity-modifier';

export default class MyForm extends Component {
  @action
  async validateAndSubmit(event) {
    let { target: form } = event;
    event.preventDefault();
    await validate(...form.elements);
    if (form.reportValidity()) {
      console.log('Fake submit action', Object.fromEntries(new FormData(form)));
    }
  }
}
```

#### Example with select

```hbs
<select name="foobar" {{validity (validate-selected-option)}}>
  <option value="">—Pick one—</option>
  <option value="foo">Foo</option>
  <option value="bar">Bar</option>
  <option value="baz">Baz</option>
</select>
```

```js
export default helper(function validateSelectedOption() {
  return ({ name, value }) => value === '' ? [`Must pick an option for ${name}`] : [];
});
```

#### Example with ember-changeset validations

```hbs
{{#let (changeset this.data this.validate) as |subject|}}
  <Input
    @value={{subject.foobar}}
    {{validity (validate-changeset subject "foobar")}}
  />
{{/let}}
```

```js
export default helper(function validateChangeset([changeset, prop]) {
  return async () => {
    await changeset.validate(prop);
    let { validation: error } = changeset.error[prop] ?? {};
    return error ? [error] : [];
  };
});
```

#### Example rendering validation messages

```hbs
<input
  data-validated={{this.didValidate}}
  {{on "validated" this.setValidationMessage}}
  {{validity (validate-foobar)}}
>
<span>{{this.validationMessage}}</span>
```

```js
export default MyComponent extends Component {
  @tracked didValidate;
  @tracked validationMessage;

  @action
  setValidationMessage(event) {
    let { validationMessage } = event.target;
    this.didValidate = true;
    this.validationMessage = validationMessage;
  }
}
```

#### Example CSS

```css
/* All the things */
:valid { … }
:invalid { … }

/* Not on first render */
[data-validated]:valid { … }
[data-validated]:invalid { … }
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
