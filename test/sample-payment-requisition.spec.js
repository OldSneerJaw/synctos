const sampleSpecHelper = require('./helpers/sample-spec-helper.js');
const testHelper = require('../src/testing/test-helper.js');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Sample invoice payment requisition doc definition', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'paymentRequisition';
  const expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

  it('successfully creates a valid payment requisition document', function() {
    const doc = {
      _id: 'paymentRequisition.foo-bar',
      invoiceRecordId: 10,
      businessId: 20,
      issuedAt: '2016-02-29T17:13:43.666Z',
      issuedByUserId: 42,
      invoiceRecipients: 'foo@bar.baz'
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 20, doc);
  });

  it('cannot create a payment requisition document when the properties are invalid', function() {
    const doc = {
      _id: 'paymentRequisition.foo-bar',
      invoiceRecordId: 0,
      businessId: '6',
      issuedAt: '2016-13-29T17:13:43.666Z', // The month is invalid
      issuedByUserId: 0,
      invoiceRecipients: [ 'foo@bar.baz' ],
      'unrecognized-property7': 'foo'
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      6,
      doc,
      expectedDocType,
      [
        errorFormatter.typeConstraintViolation('businessId', 'integer'),
        errorFormatter.minimumValueViolation('invoiceRecordId', 1),
        errorFormatter.datetimeFormatInvalid('issuedAt'),
        errorFormatter.minimumValueViolation('issuedByUserId', 1),
        errorFormatter.typeConstraintViolation('invoiceRecipients', 'string'),
        errorFormatter.unsupportedProperty('unrecognized-property7')
      ]);
  });

  it('cannot replace a payment requisition document because it is marked as irreplaceable', function() {
    const doc = {
      _id: 'paymentRequisition.foo-bar',
      invoiceRecordId: '7',
      businessId: 0,
      issuedAt: '2016-02-29T25:13:43.666Z', // The hour is invalid
      issuedByUserId: '42',
      invoiceRecipients: 15,
      'unrecognized-property8': 'bar'
    };
    const oldDoc = { _id: 'paymentRequisition.foo-bar', invoiceRecordId: 10, businessId: 20 };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      20,
      doc,
      oldDoc,
      expectedDocType,
      [
        'cannot change "businessId" property',
        errorFormatter.minimumValueViolation('businessId', 1),
        errorFormatter.typeConstraintViolation('invoiceRecordId', 'integer'),
        errorFormatter.datetimeFormatInvalid('issuedAt'),
        errorFormatter.typeConstraintViolation('issuedByUserId', 'integer'),
        errorFormatter.typeConstraintViolation('invoiceRecipients', 'string'),
        errorFormatter.unsupportedProperty('unrecognized-property8'),
        errorFormatter.cannotReplaceDocViolation()
      ]);
  });

  it('successfully deletes a payment requisition document', function() {
    const oldDoc = { _id: 'paymentRequisition.foo-bar', invoiceRecordId: 10, businessId: 17 };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 17, oldDoc);
  });
});
