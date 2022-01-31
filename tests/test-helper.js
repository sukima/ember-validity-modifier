import Application from 'dummy/app';
import QUnit from 'qunit';
import config from 'dummy/config/environment';
import sinon from 'sinon';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

sinon.assert.pass = (assertion) => QUnit.assert.ok(true, assertion);
sinon.assert.fail = (assertion) => QUnit.assert.ok(false, assertion);

QUnit.testDone(() => sinon.restore());

setApplication(Application.create(config.APP));

start();
