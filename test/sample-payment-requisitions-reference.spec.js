const sampleSpecHelper = require('./helpers/sample-spec-helper');
const testHelper = require('../src/testing/test-helper');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Sample payment requisitions reference doc definition', () => {
  beforeEach(() => {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'paymentRequisitionsReference';
  const expectedBasePrivilege = 'INVOICE_PAYMENT_REQUISITIONS';

  it('successfully creates a valid payment requisitions reference document', () => {
    const doc = { _id: 'biz.92.invoice.15.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1', 'req2' ] };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 92, doc);
  });

  it('cannot create a payment requisitions reference document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.18.invoice.7.paymentRequisitions',
      paymentRequisitionIds: [ ],
      'unrecognized-property5': 'foo',
      paymentAttemptIds: 79
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      18,
      doc,
      expectedDocType,
      [
        errorFormatter.requiredValueViolation('paymentProcessorId'),
        errorFormatter.mustNotBeEmptyViolation('paymentRequisitionIds'),
        errorFormatter.typeConstraintViolation('paymentAttemptIds', 'array'),
        errorFormatter.unsupportedProperty('unrecognized-property5')
      ]);
  });

  it('successfully replaces a valid payment requisitions reference document', () => {
    const doc = { _id: 'biz.3612.invoice.222.paymentRequisitions', paymentProcessorId: 'bar', paymentRequisitionIds: [ 'req2' ] };
    const oldDoc = { _id: 'biz.3612.invoice.222.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1' ] };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 3612, doc, oldDoc);
  });

  it('cannot replace a payment requisitions reference document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.666.invoice.3.paymentRequisitions',
      paymentProcessorId: '',
      paymentRequisitionIds: [ 'foo', 15 ],
      'unrecognized-property6': 'bar',
      paymentAttemptIds: [ 73, 'bar' ]
    };
    const oldDoc = { _id: 'biz.666.invoice.3.paymentRequisitions', paymentProcessorId: 'foo', paymentRequisitionIds: [ 'req1' ] };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      666,
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.mustNotBeEmptyViolation('paymentProcessorId'),
        errorFormatter.typeConstraintViolation('paymentRequisitionIds[1]', 'string'),
        errorFormatter.typeConstraintViolation('paymentAttemptIds[0]', 'string'),
        errorFormatter.unsupportedProperty('unrecognized-property6')
      ]);
  });

  it('successfully deletes a payment requisitions reference document', () => {
    const oldDoc = { _id: 'biz.987.invoice.2.paymentRequisitions' };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 987, oldDoc);
  });
});
