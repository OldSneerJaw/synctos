const sampleSpecHelper = require('./helpers/sample-spec-helper');
const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Sample business notifications config doc definition', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'notificationsConfig';
  const expectedBasePrivilege = 'NOTIFICATIONS_CONFIG';

  it('successfully creates a valid notifications config document', function() {
    const doc = {
      _id: 'biz.1248.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [
            { transportId: 'ET1' },
            { transportId: 'ET2' }
          ]
        }
      }
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 1248, doc);
  });

  it('cannot create a notifications config document when the properties are invalid', function() {
    const doc = {
      _id: 'biz.72.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [
            { 'invalid-property': 'blah' },
            { transportId: '' }
          ]
        },
        'Invalid-Type': {
          enabledTransports: [ ]
        },
        '' : null
      },
      unknownprop: 23
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      72,
      doc,
      expectedDocType,
      [
        errorFormatter.unsupportedProperty('notificationTypes[invoicePayments].enabledTransports[0].invalid-property'),
        errorFormatter.requiredValueViolation('notificationTypes[invoicePayments].enabledTransports[0].transportId'),
        errorFormatter.mustNotBeEmptyViolation('notificationTypes[invoicePayments].enabledTransports[1].transportId'),
        errorFormatter.regexPatternHashtableKeyViolation('notificationTypes[Invalid-Type]', /^[a-zA-Z]+$/),
        errorFormatter.hashtableKeyEmpty('notificationTypes'),
        errorFormatter.regexPatternHashtableKeyViolation('notificationTypes[]', /^[a-zA-Z]+$/),
        errorFormatter.requiredValueViolation('notificationTypes[]'),
        errorFormatter.unsupportedProperty('unknownprop')
      ]);
  });

  it('successfully replaces a valid notifications config document', function() {
    const doc = {
      _id: 'biz.191.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [
            { transportId: 'ET1' },
            { transportId: 'ET2' },
            { transportId: 'ET4' }
          ]
        }
      }
    };
    const oldDoc = {
      _id: 'biz.191.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [ ]
        }
      }
    };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 191, doc, oldDoc);
  });

  it('cannot replace a notifications config document when the properties are invalid', function() {
    const doc = {
      _id: 'biz.37.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [
            { transportId: 'ET1' },
            { transportId: 'ET2', 'invalid-property': 73 },
            { transportId: 34 },
            null
          ]
        },
        foobar: null
      }
    };
    const oldDoc = {
      _id: 'biz.37.notificationsConfig',
      notificationTypes: { }
    };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      37,
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.unsupportedProperty('notificationTypes[invoicePayments].enabledTransports[1].invalid-property'),
        errorFormatter.typeConstraintViolation('notificationTypes[invoicePayments].enabledTransports[2].transportId', 'string'),
        errorFormatter.requiredValueViolation('notificationTypes[invoicePayments].enabledTransports[3]'),
        errorFormatter.requiredValueViolation('notificationTypes[foobar]')
      ]);
  });

  it('successfully deletes a notifications config document', function() {
    const oldDoc = {
      _id: 'biz.333.notificationsConfig',
      notificationTypes: {
        invoicePayments: {
          enabledTransports: [ 'ET1', 'ET2' ],
          disabledTransports: [ 'ET3' ]
        }
      }
    };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 333, oldDoc);
  });
});
