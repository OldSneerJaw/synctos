const { expect } = require('chai');
const sampleSpecHelperMaker = require('./helpers/sample-spec-helper-maker');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Sample business notification transport doc definition', () => {
  let testFixture;
  let errorFormatter;
  let sampleSpecHelper;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-sample-sync-function.js');
    errorFormatter = testFixture.validationErrorFormatter;
    sampleSpecHelper = sampleSpecHelperMaker.init(testFixture);
  });

  const expectedDocType = 'notificationTransport';
  const expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

  function verifyAuthorizationCustomAction(docId, action) {
    expect(testFixture.testEnvironment.requireAccess.callCount).to.equal(2);
    expect(testFixture.testEnvironment.requireAccess.calls[1].arg).to.equal(`${docId}-${action}`);
  }

  function verifyNoAuthorizationCustomAction() {
    expect(testFixture.testEnvironment.requireAccess.callCount).to.equal(1);
  }

  it('successfully creates a valid notification transport document', () => {
    const doc = {
      _id: 'biz.82.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 82, doc);
    verifyNoAuthorizationCustomAction();
  });

  it('cannot create a notification transport document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.75.notificationTransport.ABC',
      recipient: ''
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      75,
      doc,
      expectedDocType,
      [ errorFormatter.requiredValueViolation('type'), errorFormatter.mustNotBeEmptyViolation('recipient') ]);
    verifyNoAuthorizationCustomAction();
  });

  it('successfully replaces a valid notification transport document', () => {
    const doc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };
    const oldDoc = {
      _id: 'biz.38.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 38, doc, oldDoc);
    verifyAuthorizationCustomAction(doc._id, 'replace');
  });

  it('cannot replace a notification transport document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.73.notificationTransport.ABC',
      type: 23,
    };
    const oldDoc = {
      _id: 'biz.73.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      73,
      doc,
      oldDoc,
      expectedDocType,
      [ errorFormatter.typeConstraintViolation('type', 'string'), errorFormatter.requiredValueViolation('recipient') ]);
    verifyAuthorizationCustomAction(doc._id, 'replace');
  });

  it('successfully deletes a notification transport document', () => {
    const oldDoc = {
      _id: 'biz.14.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 14, oldDoc);
    verifyAuthorizationCustomAction(oldDoc._id, 'delete');
  });
});
