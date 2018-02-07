var sampleSpecHelper = require('./helpers/sample-spec-helper.js');
var testHelper = require('../src/testing/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('Sample business notifications reference doc definition', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  var expectedDocType = 'notificationsReference';
  var expectedBasePrivilege = 'NOTIFICATIONS';

  it('successfully creates a valid notifications reference document', function() {
    var doc = {
      _id: 'biz.4.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 4, doc);
  });

  it('cannot create a notifications reference document when the properties are invalid', function() {
    var doc = {
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

  it('successfully replaces a valid notifications reference document', function() {
    var doc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', 'A' ],
      unreadNotificationIds: [ 'X', 'Z', 'A' ]
    };
    var oldDoc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 44, doc, oldDoc);
  });

  it('cannot replace a notifications reference document when the properties are invalid', function() {
    var doc = {
      _id: 'biz.29.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', '' ],
      unreadNotificationIds: [ 'X', 'Z', 5 ]
    };
    var oldDoc = {
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

  it('successfully deletes a notifications reference document', function() {
    var oldDoc = {
      _id: 'biz.369.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 369, oldDoc);
  });
});
