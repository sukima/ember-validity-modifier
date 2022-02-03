import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { FormErrors } from 'ember-validity-modifier/helpers/form-errors';

module('Unit | Helper | FormErrors', function (hooks) {
  setupTest(hooks);

  test('can update from detail object', function (assert) {
    let subject = new FormErrors();
    let detail = {
      errors: ['test-errors'],
      customErrors: ['test-custom-errors'],
      nativeErrors: ['test-native-errors'],
    };
    let target = { name: 'foo', validationMessage: 'test-validation-message' };
    subject.update({ detail, target });
    assert.deepEqual(subject.for.foo, ['test-errors']);
    assert.deepEqual(subject.native.foo, ['test-native-errors']);
    assert.deepEqual(subject.custom.foo, ['test-custom-errors']);
    assert.deepEqual(subject.message.foo, 'test-validation-message');
  });

  test('can update from validationMessage', function (assert) {
    let subject = new FormErrors();
    let target = { name: 'foo', validationMessage: 'test-validation-message' };
    subject.update({ target });
    assert.deepEqual(subject.for.foo, ['test-validation-message']);
    assert.deepEqual(subject.native.foo, ['test-validation-message']);
    assert.deepEqual(subject.custom.foo, []);
    assert.deepEqual(subject.message.foo, 'test-validation-message');
  });

  test('can set sepecific errors', function (assert) {
    let subject = new FormErrors();
    subject.set('foo', ['test-foo-error']);
    subject.set('bar', 'test-bar-error');
    subject.set('baz', {
      errors: ['test-baz-error'],
      customErrors: ['test-baz-error'],
      validationMessage: 'test-baz-error',
    });
    assert.deepEqual(subject.for.foo, ['test-foo-error']);
    assert.deepEqual(subject.native.foo, []);
    assert.deepEqual(subject.custom.foo, ['test-foo-error']);
    assert.deepEqual(subject.message.foo, 'test-foo-error');
    assert.deepEqual(subject.for.bar, ['test-bar-error']);
    assert.deepEqual(subject.native.bar, []);
    assert.deepEqual(subject.custom.bar, ['test-bar-error']);
    assert.deepEqual(subject.message.bar, 'test-bar-error');
    assert.deepEqual(subject.for.baz, ['test-baz-error']);
    assert.deepEqual(subject.native.baz, []);
    assert.deepEqual(subject.custom.baz, ['test-baz-error']);
    assert.deepEqual(subject.message.baz, 'test-baz-error');
  });
});
