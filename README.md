ember-validity-modifier
==============================================================================

A very simple validation addon using a custom modifier. This makes adding
custom validations to form elements as simple as adding a modifier to the field
along with your own helper or validation function.

[Demo](https://sukima.github.io/ember-validity-modifier)


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

#### Example adding to non form fields (bubbling)

In cases where we don't have easy access to the form field itself we can also add it to a parent element. This might be the case when adding a modifier that gets applied by another component via its `...attributes`.

```hbs
<div {{validity (validate-foobar)}}>
  <label for="example">Example</label>
  <input id="example">
</div>
```

#### Example validation on form submit

```hbs
<form
  ...attributes
  {{verify-form-validity submit=this.handleSubmit reportValidity=true}}
>
  <label for="firstName">First name</label>
  <input type="text" name="firstName" id="firstName" required {{validity}}>
  <label for="lastName">Last name</label>
  <input
    type="text"
    name="lastName"
    id="lastName"
    required
    {{validity (validate-not-match "firstName")}}
  >
  <button type="submit">Submit form</button>
</form>
```

```js
import Component from '@glimmer/component';
import { validate } from 'ember-validity-modifier';

export default class MyForm extends Component {
  @action
  handleSubmit({ target: form }) {
    console.log('Fake submit action', Object.fromEntries(new FormData(form)));
  }
}
```

#### Example with `validateImmediately` argument

To validate the form state on initial render add `validateImmediately=true`.

```hbs
  <input {{validity
    (fn this.matchTo this.match)
    on="change"
    validateImmediately=true
  }}>
```

#### Example with `validateTracked` argument

To validate the form state when  initial render and any time **one** of its dependent arguments change, add the `'validateTracked'` argument with the dependent properties.

Because the validator argument is a function it is possible to not exercise the tracked properties and thus miss out on validations when those tracked properties change. This is the case of the `fn` helper which lazy executes thus doesn't trigger Ember's auto-tracking if it isn't ran first.

To compensate we can use `validateTracked` to inform the modifier that it needs to run the validations when these properties change.

```hbs
  <input {{validity
    (fn this.matchTo this.match)
    on="change"
    validateTracked=this.match
  }}>
```

To validate the form state any time **any** of its dependent arguments change, add the `validateTracked` argument using the `array` helper and a list of dependent properties.

```hbs
  <input {{validity
    (fn this.matchTo this.match1 this.match2)
    on="change"
    validateTracked=(array this.match1 this.macth2)
  }}>
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
{{#let (form-errors) as |errors|}}
  <input
    name="foobar"
    {{on "validated" errors.update}}
    {{validity (validate-foobar)}}
  >
  <span>{{errors.message.foobar}}</span>
{{/let}}
```

form-error exposes the following:

* `update` — action to process a validated event
* `set` — action that can set specific fields
* `for.<name>` — the errors as an array
* `native.<name>` — any native errors as an array
* `custom.<name>` — any custom errors as an array
* `message.<name>` — the `validationMessage` from the DOM element

#### Example CSS

```css
/* All the things */
:valid { … }
:invalid { … }

/* Not on first render, use the validated event to set dataset.validated */
[data-validited]:valid { … }
[data-validited]:invalid { … }
```


How this works
------------------------------------------------------------------------------

The blog post
[Managing validity in forms](https://tritarget.org/#Managing%20validity%20in%20forms)
takes a dive into a simple native (vanilla) implementation of this idea. In the
post it describes the idea that validations can be managed through DOM events.
By attaching the validation functions to an event handler they can easily manage
the native custom validity of the element.

When a validate event is dispatched (by default the events are `validate`,
`input`, `change`, and `blur`). Each validator function registered will be
evaluated, the results will be consolidated, and the element's custom validity
is set, finally a `validated` event is dispatched to announce that the process
is complete (in case of asynchronous validations).

![Sequence diagram of the validation events](http://www.plantuml.com/plantuml/svg/XP7FIiH03CRlVOgmb-fXVO0Yig22byMR5_KGccY3xRHqqeei1P_61_D9REje7LBPqv0_to_vCZkls6fNbKaplf9BWqxXwdOVnNTO2ec-xMkI9-4MqCEc2i76jgBoTSzERz1H6ThJFbJI1yTJ4OgvkgwlMp-hyeBp5-X_a-l3wFzfPCUDxc1xOKrbiEm8ioOnFRFEEammL-bHURrgamigcCq0Nr7qZrN3d7AhfFDjJEAsdNg9LmYJ-o2me0mywsNdjQv-d9-atp5Kx3q-yrbwUWH1uXlKl5YkIU6SyKPM7FsC-TOC3eVQHTJFzuzXYEzaTF6s5agiAEK83sVBuDvOVeJ1x6xcxDXHLvLV)

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
