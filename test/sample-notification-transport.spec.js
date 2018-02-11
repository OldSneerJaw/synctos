const sampleSpecHelper = require('./helpers/sample-spec-helper.js');
const testHelper = require('../src/testing/test-helper.js');
const errorFormatter = testHelper.validationErrorFormatter;
const { expect } = require('chai');

describe('Sample business notification transport doc definition', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'notificationTransport';
  const expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

  function verifyAuthorizationCustomAction(docId, action) {
    expect(testHelper.requireAccess.callCount).to.equal(2);
    expect(testHelper.requireAccess.calls[1].arg).to.equal(docId + '-' + action);
  }

  function verifyNoAuthorizationCustomAction() {
    expect(testHelper.requireAccess.callCount).to.equal(1);
  }

  it('successfully creates a valid notification transport document', function() {
    const doc = {
      _id: 'biz.82.notificationTransport.ABC',
      type: 'email',
      recipient: 'foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 82, doc);
    verifyNoAuthorizationCustomAction();
  });

  it('cannot create a notification transport document when the properties are invalid', function() {
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

  it('successfully replaces a valid notification transport document', function() {
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

  it('cannot replace a notification transport document when the properties are invalid', function() {
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

  it('successfully deletes a notification transport document', function() {
    const oldDoc = {
      _id: 'biz.14.notificationTransport.ABC',
      type: 'email',
      recipient: 'different.foo.bar@example.com'
    };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 14, oldDoc);
    verifyAuthorizationCustomAction(oldDoc._id, 'delete');
  });
});
