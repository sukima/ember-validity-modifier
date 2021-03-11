import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { fillIn, find, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { validate } from 'ember-validity-modifier';
import { validatable, waitForValidated }
  from 'dummy/tests/helpers/wait-for-validated';
import sinon from 'sinon';

module('Integration | Modifier | validity', function(hooks) {
  setupRenderingTest(hooks);

  test('single validator sets validity to true', async function(assert) {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('multiple validators sets validity to true', async function(assert) {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`
      <input {{validity
        this.testValidator
        this.testValidator
        this.testValidator
        on=""
      }}>
    `);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledThrice(this.testValidator);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('single validator sets validity to false', async function(assert) {
    this.testValidator = sinon.stub().returns(['test-invalid']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.equal(subject.validationMessage, 'test-invalid');
  });

  test('multiple validators sets validity to false', async function(assert) {
    this.testValidator = sinon.stub().returns([])
      .onSecondCall().returns(['test-invalid']);
    await render(hbs`
      <input {{validity
        this.testValidator
        this.testValidator
        this.testValidator
        on=""
      }}>
    `);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledThrice(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.equal(subject.validationMessage, 'test-invalid');
  });

  test('single validator sets validity message to first failed error', async function(assert) {
    this.testValidator = sinon.stub().returns(['test-invalid1', 'test-invalid2']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.equal(subject.validationMessage, 'test-invalid1');
  });

  test('asynchonous validator can set validity to true', async function(assert) {
    this.testValidator = sinon.stub().resolves([]);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('asynchonous validator can set validity to false', async function(assert) {
    this.testValidator = sinon.stub().resolves(['test-invalid']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.equal(subject.validationMessage, 'test-invalid');
  });

  test('auto validates on DOM events', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="change"}}>`);
    await fillIn('input', 'foobar');
    sinon.assert.calledOnce(this.testValidator);
  });

  test('auto validates on DOM events (comma-separated)', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="a ,b,c "}}>`);
    let subject = validatable(find('input'));
    subject.dispatchEvent(new CustomEvent('a'));
    await waitForValidated(subject);
    subject.dispatchEvent(new CustomEvent('b'));
    await waitForValidated(subject);
    subject.dispatchEvent(new CustomEvent('c'));
    await waitForValidated(subject);
    sinon.assert.calledThrice(this.testValidator);
  });

  test('auto validates on DOM events defaults to change,', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="change"}}>`);
    await fillIn('input', 'foobar');
    sinon.assert.calledOnce(this.testValidator);
  });

  test('if eager, validates on initial render', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator eager=true}}>`);
    sinon.assert.calledOnce(this.testValidator);
  });

  test('if eager, validates if arguments change', async function() {
    this.testValidator = sinon.stub().returns([]);
    this.set('match', 'foo');
    await render(hbs`<input {{validity (fn this.testValidator this.match) eager=true}}>`);
    sinon.assert.calledOnce(this.testValidator);
    sinon.assert.calledWith(this.testValidator, 'foo');
    await this.set('match', 'foo-bar');
    sinon.assert.calledTwice(this.testValidator);
    sinon.assert.calledWith(this.testValidator, 'foo-bar');
  });

});
