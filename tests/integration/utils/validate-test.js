import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { find, findAll, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { validate } from 'ember-validity-modifier';
import sinon from 'sinon';

module('Integration | Utility | validate', function(hooks) {
  setupRenderingTest(hooks);

  test(`dispatches the 'validate' DOM event`, async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`<input {{on "validate" this.validateSpy}}>`);
    validate(find('input'));
    sinon.assert.calledOnce(this.validateSpy);
    sinon.assert.calledWith(this.validateSpy, sinon.match.has('type', 'validate'));
  });

  test('handles multiple elements', async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`
      <input {{on "validate" this.validateSpy}}>
      <input {{on "validate" this.validateSpy}}>
      <input {{on "validate" this.validateSpy}}>
    `);
    validate(...findAll('input'));
    sinon.assert.calledThrice(this.validateSpy);
    sinon.assert.alwaysCalledWith(this.validateSpy, sinon.match.has('type', 'validate'));
  });

  test(`returns a promise that resolves when elements recieve a 'validated' event`, async function() {
    this.validateSpy = sinon.spy();
    await render(hbs`
      <input {{on "validate" this.validateSpy}}>
      <input {{on "validate" this.validateSpy}}>
      <input {{on "validate" this.validateSpy}}>
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
