import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { find, findAll, render } from '@ember/test-helpers';
import { modifier } from 'ember-modifier';
import { setupRenderingTest } from 'ember-qunit';
import { validate } from 'ember-validity-modifier';
import { registerValidatable } from 'ember-validity-modifier/utils/validate';
import sinon from 'sinon';

module('Integration | Utility | validate', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('modifier:validatable', modifier(e => registerValidatable(e)));
  });

  test(`dispatches the 'validate' DOM event`, async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`<input {{on "validate" this.validateSpy}} {{validatable}}>`);
    validate(find('input'));
    sinon.assert.calledOnce(this.validateSpy);
    sinon.assert.calledWith(this.validateSpy, sinon.match.has('type', 'validate'));
  });

  test('handles multiple elements', async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`
      <input {{on "validate" this.validateSpy}} {{validatable}}>
      <input {{on "validate" this.validateSpy}} {{validatable}}>
      <input {{on "validate" this.validateSpy}} {{validatable}}>
    `);
    validate(...findAll('input'));
    sinon.assert.calledThrice(this.validateSpy);
    sinon.assert.alwaysCalledWith(this.validateSpy, sinon.match.has('type', 'validate'));
  });

  test(`returns a promise that resolves when elements recieve a 'validated' event`, async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`
      <input {{on "validate" this.validateSpy}} {{validatable}}>
      <input {{on "validate" this.validateSpy}} {{validatable}}>
      <input {{on "validate" this.validateSpy}} {{validatable}}>
    `);
    let subjects = findAll('input');
    let resultPromise = validate(...subjects);
    let validatedEvent = new CustomEvent('validated');
    subjects.forEach(i => i.dispatchEvent(validatedEvent));
    await resultPromise;
    sinon.assert.calledThrice(this.validateSpy);
    sinon.assert.alwaysCalledWith(this.validateSpy, sinon.match.has('type', 'validate'));
  });

});
