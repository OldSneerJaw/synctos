const sampleSpecHelper = require('./helpers/sample-spec-helper.js');
const testHelper = require('../src/testing/test-helper.js');
const errorFormatter = testHelper.validationErrorFormatter;

describe('Sample payment processor definition doc definition', function() {
  beforeEach(function() {
    testHelper.initSyncFunction('build/sync-functions/test-sample-sync-function.js');
  });

  const expectedDocType = 'paymentProcessorDefinition';
  const expectedBasePrivilege = 'CUSTOMER_PAYMENT_PROCESSORS';

  it('successfully creates a valid payment processor document', function() {
    const doc = {
      _id: 'biz.3.paymentProcessor.2',
      provider: 'foo',
      spreedlyGatewayToken: 'bar',
      accountId: 555,
      displayName: 'Foo Bar',
      supportedCurrencyCodes: [ 'CAD', 'USD' ]
    };

    sampleSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 3, doc);
  });

  it('cannot create a payment processor document when the properties are invalid', function() {
    const doc = {
      _id: 'biz.1.paymentProcessor.2',
      provider: '',
      spreedlyGatewayToken: '',
      accountId: 0,
      displayName: 7,
      supportedCurrencyCodes: '',
      'unrecognized-property3': 'foo'
    };

    sampleSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      1,
      doc,
      expectedDocType,
      [
        errorFormatter.mustNotBeEmptyViolation('provider'),
        errorFormatter.mustNotBeEmptyViolation('spreedlyGatewayToken'),
        errorFormatter.minimumValueViolation('accountId', 1),
        errorFormatter.typeConstraintViolation('displayName', 'string'),
        errorFormatter.typeConstraintViolation('supportedCurrencyCodes', 'array'),
        errorFormatter.unsupportedProperty('unrecognized-property3')
      ]);
  });

  it('successfully replaces a valid payment processor document', function() {
    const doc = {
      _id: 'biz.5.paymentProcessor.2',
      provider: 'foobar',
      spreedlyGatewayToken: 'barfoo',
      accountId: 1
    };
    const oldDoc = { _id: 'biz.5.paymentProcessor.2', provider: 'bar' };

    sampleSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 5, doc, oldDoc);
  });

  it('cannot replace a payment processor document when the properties are invalid', function() {
    const doc = {
      _id: 'biz.2.paymentProcessor.2',
      accountId: 555.9,
      displayName: [ ],
      supportedCurrencyCodes: [ '666', 'CAD' ],
      'unrecognized-property4': 'bar'
    };
    const oldDoc = { _id: 'biz.2.paymentProcessor.2', provider: 'foo' };

    sampleSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      2,
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.regexPatternItemViolation('supportedCurrencyCodes[0]', /^[A-Z]{3}$/),
        errorFormatter.typeConstraintViolation('accountId', 'integer'),
        errorFormatter.typeConstraintViolation('displayName', 'string'),
        errorFormatter.requiredValueViolation('provider'),
        errorFormatter.requiredValueViolation('spreedlyGatewayToken'),
        errorFormatter.unsupportedProperty('unrecognized-property4')
      ]);
  });

  it('successfully deletes a payment processor document', function() {
    const oldDoc = { _id: 'biz.8.paymentProcessor.2' };

    sampleSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 8, oldDoc);
  });
});
