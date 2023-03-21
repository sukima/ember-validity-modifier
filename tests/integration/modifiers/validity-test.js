import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { fillIn, find, render, settled } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { validate } from 'ember-validity-modifier';
import {
  validatable,
  waitForValidated,
} from 'dummy/tests/helpers/wait-for-validated';
import sinon from 'sinon';
import { helper } from '@ember/component/helper';

module('Integration | Modifier | validity', function (hooks) {
  setupRenderingTest(hooks);

  test('single validator sets validity to true', async function (assert) {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('supports wrapped inputs', async function (assert) {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`
      <div {{validity this.testValidator on=""}}>
        <input>
      </div>
    `);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    sinon.assert.calledWith(this.testValidator, subject);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('handles multiple modifiers on a single element', async function () {
    this.testValidator1 = sinon.stub().returns([]);
    this.testValidator2 = sinon.stub().returns([]);
    this.testValidator3 = sinon.stub().returns([]);
    await render(hbs`
      <input
        {{validity this.testValidator1 on=""}}
        {{validity this.testValidator2 on=""}}
        {{validity this.testValidator3 on=""}}
      >
    `);
    await validate(find('input'));
    sinon.assert.calledOnce(this.testValidator1);
    sinon.assert.calledOnce(this.testValidator2);
    sinon.assert.calledOnce(this.testValidator3);
  });

  test('multiple validators sets validity to true', async function (assert) {
    this.testValidator1 = sinon.stub().returns([]);
    this.testValidator2 = sinon.stub().returns([]);
    this.testValidator3 = sinon.stub().returns([]);
    await render(hbs`
      <input {{validity
        this.testValidator1
        this.testValidator2
        this.testValidator3
        on=""
      }}>
    `);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator1);
    sinon.assert.calledOnce(this.testValidator2);
    sinon.assert.calledOnce(this.testValidator3);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('single validator sets validity to false', async function (assert) {
    this.testValidator = sinon.stub().returns(['test-invalid']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.strictEqual(subject.validationMessage, 'test-invalid');
  });

  test('multiple validators sets validity to false', async function (assert) {
    this.testValidator1 = sinon.stub().returns([]);
    this.testValidator2 = sinon.stub().returns(['test-invalid']);
    this.testValidator3 = sinon.stub().returns([]);
    await render(hbs`
      <input {{validity
        this.testValidator1
        this.testValidator2
        this.testValidator3
        on=""
      }}>
    `);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator1);
    sinon.assert.calledOnce(this.testValidator2);
    sinon.assert.calledOnce(this.testValidator3);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.strictEqual(subject.validationMessage, 'test-invalid');
  });

  test('single validator sets validity message to first failed error', async function (assert) {
    this.testValidator = sinon
      .stub()
      .returns(['test-invalid1', 'test-invalid2']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.strictEqual(subject.validationMessage, 'test-invalid1');
  });

  test('asynchonous validator can set validity to true', async function (assert) {
    this.testValidator = sinon.stub().resolves([]);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.ok(subject.validity.valid, 'expected validity to be valid');
    assert.strictEqual(subject.validationMessage, '');
  });

  test('asynchonous validator can set validity to false', async function (assert) {
    this.testValidator = sinon.stub().resolves(['test-invalid']);
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    await validate(subject);
    sinon.assert.calledOnce(this.testValidator);
    assert.notOk(subject.validity.valid, 'expected validity to be invalid');
    assert.strictEqual(subject.validationMessage, 'test-invalid');
  });

  test('flattens multiple events in same validation execution', async function () {
    let waitForValidations = new Promise((resolve) => {
      this.testValidator = sinon.stub().callsFake(() => (resolve(), []));
    });
    await render(hbs`<input {{validity this.testValidator on=""}}>`);
    let subject = find('input');
    subject.dispatchEvent(new CustomEvent('validate'));
    subject.dispatchEvent(new CustomEvent('validate'));
    subject.dispatchEvent(new CustomEvent('validate'));
    subject.dispatchEvent(new CustomEvent('validate'));
    subject.dispatchEvent(new CustomEvent('validate'));
    await waitForValidations;
    sinon.assert.calledOnce(this.testValidator);
  });

  test('auto validates on DOM events', async function () {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="change"}}>`);
    await fillIn('input', 'foobar');
    sinon.assert.calledOnce(this.testValidator);
  });

  test('auto validates on DOM events (comma-separated)', async function () {
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

  test('auto validates on DOM events defaults to change,', async function () {
    this.testValidator = sinon.stub().returns([]);
    await render(hbs`<input {{validity this.testValidator on="change"}}>`);
    await fillIn('input', 'foobar');
    sinon.assert.calledOnce(this.testValidator);
  });

  test('validates on initial render if validateImmediately is true', async function () {
    this.testValidator = sinon.stub().returns([]);
    await render(
      hbs`<input {{validity this.testValidator on="" validateImmediately=true}}>`
    );
    sinon.assert.calledOnce(this.testValidator);
  });

  test('validates non-input elements on initial render if validateImmediately is true', async function () {
    this.testValidator = sinon.stub().returns([]);
    await render(
      hbs`<div {{validity this.testValidator on="" validateImmediately=true}}><input></div>`
    );
    sinon.assert.calledOnce(this.testValidator);
  });

  test('validates if validateTracked is present and its argument changes', async function () {
    this.testValidator = sinon.stub().returns([]);
    this.set('match', 'foo');
    await render(hbs`<input {{validity
      (fn this.testValidator this.match)
      on="change"
      validateTracked=this.match
    }}>`);
    this.set('match', 'foo-bar');
    await settled();
    await fillIn('input', 'foo-bar');
    sinon.assert.calledTwice(this.testValidator);
    sinon.assert.calledWith(this.testValidator.getCall(0), 'foo-bar');
    sinon.assert.calledWith(this.testValidator.getCall(1), 'foo-bar');
  });

  test('validates if validateTracked is present and an array of arguments that change', async function () {
    this.testValidator = sinon.stub().returns([]);
    this.set('match1', 'foo1');
    this.set('match2', 'foo2');
    await render(hbs`<input {{validity
      (fn this.testValidator this.match1 this.match2)
      on="change"
      validateTracked=(array this.match1 this.match2)
    }}>`);
    this.set('match1', 'foo1-bar');
    await settled();
    this.set('match2', 'foo2-bar');
    await settled();
    await fillIn('input', 'foo-bar');
    sinon.assert.callCount(this.testValidator, 3);
    sinon.assert.calledWith(this.testValidator.getCall(0), 'foo1-bar', 'foo2');
    sinon.assert.calledWith(
      this.testValidator.getCall(1),
      'foo1-bar',
      'foo2-bar'
    );
    sinon.assert.calledWith(
      this.testValidator.getCall(2),
      'foo1-bar',
      'foo2-bar'
    );
  });

  test('manages updates through a helper without validateTracked', async function () {
    let validatorStub = sinon.stub().returns([]);
    this.owner.register(
      'helper:test-validator',
      // Use of [option] exercises this.match thus triggering autotracking
      helper(
        ([option]) =>
          (...args) =>
            validatorStub(option, ...args)
      )
    );
    this.set('match', 'foo');
    await render(hbs`<input {{validity (test-validator this.match) on=""}}>`);
    let subject = validatable(find('input'));
    subject.dispatchEvent(new CustomEvent('validate'));
    await waitForValidated(subject);
    this.set('match', 'foo-bar');
    await settled();
    subject.dispatchEvent(new CustomEvent('validate'));
    await waitForValidated(subject);
    sinon.assert.calledTwice(validatorStub);
    sinon.assert.calledWith(
      validatorStub.getCall(0),
      'foo',
      sinon.match.instanceOf(Element)
    );
    sinon.assert.calledWith(
      validatorStub.getCall(1),
      'foo-bar',
      sinon.match.instanceOf(Element)
    );
  });

  test('manages updates through a helper with validateImmediately true', async function () {
    let validatorStub = sinon.stub().returns([]);
    this.owner.register(
      'helper:test-validator',
      helper(
        ([option]) =>
          (...args) =>
            validatorStub(option, ...args)
      )
    );
    this.set('match', 'foo');
    await render(
      hbs`<input {{validity (test-validator this.match) on="" validateImmediately=true}}>`
    );
    this.set('match', 'foo-bar');
    await settled();
    sinon.assert.calledTwice(validatorStub);
    sinon.assert.calledWith(
      validatorStub.getCall(0),
      'foo',
      sinon.match.instanceOf(Element)
    );
    sinon.assert.calledWith(
      validatorStub.getCall(1),
      'foo-bar',
      sinon.match.instanceOf(Element)
    );
  });
});
