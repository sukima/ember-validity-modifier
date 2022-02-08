import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Helper | form-data', function (hooks) {
  setupRenderingTest(hooks);

  test('Wraps a callback to pass in a FormData object', async function (assert) {
    let done = assert.async();

    this.testSubmit = (data, event) => {
      event.preventDefault();

      assert.ok(data instanceof FormData, 'expected a FormData instance');
      assert.equal(data.get('foo'), 'FOO');
      assert.equal(data.get('bar'), 'BAR');
      assert.equal(data.get('baz'), 'BAZ');

      done();
    };

    await render(hbs`
      <form {{on "submit" (form-data this.testSubmit)}}>
        <input type="text" name="foo" value="FOO">
        <input type="text" name="bar" value="BAR">
        <input type="text" name="baz" value="BAZ">
        <button type="submit"></button>
      </form>
    `);
    await click('button[type=submit]');
  });
});
