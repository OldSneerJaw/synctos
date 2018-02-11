const sampleSpecHelper = require('./helpers/sample-spec-helper');
const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Sample business notifications reference doc definition', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'notificationsReference';
  const expectedBasePrivilege = 'NOTIFICATIONS';

  it('successfully creates a valid notifications reference document', () => {
    const doc = {
      _id: 'biz.4.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 4, doc);
  });

  it('cannot create a notifications reference document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.123.notifications',
      allNotificationIds: [ 23, 'Y', 'Z' ],
      unreadNotificationIds: [ 'Z', '' ]
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      123,
      doc,
      expectedDocType,
      [
        errorFormatter.typeConstraintViolation('allNotificationIds[0]', 'string'),
        errorFormatter.mustNotBeEmptyViolation('unreadNotificationIds[1]')
      ]);
  });

  it('successfully replaces a valid notifications reference document', () => {
    const doc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', 'A' ],
      unreadNotificationIds: [ 'X', 'Z', 'A' ]
    };
    const oldDoc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 44, doc, oldDoc);
  });

  it('cannot replace a notifications reference document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.29.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', '' ],
      unreadNotificationIds: [ 'X', 'Z', 5 ]
    };
    const oldDoc = {
      _id: 'biz.29.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      29,
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.mustNotBeEmptyViolation('allNotificationIds[3]'),
        errorFormatter.typeConstraintViolation('unreadNotificationIds[2]', 'string')
      ]);
  });

  it('successfully deletes a notifications reference document', () => {
    const oldDoc = {
      _id: 'biz.369.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 369, oldDoc);
  });
});
