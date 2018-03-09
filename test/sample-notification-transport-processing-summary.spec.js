const sampleSpecHelperMaker = require('./helpers/sample-spec-helper-maker');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Sample notification transport processing summary doc definition', () => {
  let testFixture;
  let errorFormatter;
  let sampleSpecHelper;

  beforeEach(() => {
    testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-sample-sync-function.js');
    errorFormatter = testFixture.validationErrorFormatter;
    sampleSpecHelper = sampleSpecHelperMaker.init(testFixture);
  });

  function verifyProcessingSummaryWritten(doc, oldDoc) {
    testFixture.verifyDocumentAccepted(doc, oldDoc, sampleSpecHelper.getExpectedAuthorization('notification-transport-write'));
  }

  function verifyProcessingSummaryNotWritten(doc, oldDoc, expectedErrorMessages) {
    testFixture.verifyDocumentRejected(
      doc,
      oldDoc,
      'notificationTransportProcessingSummary',
      expectedErrorMessages,
      sampleSpecHelper.getExpectedAuthorization('notification-transport-write'));
  }

  it('successfully creates a valid notification transport processing summary document', () => {
    const doc = {
      _id: 'biz.901.notification.ABC.processedTransport.XYZ',
      nonce: 'my-nonce',
      processedAt: '2016-06-04T21:02:19.013Z',
      processedBy: 'foobar',
      sentAt: '2016-06-04T21:02:55.013Z'
    };

    verifyProcessingSummaryWritten(doc);
  });

  it('cannot create a notification transport processing summary document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.109.notification.ABC.processedTransport.XYZ',
      processedBy: [ ],
      sentAt: '2016-06-04T21:02:55.9999Z'  // too many digits in the millisecond segment
    };

    verifyProcessingSummaryNotWritten(
      doc,
      void 0,
      [
        errorFormatter.requiredValueViolation('nonce'),
        errorFormatter.typeConstraintViolation('processedBy', 'string'),
        errorFormatter.requiredValueViolation('processedAt'),
        errorFormatter.datetimeFormatInvalid('sentAt')
      ]);
  });

  it('successfully replaces a valid notification transport processing summary document', () => {
    const doc = {
      _id: 'biz.119.notification.ABC.processedTransport.XYZ',
      nonce: 'my-nonce',
      processedAt: '2016-06-04T21:02:19.013Z'
    };
    const oldDoc = {
      _id: 'biz.119.notification.ABC.processedTransport.XYZ',
      nonce: 'my-nonce',
      processedBy: null,
      processedAt: '2016-06-04T21:02:19.013Z'
    };

    verifyProcessingSummaryWritten(doc, oldDoc);
  });

  it('cannot replace a notification transport processing summary document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.275.notification.ABC.processedTransport.XYZ',
      nonce: 471,
      processedAt: '2016-06-04T09:27:07.514Z',
      sentAt: ''
    };
    const oldDoc = {
      _id: 'biz.275.notification.ABC.processedTransport.XYZ',
      processedBy: 'foobar',
      processedAt: '2016-06-03T21:02:19.013Z',
      sentAt: '2016-07-15'
    };

    verifyProcessingSummaryNotWritten(
      doc,
      oldDoc,
      [
        errorFormatter.immutableItemViolation('nonce'),
        errorFormatter.typeConstraintViolation('nonce', 'string'),
        errorFormatter.immutableItemViolation('processedBy'),
        errorFormatter.immutableItemViolation('processedAt'),
        errorFormatter.datetimeFormatInvalid('sentAt'),
        errorFormatter.immutableItemViolation('sentAt')
      ]);
  });

  it('cannot delete a notification transport processing summary document because it is marked as undeletable', () => {
    const doc = { _id: 'biz.317.notification.ABC.processedTransport.XYZ', _deleted: true };
    const oldDoc = {
      _id: 'biz.317.notification.ABC.processedTransport.XYZ',
      processedBy: 'foobar',
      processedAt: '2016-06-04T21:02:19.013Z'
    };

    verifyProcessingSummaryNotWritten(doc, oldDoc, errorFormatter.cannotDeleteDocViolation());
  });
});
