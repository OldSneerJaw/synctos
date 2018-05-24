const testFixtureMaker = require('../src/testing/test-fixture-maker');
const errorFormatter = require('../src/testing/validation-error-formatter');

describe('Attachment reference validation type', () => {
  const testFixture =
    testFixtureMaker.initFromSyncFunction('build/sync-functions/test-attachment-reference-sync-function.js');

  afterEach(() => {
    testFixture.resetTestEnvironment();
  });

  describe('file extensions constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment reference with a valid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentReferencesDoc',
          staticExtensionsValidationProp: 'bar.htm'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentReferencesDoc',
          staticExtensionsValidationProp: 'bar.pdf'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('staticExtensionsValidationProp', [ 'html', 'htm' ]));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment reference with a valid file extension', () => {
        const doc = {
          _id: 'foo',
          type: 'attachmentReferencesDoc',
          dynamicExtensionsValidationProp: 'bar.txt',
          dynamicSupportedExtensions: [ 'txt' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid file extension', () => {
        const expectedSupportedExtensions = [ 'png', 'jpg', 'gif' ];
        const doc = {
          _id: 'foo',
          type: 'attachmentReferencesDoc',
          dynamicExtensionsValidationProp: 'bar.ico',
          dynamicSupportedExtensions: expectedSupportedExtensions
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.supportedExtensionsAttachmentReferenceViolation('dynamicExtensionsValidationProp', expectedSupportedExtensions));
      });
    });
  });

  describe('file content types constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment reference with a valid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentReferencesDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'application/pdf' }
          },
          type: 'attachmentReferencesDoc',
          staticContentTypesValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('staticContentTypesValidationProp', [ 'text/plain', 'text/html' ]));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment reference with a valid content type', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'text/plain' }
          },
          type: 'attachmentReferencesDoc',
          dynamicContentTypesValidationProp: 'foo.bar',
          dynamicSupportedContentTypes: [ 'text/plain' ]
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment reference with an invalid content type', () => {
        const expectedSupportedContentTypes = [ 'image/png', 'image/jpeg', 'image/gif' ];
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { content_type: 'application/pdf' }
          },
          type: 'attachmentReferencesDoc',
          dynamicContentTypesValidationProp: 'foo.bar',
          dynamicSupportedContentTypes: expectedSupportedContentTypes
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.supportedContentTypesAttachmentReferenceViolation('dynamicContentTypesValidationProp', expectedSupportedContentTypes));
      });
    });
  });

  describe('maximum size constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment smaller than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 200 }
          },
          type: 'attachmentReferencesDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 201 }
          },
          type: 'attachmentReferencesDoc',
          staticMaxSizeValidationProp: 'foo.bar'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.maximumSizeAttachmentViolation('staticMaxSizeValidationProp', 200));
      });
    });

    describe('with dynamic validation', () => {
      it('allows an attachment smaller than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 150 }
          },
          type: 'attachmentReferencesDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment larger than the maximum size', () => {
        const doc = {
          _id: 'foo',
          _attachments: {
            'foo.bar': { length: 151 }
          },
          type: 'attachmentReferencesDoc',
          dynamicMaxSizeValidationProp: 'foo.bar',
          dynamicMaxSize: 150
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.maximumSizeAttachmentViolation('dynamicMaxSizeValidationProp', 150));
      });
    });
  });

  describe('regular expression pattern constraint', () => {
    describe('with static validation', () => {
      it('allows an attachment whose name matches the pattern', () => {
        const doc = {
          _id: 'my-doc',
          type: 'attachmentReferencesDoc',
          staticRegexPatternValidationProp: 'a03.hc'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment whose name violates the pattern', () => {
        const doc = {
          _id: 'my-doc',
          type: 'attachmentReferencesDoc',
          staticRegexPatternValidationProp: '123ABC'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.attachmentReferenceRegexPatternViolation('staticRegexPatternValidationProp', /^[a-z][a-z0-9]*\.[a-z]+$/));
      });
    });

    describe('with dynamic validation', () => {
      const expectedRegexString = '^\\d+\\.[a-z]+$';

      it('allows an attachment whose name matches the pattern', () => {
        const doc = {
          _id: 'my-doc',
          type: 'attachmentReferencesDoc',
          dynamicRegexPattern: expectedRegexString,
          dynamicRegexPatternValidationProp: '66134.txt'
        };

        testFixture.verifyDocumentCreated(doc);
      });

      it('rejects an attachment whose name violates the pattern', () => {
        const doc = {
          _id: 'my-doc',
          type: 'attachmentReferencesDoc',
          dynamicRegexPattern: expectedRegexString,
          dynamicRegexPatternValidationProp: 'd.foo'
        };

        testFixture.verifyDocumentNotCreated(
          doc,
          'attachmentReferencesDoc',
          errorFormatter.attachmentReferenceRegexPatternViolation('dynamicRegexPatternValidationProp', new RegExp(expectedRegexString)));
      });
    });
  });
});
