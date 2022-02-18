/****************************************************/
/* Version 1.0.2                                    */
/* License MIT                                      */
/* Copyright (C) 2022 Devin Weaver                  */
/* https://tritarget.org/cdn/tests/validity-test.js */
/****************************************************/

import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import {
  setValidity,
  validate,
  verifyFormValidity
} from 'ember-validity-modifier/-private/validity';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';

const flushPromises = () => new Promise(r => setTimeout(r, 0));

module('validity.js', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`<div id="validity-fixture"></div>`);
    this.fixture = find('#validity-fixture');
    this.fixture.innerHTML = `<input><input><input>`;
    this.subjects = [...this.fixture.querySelectorAll('input')];
  });

  module('#setValidity', function() {
    test('returns a teardown function', async function(assert) {
      let validatorCalls = [];
      let validator1 = () => (validatorCalls.push(1), []);
      let validator2 = () => (validatorCalls.push(2), []);
      let [subject] = this.subjects;
      let teardown = setValidity(subject, validator1);
      teardown();
      setValidity(subject, validator2);
      await validate(subject);
      assert.deepEqual(validatorCalls, [2]);
    });

    test('sets custom validity', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), ['test-message']));
          subject.dispatchEvent(new FocusEvent('blur'));
        });
      }));
      await flushPromises();
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('validity can be set multiple times', async function(assert) {
      let [subject] = this.subjects;
      let validatorCalls = [];
      const validator = (id) => () => (validatorCalls.push(id), []);
      await new Promise(resolve => {
        setValidity(subject, undefined, { on: '' });
        setValidity(subject, validator(1), { on: '' });
        setValidity(subject, [validator(2), validator(3)], { on: '' });
        subject.addEventListener('validated', resolve);
        subject.dispatchEvent(new CustomEvent('validate'));
      });
      await flushPromises();
      assert.deepEqual(validatorCalls, [1, 2, 3]);
    });

    test('validates on custom events', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), ['test-message']), { on: 'foobar' });
          subject.dispatchEvent(new CustomEvent('foobar'));
        });
      }));
      await flushPromises();
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('passes element as argument to validator', async function(assert) {
      let calledArgs = [];
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          const validator = (...args) => {
            calledArgs.push(args);
            resolve();
            return ['test-message'];
          };
          setValidity(subject, validator, { on: '' });
          subject.dispatchEvent(new FocusEvent('validate'));
        });
      }));
      await flushPromises();
      assert.strictEqual(calledArgs[0][0], this.subjects[0]);
      assert.strictEqual(calledArgs[1][0], this.subjects[1]);
      assert.strictEqual(calledArgs[2][0], this.subjects[2]);
    });

    test(
      'dispatches the "validated" event with all errors in detail property',
      async function(assert) {
        let [subject] = this.subjects;
        let eventCalls = [];
        const validatedEventHandler = event => eventCalls.push(event);
        subject.addEventListener('validated', validatedEventHandler)
        subject.required = true;
        await new Promise(resolve => {
          const validator = () => (resolve(), ['test1', 'test2', 'test3']);
          setValidity(subject, validator, { on: '' });
          subject.dispatchEvent(new CustomEvent('validate'));
        });
        await flushPromises();
        assert.equal(eventCalls.length, 1);
        let { errors, customErrors, nativeErrors } = eventCalls[0].detail;
        assert.equal(errors.length, 4);
        assert.equal(customErrors.length, 3);
        assert.equal(nativeErrors.length, 1);
        assert.deepEqual(errors.slice(0, 3), ['test1', 'test2', 'test3']);
        assert.deepEqual(customErrors, ['test1', 'test2', 'test3']);
        assert.equal(typeof nativeErrors[0], 'string');
      }
    );

    test('bubbles the "validated" event', async function(assert) {
      let eventCalls = 0;
      document.addEventListener('validated', () => eventCalls++);
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          setValidity(subject, () => (resolve(), []), { on: '' });
          subject.dispatchEvent(new CustomEvent('validate'));
        });
      }));
      await flushPromises();
      assert.equal(eventCalls, 3);
    });

    test('dispatches "validated" event when target is non-form element', async function(assert) {
      this.fixture.innerHTML = `<div id="test-subject"></div>`;
      let eventDetail = null;
      let subject = document.getElementById('test-subject');
      document.addEventListener('validated', ({ detail }) => (eventDetail = detail));
      await new Promise(resolve => {
        setValidity(subject, () => (resolve(), ['test-invalid']), { on: '' });
        subject.dispatchEvent(new CustomEvent('validate'));
      });
      await flushPromises();
      assert.deepEqual(eventDetail, {
        customErrors: ['test-invalid'],
        nativeErrors: [],
        errors: ['test-invalid'],
      });
    });

    test('flattens multiple events in same validation execution', async function(assert) {
      let eventCalls = 0;
      let [subject] = this.subjects;
      await new Promise(resolve => {
        setValidity(subject, () => (eventCalls++, resolve(), []), { on: '' });
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
        subject.dispatchEvent(new CustomEvent('validate'));
      });
      await flushPromises();
      assert.equal(eventCalls, 1);
    });

    test('handles async tasks', async function(assert) {
      await Promise.all(this.subjects.map(subject => {
        return new Promise(resolve => {
          let handler = async () => {
            await new Promise(r => setTimeout(r, 10));
            resolve();
            return ['test-message'];
          };
          setValidity(subject, handler);
          subject.dispatchEvent(new CustomEvent('validate'));
        });
      }));
      await flushPromises();
      for (let input of this.subjects) {
        assert.equal(input.validationMessage, 'test-message');
        assert.strictEqual(input.validity.valid, false);
        assert.strictEqual(input.validity.customError, true);
      }
    });

    test('can be attached to wrapped DOM elements', async function(assert) {
      this.fixture.innerHTML = `<div id="test-subject"><input></div>`;
      let eventCalls = 0;
      let subject = document.querySelector('#test-subject');
      let input = document.querySelector('#test-subject > input');
      setValidity(subject, () => ['test-message']);
      subject.addEventListener('validated', () => eventCalls++);
      await validate(input);
      assert.equal(eventCalls, 1)
      assert.equal(input.validationMessage, 'test-message');
      assert.strictEqual(input.validity.valid, false);
      assert.strictEqual(input.validity.customError, true);
    });
  });

  module('#validate', function() {
    test('dispatches the "validate" event', async function(assert) {
      let eventCalls = 0;
      this.subjects.forEach(s => setValidity(s, undefined, { on: '' }));
      this.subjects.forEach(s => s.addEventListener('validate', () => eventCalls++));
      await validate(...this.subjects);
      assert.equal(eventCalls, 3);
    });

    test('will call validations', async function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      await validate(...this.subjects);
      assert.equal(validationCalls, 3);
    });

    test('handles async tasks', async function(assert) {
      let validationCalls = 0;
      let testValidate = async () => {
        await new Promise(r => setTimeout(r, 10));
        validationCalls++;
        return [];
      };
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      await validate(...this.subjects);
      assert.equal(validationCalls, 3);
    });

    test('handles null/undefined elements', async function(assert) {
      let validationCalls = 0;
      let testValidate = () => (validationCalls++, []);
      this.subjects.forEach(s => setValidity(s, testValidate, { on: '' }));
      await validate(...this.subjects, null, undefined);
      assert.equal(validationCalls, 3);
    });
  });

  module('#verifyFormValidity', function(hooks) {
    hooks.beforeEach(function() {
      this.fixture.innerHTML = `
        <div id="test-form-wrapper">
          <form id="test-form">
            <input type="text" name="foo" id="test-input">
            <button type="submit"><button>
          </form>
        </div>
      `;
      this.input = document.getElementById('test-input');
      this.wrapper = document.getElementById('test-form-wrapper');
      this.subject = document.getElementById('test-form');
      this.subject.addEventListener('submit', event => event.preventDefault());
      this.requestSubmit = () => this.subject.querySelector('[type=submit]').click();
    });

    test('calls native submit() by default', function(assert) {
      let done = assert.async();

      assert.expect(1);
      this.subject.submit = () => {
        assert.ok(true, 'native submit action called');
        done();
      };
      verifyFormValidity(this.subject);
      this.requestSubmit();
    });

    test('adds novalidate attribute', function(assert) {
      verifyFormValidity(this.subject);
      assert.ok(this.subject.noValidate, 'expected novalidate to be true');
    });

    test('handles bubbling to non-form element', function(assert) {
      let done = assert.async();
      let submit = () => {
        assert.ok(true, 'submit callback called');
        done();
      };
      assert.expect(1);
      verifyFormValidity(this.wrapper, { submit });
      this.requestSubmit();
    });

    test('called submit callback with all fields valid', function(assert) {
      let done = assert.async();
      let submit = () => {
        assert.ok(true, 'submit callback called');
        done();
      };
      assert.expect(1);
      verifyFormValidity(this.subject, { submit });
      setValidity(this.input, () => [], { on: '' });
      this.requestSubmit();
    });

    test('does not call submit callback with a field invalid', async function(assert) {
      let submit = () => {
        assert.notOk(true, 'submit callback should not have been called');
      };
      assert.expect(0);
      verifyFormValidity(this.subject, { submit });
      setValidity(this.input, () => ['test-message'], { on: '' });
      this.requestSubmit();
      await new Promise(r => setTimeout(r, 10));
    });
  });
});
