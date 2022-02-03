import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { fillIn, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Helper | form-errors', function (hooks) {
  setupRenderingTest(hooks);

  test('it tracks native errors in forms', async function (assert) {
    await render(hbs`
      {{#let (form-errors) as |subject|}}
        <form {{on "validated" subject.update}}>
          <input name="test" pattern="foo" {{validity}}>
        </form>
        <div id="errors">{{subject.for.test}}</div>
        <div id="native-errors">{{subject.native.test}}</div>
        <div id="custom-errors">{{subject.custom.test}}</div>
      {{/let}}
    `);
    await fillIn('[name=test]', 'bar');
    assert.dom('#errors').hasAnyText();
    assert.dom('#native-errors').hasAnyText();
    assert.dom('#custom-errors').hasNoText();
  });

  test('it tracks custom errors in forms', async function (assert) {
    this.testValiator = () => ['test-error'];
    await render(hbs`
      {{#let (form-errors) as |subject|}}
        <form {{on "validated" subject.update}}>
          <input name="test" {{validity this.testValiator}}>
        </form>
        <div id="errors">{{subject.for.test}}</div>
        <div id="native-errors">{{subject.native.test}}</div>
        <div id="custom-errors">{{subject.custom.test}}</div>
      {{/let}}
    `);
    await fillIn('[name=test]', 'bar');
    assert.dom('#errors').hasText('test-error');
    assert.dom('#native-errors').hasNoText();
    assert.dom('#custom-errors').hasText('test-error');
  });
});
