const sampleSpecHelperMaker = require('./helpers/sample-spec-helper-maker');
const testFixtureMaker = require('../src/testing/test-fixture-maker');

describe('Sample Business config doc definition', () => {
  const testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/test-sample-sync-function.js');
  const errorFormatter = testFixture.validationErrorFormatter;
  const sampleSpecHelper = sampleSpecHelperMaker.init(testFixture);

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  function verifyBusinessConfigCreated(businessId, doc) {
    testFixture.verifyDocumentCreated(doc, sampleSpecHelper.getExpectedAuthorization([ `${businessId}-CHANGE_BUSINESS` ]));
  }

  function verifyBusinessConfigReplaced(businessId, doc, oldDoc) {
    testFixture.verifyDocumentReplaced(doc, oldDoc, sampleSpecHelper.getExpectedAuthorization([ `${businessId}-CHANGE_BUSINESS` ]));
  }

  function verifyBusinessConfigDeleted(businessId, oldDoc) {
    testFixture.verifyDocumentDeleted(oldDoc, sampleSpecHelper.getExpectedAuthorization([ `${businessId}-REMOVE_BUSINESS` ]));
  }

  function verifyBusinessConfigRejected(businessId, doc, oldDoc, expectedErrorMessages) {
    testFixture.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      'business',
      expectedErrorMessages,
      sampleSpecHelper.getExpectedAuthorization([ `${businessId}-CHANGE_BUSINESS` ]));
  }

  it('successfully creates a valid business document', () => {
    const doc = {
      _id: 'biz.2',
      _attachments: {
        'logo.gIf': {
          content_type: 'image/gif',
          length: 2097152
        }
      },
      businessLogoAttachment: 'logo.gIf',
      defaultInvoiceTemplate: {
        templateId: 'salmon'
      }
    };

    verifyBusinessConfigCreated(2, doc);
  });

  it('cannot create a business document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.5',
      businessLogoAttachment: 15,
      defaultInvoiceTemplate: { templateId: '', 'some-unrecognized-property': 'baz' },
      paymentProcessors: 0,
      'unrecognized-property1': 'foo'
    };

    verifyBusinessConfigRejected(
      5,
      doc,
      void 0,
      [
        errorFormatter.typeConstraintViolation('paymentProcessors', 'array'),
        errorFormatter.typeConstraintViolation('businessLogoAttachment', 'attachmentReference'),
        errorFormatter.mustNotBeEmptyViolation('defaultInvoiceTemplate.templateId'),
        errorFormatter.unsupportedProperty('defaultInvoiceTemplate.some-unrecognized-property'),
        errorFormatter.unsupportedProperty('unrecognized-property1')
      ]);
  });

  it('successfully replaces a valid business document', () => {
    const doc = { _id: 'biz.8', paymentProcessors: [ 'foo', 'bar' ], businessLogoAttachment: 'foobar.png' };
    const oldDoc = { _id: 'biz.8' };

    verifyBusinessConfigReplaced(8, doc, oldDoc);
  });

  it('cannot replace a business document when the properties are invalid', () => {
    const doc = {
      _id: 'biz.551',
      _attachments: {
        'bogus.mp3': {
          content_type: 'text/plain',
          length: 2097153
        },
        'invalid.xml': {
          content_type: 'application/xml',
          length: 773
        }
      },
      businessLogoAttachment: 'bogus.mp3',
      defaultInvoiceTemplate: { templateId: 6 },
      paymentProcessors: [ 'foo', 8 ],
      'unrecognized-property2': 'bar'
    };
    const oldDoc = { _id: 'biz.551' };

    verifyBusinessConfigRejected(
      551,
      doc,
      oldDoc,
      [
        errorFormatter.supportedExtensionsAttachmentReferenceViolation('businessLogoAttachment', [ 'png', 'gif', 'jpg', 'jpeg' ]),
        errorFormatter.supportedContentTypesAttachmentReferenceViolation('businessLogoAttachment', [ 'image/png', 'image/gif', 'image/jpeg' ]),
        errorFormatter.maximumSizeAttachmentViolation('businessLogoAttachment', 2097152),
        errorFormatter.maximumTotalAttachmentSizeViolation(2097664),
        errorFormatter.maximumIndividualAttachmentSizeViolation('invalid.xml', 512),
        errorFormatter.maximumAttachmentCountViolation(1),
        errorFormatter.supportedExtensionsRawAttachmentViolation('invalid.xml', [ 'txt' ]),
        errorFormatter.supportedContentTypesRawAttachmentViolation('invalid.xml', [ 'text/plain' ]),
        errorFormatter.requireAttachmentReferencesViolation('invalid.xml'),
        errorFormatter.typeConstraintViolation('defaultInvoiceTemplate.templateId', 'string'),
        errorFormatter.typeConstraintViolation('paymentProcessors[1]', 'string'),
        errorFormatter.unsupportedProperty('unrecognized-property2')
      ]);
  });

  it('successfully deletes a valid business document', () => {
    const oldDoc = { _id: 'biz.11' };

    verifyBusinessConfigDeleted(11, oldDoc);
  });
});
