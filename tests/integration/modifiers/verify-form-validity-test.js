import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';

function requestSubmit(form) {
  form.querySelector('[type=submit]').click();
}

module('Integration | Modifier | verify-form-validity', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.preventInfinateRefreshLoop = (event) => event.preventDefault();
  });

  test('calls native submit() by default', async function () {
    await render(hbs`
      <form
        id="test-form"
        {{on "submit" this.preventInfinateRefreshLoop}}
        {{verify-form-validity}}
      >
        <button type="submit"></button>
      </form>
    `);
    let form = find('#test-form');
    let submitStub = sinon.stub(form, 'submit');
    let waitForSubmit = new Promise((done) => submitStub.callsFake(done));
    requestSubmit(form);
    await waitForSubmit;
    sinon.assert.called(submitStub);
  });

  test('adds novalidate attribute', async function (assert) {
    await render(hbs`
      <form
        id="test-form"
        {{on "submit" this.preventInfinateRefreshLoop}}
        {{verify-form-validity}}
      ></form>
    `);
    assert.ok(find('#test-form').noValidate, 'expected novalidate to be true');
  });

  test('handles bubbling to non-form element', async function () {
    this.submitStub = sinon.stub();
    let waitForSubmit = new Promise((done) => this.submitStub.callsFake(done));
    await render(hbs`
      <div
        id="test-form-wrapper"
        {{verify-form-validity submit=this.submitStub}}
      >
        <form
          id="test-form"
          {{on "submit" this.preventInfinateRefreshLoop}}
        >
          <button type="submit"></button>
        </form>
      </div>
    `);
    requestSubmit(find('#test-form'));
    await waitForSubmit;
    sinon.assert.called(this.submitStub);
  });

  test('called submit callback with all fields valid', async function () {
    this.submitStub = sinon.stub();
    this.testValidator = sinon.stub().returns([]);
    let waitForSubmit = new Promise((done) => this.submitStub.callsFake(done));
    await render(hbs`
      <form
        id="test-form"
        {{on "submit" this.preventInfinateRefreshLoop}}
        {{verify-form-validity submit=this.submitStub}}
      >
        <input {{validity this.testValidator on=""}}>
        <button type="submit"></button>
      </form>
    `);
    requestSubmit(find('#test-form'));
    await waitForSubmit;
    sinon.assert.called(this.submitStub);
    sinon.assert.called(this.testValidator);
  });

  test('does not call submit callback with a field invalid', async function () {
    this.submitStub = sinon.stub();
    this.testValidator = sinon.stub().returns(['test-message']);
    await render(hbs`
      <form
        id="test-form"
        {{on "submit" this.preventInfinateRefreshLoop}}
        {{verify-form-validity submit=this.submitStub}}
      >
        <input {{validity this.testValidator on=""}}>
        <button type="submit"></button>
      </form>
    `);
    requestSubmit(find('#test-form'));
    await new Promise((r) => setTimeout(r, 10));
    sinon.assert.called(this.testValidator);
    sinon.assert.notCalled(this.submitStub);
  });
});
