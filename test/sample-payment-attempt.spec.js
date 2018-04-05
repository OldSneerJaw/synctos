const sampleSpecHelperMaker = require('./helpers/sample-spec-helper-maker');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Sample invoice payment processing attempt doc definition', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-sample-sync-function.js');
  const errorFormatter = testFixture.validationErrorFormatter;
  const sampleSpecHelper = sampleSpecHelperMaker.init(testFixture);

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  function verifyPaymentAttemptWritten(businessId, doc, oldDoc) {
    testFixture.verifyDocumentAccepted(doc, oldDoc, sampleSpecHelper.getExpectedAuthorization('payment-attempt-write'));
  }

  function verifyPaymentAttemptNotWritten(businessId, doc, oldDoc, expectedErrorMessages) {
    testFixture.verifyDocumentRejected(
      doc,
      oldDoc,
      'paymentAttempt',
      expectedErrorMessages,
      sampleSpecHelper.getExpectedAuthorization('payment-attempt-write'));
  }

  it('successfully creates a valid payment processing attempt document', () => {
    const doc = {
      _id: 'paymentAttempt.foo-bar',
      _attachments: { },
      businessId: 20,
      invoiceRecordId: 10,
      paymentRequisitionId: 'my-payment-requisition',
      paymentAttemptSpreedlyToken: 'my-spreedly-token',
      date: '2016-02-29',
      internalPaymentRecordId: 30,
      gatewayTransactionId: 'my-gateway-transaction',
      gatewayMessage: 'my-gateway-message',
      totalAmountPaid: 72838,
      totalAmountPaidFormatted: '$728.38'
    };

    verifyPaymentAttemptWritten(20, doc);
  });

  it('cannot create a payment processing attempt document when the properties are invalid', () => {
    const doc = {
      _id: 'paymentAttempt.foo-bar',
      businessId: 'my-business',
      paymentRequisitionId: '',
      paymentAttemptSpreedlyToken: '',
      date: '2016-00-30', // The month is invalid
      internalPaymentRecordId: 0,
      gatewayTransactionId: '',
      gatewayMessage: 17,
      totalAmountPaid: 'invalid',
      totalAmountPaidFormatted: 999,
      unsupportedProperty: 'foobar'
    };

    verifyPaymentAttemptNotWritten(
      'my-business',
      doc,
      void 0,
      [
        errorFormatter.typeConstraintViolation('businessId', 'integer'),
        errorFormatter.requiredValueViolation('invoiceRecordId'),
        errorFormatter.mustNotBeEmptyViolation('paymentRequisitionId'),
        errorFormatter.mustNotBeEmptyViolation('paymentAttemptSpreedlyToken'),
        errorFormatter.datetimeFormatInvalid('date'),
        errorFormatter.minimumValueViolation('internalPaymentRecordId', 1),
        errorFormatter.mustNotBeEmptyViolation('gatewayTransactionId'),
        errorFormatter.typeConstraintViolation('gatewayMessage', 'string'),
        errorFormatter.typeConstraintViolation('totalAmountPaid', 'integer'),
        errorFormatter.typeConstraintViolation('totalAmountPaidFormatted', 'string'),
        errorFormatter.unsupportedProperty('unsupportedProperty')
      ]);
  });

  it('cannot replace a payment processing attempt document because it is immutable', () => {
    const doc = {
      _id: 'paymentAttempt.foo-bar',
      businessId: 0,
      invoiceRecordId: 0,
      gatewayTransactionId: 7,
      gatewayMessage: true,
      totalAmountPaid: 0,
      totalAmountPaidFormatted: '',
      unsupportedProperty: 'foobar'
    };
    const oldDoc = {
      _id: 'paymentAttempt.foo-bar',
      businessId: 23,
      invoiceRecordId: 79,
      paymentRequisitionId: 'my-payment-req',
      paymentAttemptSpreedlyToken: 'my-spreedly-token',
      date: '2016-06-29'
    };

    verifyPaymentAttemptNotWritten(
      23,
      doc,
      oldDoc,
      [
        errorFormatter.immutableDocViolation(),
        errorFormatter.minimumValueViolation('businessId', 1),
        errorFormatter.minimumValueViolation('invoiceRecordId', 1),
        errorFormatter.requiredValueViolation('paymentRequisitionId'),
        errorFormatter.requiredValueViolation('paymentAttemptSpreedlyToken'),
        errorFormatter.requiredValueViolation('date'),
        errorFormatter.typeConstraintViolation('gatewayTransactionId', 'string'),
        errorFormatter.typeConstraintViolation('gatewayMessage', 'string'),
        errorFormatter.minimumValueViolation('totalAmountPaid', 1),
        errorFormatter.mustNotBeEmptyViolation('totalAmountPaidFormatted'),
        errorFormatter.unsupportedProperty('unsupportedProperty')
      ]);
  });

  it('cannot delete a valid payment processing attempt document because it is immutable', () => {
    const doc = { _id: 'paymentAttempt.foo-bar', _deleted: true };
    const oldDoc = { _id: 'paymentAttempt.foo-bar', businessId: 20 };

    verifyPaymentAttemptNotWritten(20, doc, oldDoc, [ errorFormatter.immutableDocViolation() ]);
  });
});
