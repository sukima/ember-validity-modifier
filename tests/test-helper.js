import Application from 'dummy/app';
import config from 'dummy/config/environment';
import * as QUnit from 'qunit';
import sinon from 'sinon';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

sinon.assert.pass = (assertion) => QUnit.assert.ok(true, assertion);
sinon.assert.fail = (assertion) => QUnit.assert.ok(false, assertion);

QUnit.testDone(() => sinon.restore());

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
