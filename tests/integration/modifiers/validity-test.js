import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import {
  fillIn,
  find,
  render,
  resetOnerror,
  settled,
  setupOnerror
} from '@ember/test-helpers';
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

  test('prevents multiple modifiers on a single element', async function() {
    let onErrorSpy = sinon.spy();
    this.testValidator = sinon.stub().returns([]);
    setupOnerror(onErrorSpy);
    try {
      await render(hbs`
        <input
          {{validity this.testValidator on=""}}
          {{validity this.testValidator on=""}}
        >
      `);
    } finally {
      resetOnerror();
    }

    sinon.assert.calledWith(
      onErrorSpy,
      sinon.match({
        message: sinon.match(/Only one validity modifier can be applied to an element/),
      }),
    );
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

  test('validates on initial render if validator-update is present in list of events', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="validator-update"}}>`);
    sinon.assert.calledOnce(this.testValidator);
  });

  test('validates if validator-update event is present and arguments change', async function() {
    this.testValidator = sinon.stub().returns([]);
    this.set('match', 'foo');
    await render(hbs`<input {{validity (fn this.testValidator this.match) on="validator-update,change"}}>`);
    sinon.assert.calledOnce(this.testValidator);
    sinon.assert.calledWith(this.testValidator, 'foo');
    await this.set('match', 'foo-bar');
    sinon.assert.calledTwice(this.testValidator);
    sinon.assert.calledWith(this.testValidator, 'foo-bar');
    await fillIn('input', 'foo-bar');
    sinon.assert.calledThrice(this.testValidator);
  });

  test('validates on initial render if watch is true', async function() {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="" watch=true}}>`);
    sinon.assert.calledOnce(this.testValidator);
  });

  test('validates if watch is present and its argument changes', async function() {
    this.testValidator = sinon.stub().returns([]);
    this.set('match', 'foo');
    await render(hbs`<input {{validity
      (fn this.testValidator this.match)
      on="change"
      watch=this.match
    }}>`);
    this.set('match', 'foo-bar');
    await settled();
    await fillIn('input', 'foo-bar');
    sinon.assert.calledThrice(this.testValidator);
    sinon.assert.calledWith(this.testValidator.getCall(0), 'foo');
    sinon.assert.calledWith(this.testValidator.getCall(1), 'foo-bar');
    sinon.assert.calledWith(this.testValidator.getCall(2), 'foo-bar');
  });

  test('validates if watch is present and an array of arguments that change', async function() {
    this.testValidator = sinon.stub().returns([]);
    this.set('match1', 'foo1');
    this.set('match2', 'foo2');
    await render(hbs`<input {{validity
      (fn this.testValidator this.match1 this.match2)
      on="change"
      watch=(array this.match1 this.match2)
    }}>`);
    this.set('match1', 'foo1-bar');
    await settled();
    this.set('match2', 'foo2-bar');
    await settled();
    await fillIn('input', 'foo-bar');
    sinon.assert.callCount(this.testValidator, 4);
    sinon.assert.calledWith(this.testValidator.getCall(0), 'foo1', 'foo2');
    sinon.assert.calledWith(this.testValidator.getCall(1), 'foo1-bar', 'foo2');
    sinon.assert.calledWith(this.testValidator.getCall(2), 'foo1-bar', 'foo2-bar');
    sinon.assert.calledWith(this.testValidator.getCall(3), 'foo1-bar', 'foo2-bar');
  });

});
